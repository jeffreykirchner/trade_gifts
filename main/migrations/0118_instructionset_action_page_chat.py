# Generated by Django 4.2.5 on 2023-10-10 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0117_parameterset_avatar_animation_speed_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='instructionset',
            name='action_page_chat',
            field=models.IntegerField(default=7, verbose_name='Required Action: Chat'),
        ),
    ]
