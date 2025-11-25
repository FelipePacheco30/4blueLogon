from django.db import models
from django.utils import timezone
import uuid

class Account(models.Model):
    """
    Conta de usuário (A, B ou contas criadas).
    identifier: string pública usada pelo frontend (ex: 'A', 'B', '7f3a2c')
    name: display name
    password_hash: optional (Django's make_password)
    created_at: timestamp
    """
    identifier = models.CharField(max_length=48, primary_key=True)
    name = models.CharField(max_length=150, blank=True)
    password_hash = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.identifier} — {self.name or 'Usuário'}"


class Message(models.Model):
    """
    Armazena mensagens trocadas — direção 'sent' = do usuário para o sistema,
    'received' = resposta do sistema.
    We keep 'user' as the account identifier string to be robust with legacy data.
    """
    id = models.AutoField(primary_key=True)
    user = models.CharField(max_length=48, db_index=True)
    user_name = models.CharField(max_length=150, blank=True) 
    text = models.TextField(blank=True)
    response_text = models.TextField(blank=True)
    direction = models.CharField(max_length=16, choices=(("sent","sent"),("received","received")))
    viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user} {self.direction} {self.created_at.isoformat()}"
