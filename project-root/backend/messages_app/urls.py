# messages_app/urls.py
from django.urls import path
from .views import MessageListCreateView, MarkViewedView, DeleteHistoryView

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='messages-list-create'),
    path('messages/mark_viewed/', MarkViewedView.as_view(), name='messages-mark-viewed'),
    path('messages/delete_history/', DeleteHistoryView.as_view(), name='messages-delete-history'),
]
