from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MEMBER = "MEMBER", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.MEMBER)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name="owned_projects", on_delete=models.CASCADE)
    members = models.ManyToManyField(User, through="ProjectMember", related_name="projects")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "TODO", "To Do"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        DONE = "DONE", "Done"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    due_date = models.DateTimeField(null=True, blank=True)
    project = models.ForeignKey(Project, related_name="tasks", on_delete=models.CASCADE)
    assignee = models.ForeignKey(User, related_name="assigned_tasks", null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ProjectMember(models.Model):
    project = models.ForeignKey(Project, related_name="memberships", on_delete=models.CASCADE)
    member = models.ForeignKey(User, related_name="project_memberships", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "member")

    def __str__(self):
        return f"{self.member.email} in {self.project.name}"
