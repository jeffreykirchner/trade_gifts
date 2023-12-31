# Generated by Django 4.2.3 on 2023-07-27 19:08

import django.core.serializers.json
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0057_sessionperiod_consumption_completed_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='world_state_avatars',
            field=models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True, verbose_name='Current Avatar State'),
        ),
    ]
