"""Rutas por número de guía y alias de compatibilidad."""

from django.urls import path

from tracking.api.views import GuideViewSet, PublicTrackView

collection = GuideViewSet.as_view({"get": "list", "post": "create"})
detail = GuideViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"})
urlpatterns = [
    path("api/v1/guides/", collection),
    path("api/v1/guides/summary/", GuideViewSet.as_view({"get": "summary"})),
    path("api/v1/guides/<str:tracking_number>/", detail),
    path("api/v1/guides/<str:tracking_number>/history/", GuideViewSet.as_view({"get": "history"})),
    path("api/v1/guides/<str:tracking_number>/advance/", GuideViewSet.as_view({"post": "update"})),
    path("api/v1/public/track/", PublicTrackView.as_view()),
    path("api/crear-guia/", GuideViewSet.as_view({"post": "create"})),
    path("api/obtener-guia/<str:tracking_number>/", GuideViewSet.as_view({"get": "retrieve"})),
    path("api/actualizar-guia/<str:tracking_number>/", GuideViewSet.as_view({"put": "update"})),
    path("api/eliminar-guia/<str:tracking_number>/", GuideViewSet.as_view({"delete": "destroy"})),
]
