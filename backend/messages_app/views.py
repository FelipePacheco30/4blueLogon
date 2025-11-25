from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.hashers import make_password, check_password
from .models import Message, Account
from .serializers import MessageSerializer, AccountSerializer, AccountCreateSerializer, AccountUpdateSerializer
import uuid
from django.utils import timezone

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET /api/messages/?user=ID  -> paginated messages for that user
    POST /api/messages/         -> create a message (user sends) and create an automated response
    """
    serializer_class = MessageSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.query_params.get('user')
        qs = Message.objects.all()
        if user:
            qs = qs.filter(user=user)
        return qs.order_by('created_at')

    def create(self, request, *args, **kwargs):
        """
        Expected payload: { user: 'A'|'id', text: '...', user_name?: '...' }
        We'll persist the user message (direction='sent') and then persist a system reply (direction='received').
        The system reply text uses the current account name if available.
        """
        data = request.data
        user_id = (data.get('user') or '').strip()
        text = data.get('text', '') or ''
        account = None
        try:
            account = Account.objects.get(pk=user_id)
            display_name = account.name or (f"Usuário {user_id}")
        except Account.DoesNotExist:
            display_name = data.get('user_name') or (f"Usuário {user_id}")

        if not user_id:
            return Response({'detail':'user is required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            now = timezone.now()
            msg = Message.objects.create(
                user=user_id,
                user_name=display_name,
                text=text,
                response_text='',
                direction='sent',
                viewed=False,
                created_at=now
            )
            templates = [
                f"Obrigado, {display_name}. Em breve nossa equipe retornará.",
                f"Recebemos sua mensagem, {display_name} — já encaminhamos para o time.",
                f"Perfeito, {display_name}! Em instantes alguém irá falar com você.",
                f"Sua solicitação foi registrada, {display_name}. Acompanhe por aqui.",
                f"Obrigado! Um especialista entrará em contato em breve, {display_name}."
            ]
            idx = now.microsecond % len(templates)
            response_text = templates[idx]

            resp = Message.objects.create(
                user=user_id,
                user_name=display_name,
                text=response_text,
                response_text='',
                direction='received',
                viewed=False,
                created_at=timezone.now()
            )

        out = {
            'id': msg.id,
            'user': msg.user,
            'user_name': msg.user_name,
            'text': msg.text,
            'response_text': response_text,
            'created_at': msg.created_at,
            'response_id': resp.id
        }
        return Response(out, status=status.HTTP_201_CREATED)


class MarkViewedView(APIView):
    """
    POST /api/messages/mark_viewed/?user=A
    Marks all messages for user as viewed (both received and sent if needed)
    """
    def post(self, request, *args, **kwargs):
        user = request.query_params.get('user') or request.data.get('user')
        if not user:
            return Response({'detail':'user param required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Message.objects.filter(user=user, viewed=False)
        changed = qs.update(viewed=True)
        return Response({'changed': changed}, status=status.HTTP_200_OK)


class DeleteHistoryView(APIView):
    """
    POST /api/messages/delete_history/
    body: { "user": "A" }
    """
    def post(self, request, *args, **kwargs):
        body_user = request.data.get('user') or request.query_params.get('user')
        if not body_user:
            return Response({'detail':'user required'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = Message.objects.filter(user=body_user).delete()
        return Response({'deleted_count': deleted}, status=status.HTTP_200_OK)

class AccountCreateView(APIView):
    """
    POST /api/accounts/  -> create account with {name, password}
    Returns identifier (generated) and name.
    """
    def post(self, request, *args, **kwargs):
        s = AccountCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
        name = s.validated_data['name']
        password = s.validated_data.get('password') or ''
        ident = uuid.uuid4().hex[:8]
        password_hash = make_password(password) if password else ''
        acct = Account.objects.create(identifier=ident, name=name, password_hash=password_hash)
        return Response({'identifier': acct.identifier, 'name': acct.name, 'created_at': acct.created_at}, status=status.HTTP_201_CREATED)


class AccountDetailView(APIView):
    """
    GET /api/accounts/<identifier>/  -> get account by identifier field
    PUT /api/accounts/<identifier>/  -> update name and/or password (body)
    DELETE /api/accounts/<identifier>/ -> delete account (A/B cannot be deleted)
    """

    def get(self, request, identifier):
        acct = get_object_or_404(Account, identifier=identifier)
        ser = AccountSerializer(acct)
        return Response(ser.data)

    def put(self, request, identifier):
        acct = get_object_or_404(Account, identifier=identifier)
        s = AccountUpdateSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
        data = s.validated_data
        name = data.get('name')
        password = data.get('password')
        if name:
            acct.name = name
        if password is not None:
            acct.password_hash = make_password(password) if password else ''
        acct.save()
        return Response({'identifier': acct.identifier, 'name': acct.name}, status=status.HTTP_200_OK)

    def delete(self, request, identifier):
        if identifier in ('A', 'B'):
            return Response({'detail':'Builtin accounts cannot be deleted'}, status=status.HTTP_403_FORBIDDEN)
        acct = get_object_or_404(Account, identifier=identifier)
        acct.delete()
        return Response({'deleted': True}, status=status.HTTP_200_OK)

class LoginView(APIView):
    """
    POST /api/auth/login/ body: { identifier: 'A'|'id', password?: '...' }
    For identifier A/B, password optional and will login by id only.
    For created accounts with password set, password must match.
    Returns account basic info.
    """
    def post(self, request, *args, **kwargs):
        identifier = (request.data.get('identifier') or '').strip()
        password = request.data.get('password')
        if not identifier:
            return Response({'detail':'identifier required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            acct = Account.objects.get(pk=identifier)
        except Account.DoesNotExist:
            return Response({'detail':'account not found'}, status=status.HTTP_404_NOT_FOUND)
        if acct.password_hash:
            if not password:
                return Response({'detail':'password required'}, status=status.HTTP_400_BAD_REQUEST)
            if not check_password(password, acct.password_hash):
                return Response({'detail':'senha incorreta'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'identifier': acct.identifier, 'name': acct.name}, status=status.HTTP_200_OK)
