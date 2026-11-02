"""Adaptadores HTTP; los casos de uso viven en tracking.services."""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from tracking import services
from tracking.api.errors import ContractResponseMixin
from tracking.api.serializers import (
    AdvanceGuideSerializer,
    CreateGuideSerializer,
    GuideSerializer,
    HistorySerializer,
    PublicGuideSerializer,
    TrackQuerySerializer,
)
from tracking.api.throttles import PublicTrackThrottle


class GuidePagination(CursorPagination):
    ordering = "-created_at"
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class GuideViewSet(ContractResponseMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def list(self, request):
        paginator = GuidePagination()
        guides = paginator.paginate_queryset(
            services.list_guides(search=request.query_params.get("search", "")), request
        )
        return paginator.get_paginated_response(GuideSerializer(guides, many=True).data)

    def create(self, request):
        serializer = CreateGuideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guide = services.create_guide(serializer.validated_data, request.user)
        return Response(GuideSerializer(guide).data, status=201)

    def retrieve(self, request, tracking_number):
        return Response(GuideSerializer(services.get_guide(tracking_number)).data)

    def update(self, request, tracking_number):
        # Resolver primero garantiza 404 para un número inexistente, incluso sin payload.
        services.get_guide(tracking_number)
        serializer = AdvanceGuideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guide = services.advance_guide(tracking_number, serializer.validated_data, request.user)
        return Response(GuideSerializer(guide).data)

    def destroy(self, request, tracking_number):
        services.archive_guide(tracking_number)
        return Response(status=204)

    @action(detail=True, methods=["get"])
    def history(self, request, tracking_number):
        guide = services.get_guide(tracking_number)
        return Response(HistorySerializer(guide.status_history.all(), many=True).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(services.guide_summary())


class PublicTrackView(ContractResponseMixin, APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle, PublicTrackThrottle]

    def get(self, request):
        serializer = TrackQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        numbers = serializer.validated_data["numbers"]
        guides = services.public_guides(numbers)
        return Response(
            [
                PublicGuideSerializer(guides[number]).data
                if number in guides
                else {"trackingNumber": number, "found": False}
                for number in numbers
            ]
        )
