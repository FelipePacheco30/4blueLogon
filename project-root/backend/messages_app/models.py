# messages_app/models.py
from django.db import models

class Message(models.Model):
    """
    Simple message model.
    - user: simple identifier like 'A' or 'B' (string)
    - user_name: display name (can be changed by frontend)
    - text: message text (user or system)
    - response_text: optional (if we store a linked response)
    - direction: 'sent' | 'received'
    - viewed: boolean
    - created_at: timestamp
    """
    USER_DIR_CHOICES = (
        ('sent', 'Sent'),
        ('received', 'Received'),
    )

    user = models.CharField(max_length=32, db_index=True)
    user_name = models.CharField(max_length=128, blank=True, default='')
    text = models.TextField()
    response_text = models.TextField(blank=True, default='')
    direction = models.CharField(max_length=12, choices=USER_DIR_CHOICES, default='sent')
    viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user} {self.direction} at {self.created_at}"
