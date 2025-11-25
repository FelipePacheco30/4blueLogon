from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.MessageListCreateView.as_view(), name='messages-list-create'),
    path('messages/mark_viewed/', views.MarkViewedView.as_view(), name='messages-mark-viewed'),
    path('messages/delete_history/', views.DeleteHistoryView.as_view(), name='messages-delete-history'),

    path('accounts/', views.AccountCreateView.as_view(), name='accounts-create'),           
    path('accounts/<str:identifier>/', views.AccountDetailView.as_view(), name='accounts-detail'),

    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
]
