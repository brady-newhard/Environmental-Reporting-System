from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login, verify_token, logout,
    ReportViewSet,
    UserRegistration,
    UserListView,
    ContactListView
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
    path('verify-token/', verify_token, name='verify-token'),
    path('logout/', logout, name='logout'),
    path('register/', UserRegistration.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('contacts/', ContactListView.as_view(), name='contact-list'),
] 