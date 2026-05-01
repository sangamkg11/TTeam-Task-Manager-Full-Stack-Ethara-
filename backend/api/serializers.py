from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Project, ProjectMember, Task

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "first_name", "last_name"]
        read_only_fields = ["id", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.MEMBER)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "role"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise ValidationError("A user with that email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["email"] = validated_data["email"].lower()
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProjectMemberSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "member"]


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    tasks = serializers.SerializerMethodField()
    member_emails = serializers.ListField(
        child=serializers.EmailField(), write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "members",
            "tasks",
            "member_emails",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "members", "tasks", "created_at"]

    def get_tasks(self, obj):
        return TaskSerializer(obj.tasks.all(), many=True).data

    def create(self, validated_data):
        member_emails = validated_data.pop("member_emails", [])
        user = self.context["request"].user
        project = Project.objects.create(owner=user, **validated_data)
        ProjectMember.objects.create(project=project, member=user)

        for email in member_emails:
            try:
                member = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"member_emails": f"User with email {email} does not exist."}
                )
            if member != user:
                ProjectMember.objects.get_or_create(project=project, member=member)

        return project


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    assignee_id = serializers.IntegerField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "due_date", "project", "assignee", "assignee_id", "created_at"]
        read_only_fields = ["id", "assignee", "created_at"]

    def validate(self, attrs):
        project = attrs.get("project")
        user = self.context["request"].user
        if project and not (
            user.role == user.Role.ADMIN
            or ProjectMember.objects.filter(project=project, member=user).exists()
            or project.owner == user
        ):
            raise serializers.ValidationError("You must be a member of the selected project.")
        return attrs

    def create(self, validated_data):
        assignee_id = validated_data.pop("assignee_id", None)
        task = Task.objects.create(**validated_data)
        if assignee_id:
            task.assignee_id = assignee_id
            task.save()
        return task

    def update(self, instance, validated_data):
        assignee_id = validated_data.pop("assignee_id", None)
        instance = super().update(instance, validated_data)
        if assignee_id is not None:
            instance.assignee_id = assignee_id
            instance.save()
        return instance
