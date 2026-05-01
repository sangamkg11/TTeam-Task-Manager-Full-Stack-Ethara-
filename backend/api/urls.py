from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    DashboardView,
    ProjectAddMemberView,
    ProjectDetailView,
    ProjectListCreateView,
    RegisterView,
    TaskDetailView,
    TaskListCreateView,
    UserListView,
)

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("projects/<int:pk>/members/", ProjectAddMemberView.as_view(), name="project-add-member"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("tasks/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("users/", UserListView.as_view(), name="user-list"),
]
