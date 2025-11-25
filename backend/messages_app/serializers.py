from rest_framework import serializers
from .models import Message, Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['identifier', 'name', 'created_at']


class AccountCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

class AccountUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id','user','user_name','text','response_text','direction','viewed','created_at']
