from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Project, ProjectMember, Task
from .permissions import IsProjectMember, IsProjectOwnerOrAdmin
from .serializers import (
    ProjectSerializer,
    RegisterSerializer,
    TaskSerializer,
    UserSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email.lower(), password=password)
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(id=response.data["id"])
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == self.request.user.Role.ADMIN:
            return Project.objects.all().distinct().prefetch_related("members", "tasks")
        return Project.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().prefetch_related("members", "tasks")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"projects": serializer.data})


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.prefetch_related("members", "tasks")

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated(), IsProjectMember()]
        return [permissions.IsAuthenticated(), IsProjectOwnerOrAdmin()]


class ProjectAddMemberView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        project = generics.get_object_or_404(Project, pk=pk)
        if project.owner != request.user and request.user.role != User.Role.ADMIN:
            return Response({"detail": "Only the project owner or admin may add members."}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        ProjectMember.objects.get_or_create(project=project, member=member)
        return Response({"detail": "Member added."})


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == self.request.user.Role.ADMIN:
            return Task.objects.all().select_related("project", "assignee").distinct()
        return Task.objects.filter(
            Q(project__owner=self.request.user) | Q(project__members=self.request.user)
        ).select_related("project", "assignee").distinct()

    def perform_create(self, serializer):
        serializer.save()


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    queryset = Task.objects.select_related("project", "assignee")


class DashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == request.user.Role.ADMIN:
            tasks = Task.objects.all().select_related("project", "assignee").distinct()
        else:
            tasks = Task.objects.filter(
                Q(project__owner=request.user) | Q(project__members=request.user)
            ).select_related("project", "assignee").distinct()

        counts = {"TODO": 0, "IN_PROGRESS": 0, "DONE": 0, "overdue": 0}
        overdue_tasks = []
        now = timezone.now()

        for task in tasks:
            counts[task.status] += 1
            if task.due_date and task.due_date < now and task.status != Task.Status.DONE:
                counts["overdue"] += 1
                overdue_tasks.append(TaskSerializer(task).data)

        return Response({"counts": counts, "tasks": TaskSerializer(tasks, many=True).data, "overdue_tasks": overdue_tasks})
