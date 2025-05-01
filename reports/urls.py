from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import ReportViewSet, UserRegistration, ContactListView

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'contacts', ContactListView, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    path('users/', UserRegistration.as_view(), name='user-registration'),
    path('token/', obtain_auth_token, name='api-token'),
] 