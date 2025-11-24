# messages_app/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET /api/messages/?user=A[&search=...&direction=sent|received&page=...]
    POST /api/messages/  with body { user, user_name?, text }
    """
    serializer_class = MessageSerializer
    queryset = Message.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.query_params.get('user')
        search = self.request.query_params.get('search')
        direction = self.request.query_params.get('direction')
        if user:
            qs = qs.filter(user=user)
        if direction in ('sent', 'received'):
            qs = qs.filter(direction=direction)
        if search:
            q = search.strip()
            qs = qs.filter(Q(text__icontains=q) | Q(response_text__icontains=q))
        qs = qs.order_by('created_at')  # ascending
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data or {}
        user = data.get('user')
        text = data.get('text', '')
        user_name = data.get('user_name', '') or ''
        if not user or not text:
            return Response({'detail': 'user and text required'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user message
        msg = Message.objects.create(
            user=user,
            user_name=user_name,
            text=text,
            direction='sent',
            viewed=False
        )

        # Create a system response message (simulate auto-reply)
        display_name = user_name or (f'Usuário {user}')
        auto_responses = [
            f"Obrigado, {display_name}. Em breve nossa equipe retornará.",
            f"Recebemos sua mensagem, {display_name} — já encaminhamos para o time.",
            f"Perfeito, {display_name}! Em instantes alguém irá falar com você.",
            f"Sua solicitação foi registrada, {display_name}. Acompanhe por aqui.",
            f"Obrigado! Um especialista entrará em contato em breve, {display_name}.",
        ]
        import random
        resp_text = random.choice(auto_responses)

        resp = Message.objects.create(
            user=user,
            user_name=user_name,
            text=resp_text,
            direction='received',
            viewed=False
        )

        out = {
            'id': msg.id,
            'user': msg.user,
            'user_name': msg.user_name,
            'text': msg.text,
            'response_text': resp_text,
            'created_at': msg.created_at,
            'response_id': resp.id
        }
        return Response(out, status=status.HTTP_201_CREATED)

# messages_app/views.py (continued)
class MarkViewedView(APIView):
    """
    POST /api/messages/mark_viewed/?user=A
    Marks all messages for given user as viewed.
    Accepts query param 'user'. Returns { changed: n }.
    """
    def post(self, request):
        user = request.query_params.get('user')
        if not user:
            return Response({'detail': 'user query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        msgs = Message.objects.filter(user=user, viewed=False)
        count = msgs.update(viewed=True)
        return Response({'changed': count}, status=status.HTTP_200_OK)


class DeleteHistoryView(APIView):
    """
    POST /api/messages/delete_history/
    JSON body: { "user": "A" } - deletes messages for that user
    """
    def post(self, request):
        user = request.data.get('user') if request.data else None
        if not user:
            return Response({'detail': 'user field required in JSON body'}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = Message.objects.filter(user=user).delete()
        return Response({'deleted_count': deleted}, status=status.HTTP_200_OK)
