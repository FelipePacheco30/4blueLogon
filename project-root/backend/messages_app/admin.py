from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'direction', 'created_at', 'viewed')
    list_filter = ('user', 'direction', 'viewed')
    search_fields = ('text', 'response_text')
    ordering = ('-created_at',)
