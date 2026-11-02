"""Errores del contrato HTTP sin exponer detalles internos."""

from rest_framework.exceptions import APIException, NotAuthenticated, PermissionDenied
from rest_framework.views import exception_handler


class Conflict(APIException):
    status_code = 409

    def __init__(self, code, current_status):
        super().__init__(
            {
                "detail": "La operación entra en conflicto con el estado de la guía.",
                "code": code,
                "currentStatus": current_status,
            }
        )


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None or isinstance(exc, Conflict):
        return response
    codes = {400: "validation_error", 403: "permission_denied", 404: "not_found", 429: "throttled"}
    code = codes.get(response.status_code, getattr(exc, "default_code", "error"))
    request = context.get("request")
    if isinstance(exc, NotAuthenticated) or (
        isinstance(exc, PermissionDenied)
        and request
        and not request.user.is_authenticated
        and not str(exc).startswith("CSRF")
    ):
        code = "not_authenticated"
    if response.status_code == 400:
        detail = "Datos inválidos. Verifique los campos enviados."
    elif response.status_code == 404:
        detail = "No se encontró el recurso solicitado."
    else:
        detail = str(exc.detail) if hasattr(exc, "detail") else "No se permite esta operación."
    response.data = {"detail": detail, "code": code}
    return response


class ContractResponseMixin:
    def get_exception_handler(self):
        return api_exception_handler

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store"
        return response
