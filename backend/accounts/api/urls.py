"""Rutas de autenticación de la aplicación."""

from django.urls import path

from accounts.api.views import CSRFView, LoginView, LogoutView, MeView

urlpatterns = [
    path("csrf/", CSRFView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
]
