from django.urls import path, include

urlpatterns = [
    path('api/', include('messages_app.urls')),
]
