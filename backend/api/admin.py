from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import Project, ProjectMember, Task, User


@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    fieldsets = (*DefaultUserAdmin.fieldsets, ("Role", {"fields": ("role",)}),)
    list_display = ("email", "username", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email", "username")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "owner__email")
    filter_horizontal = ("members",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "assignee", "status", "due_date")
    list_filter = ("status",)
    search_fields = ("title", "project__name", "assignee__email")


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("project", "member")
    search_fields = ("project__name", "member__email")
