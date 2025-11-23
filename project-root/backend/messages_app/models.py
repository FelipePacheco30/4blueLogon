from django.db import models

class Message(models.Model):
    USER_CHOICES = [('A', 'Usuário A'), ('B', 'Usuário B')]
    DIRECTION_CHOICES = [('sent', 'sent'), ('received', 'received')]

    user = models.CharField(max_length=1, choices=USER_CHOICES)
    text = models.TextField(blank=True)                # texto enviado pelo usuário (or empty for system-only)
    response_text = models.TextField(blank=True)       # resposta mockada do sistema
    created_at = models.DateTimeField(auto_now_add=True)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='sent')
    viewed = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_user_display()} ({self.direction}) @ {self.created_at.isoformat()}"
