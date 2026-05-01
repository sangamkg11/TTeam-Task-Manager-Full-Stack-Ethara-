from rest_framework import permissions
from .models import ProjectMember


class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "project"):
            project = obj.project
        else:
            project = obj
        return project.owner == request.user or ProjectMember.objects.filter(project=project, member=request.user).exists()


class IsProjectOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.role == request.user.Role.ADMIN
