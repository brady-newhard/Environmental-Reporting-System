from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Contact

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'

class ContactInline(admin.StackedInline):
    model = Contact
    can_delete = False
    verbose_name_plural = 'Contact Information'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline, ContactInline)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'get_discipline', 'is_staff')
    list_filter = ('profile__role', 'profile__discipline', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    
    def get_role(self, obj):
        return obj.profile.role if hasattr(obj, 'profile') else 'No role'
    get_role.short_description = 'Role'
    
    def get_discipline(self, obj):
        return obj.profile.discipline if hasattr(obj, 'profile') else 'No discipline'
    get_discipline.short_description = 'Discipline'

# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'discipline', 'created_at')
    list_filter = ('role', 'discipline', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
    ordering = ('user__username',)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'phone_number')
    ordering = ('user__username',)
