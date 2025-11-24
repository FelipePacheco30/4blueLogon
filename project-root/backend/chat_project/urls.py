# chat_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('messages_app.urls')),  # adiciona as rotas /api/messages/...
]
