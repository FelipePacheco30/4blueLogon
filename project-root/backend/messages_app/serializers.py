from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user', 'text', 'response_text', 'created_at', 'direction', 'viewed']
        read_only_fields = ['id', 'created_at', 'response_text', 'viewed']

    def validate_user(self, value):
        if value not in ['A', 'B']:
            raise serializers.ValidationError("user must be 'A' or 'B'")
        return value

    def validate_text(self, value):
        if not isinstance(value, str) or value.strip() == '':
            # permit empty for system-only, but when creating a sent message text must be provided
            return value
        return value
