from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserListViewSet,
    UserRegistration,
    ReportViewSet,
    ContactListView,
    PunchlistItemViewSet,
    login,
    verify_token,
    logout
)

router = DefaultRouter()
router.register(r'users', UserListViewSet, basename='user')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'contacts', ContactListView, basename='contact')
router.register(r'reports/(?P<report_id>[^/.]+)/punchlist-items', PunchlistItemViewSet, basename='punchlist-item')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
    path('verify-token/', verify_token, name='verify-token'),
    path('logout/', logout, name='logout'),
    path('register/', UserRegistration.as_view(), name='register'),
] 