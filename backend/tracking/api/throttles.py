"""El rastreo consume una unidad por cada número solicitado, incluso repetido."""

from rest_framework.throttling import SimpleRateThrottle


class PublicTrackThrottle(SimpleRateThrottle):
    scope = "public_track"
    rate = None

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}

    def allow_request(self, request, view):
        # Las entradas inválidas usan el límite anónimo ordinario, sin consultar guías.
        from tracking.api.serializers import TrackQuerySerializer

        serializer = TrackQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return True
        weight = len(serializer.validated_data["numbers"])
        self.key = self.get_cache_key(request, view)
        self.history = self.cache.get(self.key, [])
        self.now = self.timer()
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()
        if len(self.history) + weight > self.num_requests:
            return self.throttle_failure()
        self.history = [self.now] * weight + self.history
        self.cache.set(self.key, self.history, self.duration)
        return True
