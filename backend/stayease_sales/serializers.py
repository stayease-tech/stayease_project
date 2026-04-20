# zoho_esign/serializers.py
from rest_framework import serializers
from .models import Document, SigningRequest
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class DocumentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class SigningRequestSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    recipient_email = serializers.EmailField(source='document.recipient_email', read_only=True)
    recipient_name = serializers.CharField(source='document.recipient_name', read_only=True)
    
    class Meta:
        model = SigningRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']