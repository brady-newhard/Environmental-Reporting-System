from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet
from .views_auth import verify_token

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('verify-token/', verify_token, name='verify_token'),
    path('', include(router.urls)),
]
