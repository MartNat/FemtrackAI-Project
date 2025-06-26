# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PatientProfileViewSet, DoctorProfileViewSet, ScreeningRecordViewSet
from rest_framework.authtoken.views import obtain_auth_token # For simple token authentication

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'patients', PatientProfileViewSet)
router.register(r'doctors', DoctorProfileViewSet)
router.register(r'screenings', ScreeningRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token-auth/', obtain_auth_token), # Endpoint for obtaining auth token
]