from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.query_params.get('user')
        if user in ['A', 'B']:
            qs = qs.filter(user=user)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Create a user message and generate a mock system response.
        The request body must contain: { "user": "A"|"B", "text": "..." }
        Returns a combined object containing response_text for convenience.
        """
        user = request.data.get('user')
        text = request.data.get('text', '')

        if user not in ['A', 'B']:
            return Response({'detail': "Field 'user' must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(text, str) or text.strip() == '':
            return Response({'detail': "Field 'text' must be a non-empty string."}, status=status.HTTP_400_BAD_REQUEST)

        # create the user-sent message
        user_msg = Message.objects.create(
            user=user,
            text=text,
            direction='sent',
            viewed=False,
        )

        # generate response_text based on user
        if user == 'A':
            response_text = 'Obrigado, Usuário A. Em breve nossa equipe retornará.'
        else:
            response_text = 'Recebido, Usuário B. Um especialista responderá logo.'

        # create corresponding system response message (direction='received')
        resp_msg = Message.objects.create(
            user=user,
            text=response_text,
            response_text='',
            direction='received',
            viewed=False,
        )

        # Update the user message to include response_text (as spec allows)
        user_msg.response_text = response_text
        user_msg.save(update_fields=['response_text'])

        # serialize the user message (with response_text)
        serializer = self.get_serializer(user_msg)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def mark_viewed(self, request):
        """
        POST /api/messages/mark_viewed/?user=A
        Marks all received messages for given user as viewed=True,
        and marks sent messages as viewed=True to simulate read receipts.
        """
        user = request.query_params.get('user')
        if user not in ['A', 'B']:
            return Response({'detail': "query param 'user' required and must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)

        msgs = Message.objects.filter(user=user).filter(direction__in=['received', 'sent'])
        msgs.update(viewed=True)
        return Response({'marked': True})

    @action(detail=False, methods=['post'])
    def delete_history(self, request):
        """
        POST /api/messages/delete_history/  { "user": "A" }
        Deletes all messages for a user. For safety we require 'user' in body.
        """
        user = request.data.get('user')
        if user not in ['A', 'B']:
            return Response({'detail': "body 'user' required and must be 'A' or 'B'."}, status=status.HTTP_400_BAD_REQUEST)
        Message.objects.filter(user=user).delete()
        return Response({'deleted': True})
