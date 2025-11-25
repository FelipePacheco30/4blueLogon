from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "direction", "created_at", "viewed")
    list_filter = ("user", "direction", "viewed", "created_at")
    search_fields = ("text", "response_text")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
