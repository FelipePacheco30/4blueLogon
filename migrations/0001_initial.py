# Generated minimal migration for Message model
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(choices=[('A', 'Usuário A'), ('B', 'Usuário B')], max_length=1)),
                ('text', models.TextField(blank=True)),
                ('response_text', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('direction', models.CharField(choices=[('sent', 'sent'), ('received', 'received')], default='sent', max_length=10)),
                ('viewed', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['user'], name='messages_app_mes_user_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['created_at'], name='messages_app_mes_created_idx'),
        ),
    ]
