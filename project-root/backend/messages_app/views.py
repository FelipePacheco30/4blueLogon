# backend/messages_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
import random

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.query_params.get('user')
        if user in ['A', 'B']:
            qs = qs.filter(user=user)

        direction = self.request.query_params.get('direction')
        if direction in ['sent', 'received']:
            qs = qs.filter(direction=direction)

        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(text__icontains=search) | Q(response_text__icontains=search)
            )

        return qs

    def create(self, request, *args, **kwargs):
        """
        Create a user message and generate a mock system response.
        Response text chosen randomly from a set of 5 messages.
        """
        user = request.data.get('user')
        text = request.data.get('text', '')

        if user not in ['A', 'B']:
            return Response({'detail': "Field 'user' must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(text, str) or text.strip() == '':
            return Response({'detail': "Field 'text' must be a non-empty string."}, status=status.HTTP_400_BAD_REQUEST)

        # create the user-sent message (no response_text stored here)
        user_msg = Message.objects.create(
            user=user,
            text=text,
            direction='sent',
            viewed=False,
        )

        # 5 possible responses (customize as needed)
        responses_for_A = [
            "Obrigado, Usuário A. Em breve nossa equipe retornará.",
            "Recebemos sua mensagem, Usuário A — já encaminhamos para o time.",
            "Perfeito, Usuário A! Em instantes alguém irá falar com você.",
            "Sua solicitação foi registrada, Usuário A. Acompanhe por aqui.",
            "Obrigado! Um especialista entrará em contato em breve, Usuário A."
        ]
        responses_for_B = [
            "Recebido, Usuário B. Um especialista responderá logo.",
            "Mensagem entregue, Usuário B — estamos analisando.",
            "Ótimo, Usuário B. Em breve teremos retorno.",
            "Sua demanda foi registrada, Usuário B. Fique atento às atualizações.",
            "Obrigado, Usuário B. Já repassamos ao time responsável."
        ]

        if user == 'A':
            response_text = random.choice(responses_for_A)
        else:
            response_text = random.choice(responses_for_B)

        # create corresponding system response message (direction='received')
        resp_msg = Message.objects.create(
            user=user,
            text=response_text,
            response_text='',
            direction='received',
            viewed=False,
        )

        # serialize the user message (without response_text stored)
        serializer = self.get_serializer(user_msg)
        data = serializer.data
        data['response_text'] = response_text
        data['response_id'] = resp_msg.id

        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def mark_viewed(self, request):
        user = request.query_params.get('user')
        if user not in ['A', 'B']:
            return Response({'detail': "query param 'user' required and must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)

        msgs = Message.objects.filter(user=user, direction__in=['received', 'sent'])
        msgs.update(viewed=True)
        return Response({'marked': True})

    @action(detail=False, methods=['post'])
    def delete_history(self, request):
        user = request.data.get('user')
        if user not in ['A', 'B']:
            return Response({'detail': "body 'user' required and must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)
        deleted_count, _ = Message.objects.filter(user=user).delete()
        return Response({'deleted': True, 'deleted_count': deleted_count})
