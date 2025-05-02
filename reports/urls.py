from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet,
    UserRegistration,
    ContactListView,
    UserListView,
    login,
    verify_token,
    logout
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'contacts', ContactListView, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', UserRegistration.as_view(), name='user-registration'),
    path('token/', login, name='token-login'),
    path('token/verify/', verify_token, name='token-verify'),
    path('token/logout/', logout, name='token-logout'),
] 