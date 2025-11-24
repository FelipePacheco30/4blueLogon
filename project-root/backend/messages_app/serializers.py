# messages_app/serializers.py
from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user', 'user_name', 'text', 'response_text', 'direction', 'viewed', 'created_at']
        read_only_fields = ['id', 'created_at']
