# Generated by Django 4.2.3 on 2023-09-12 19:42

import django.core.serializers.json
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0103_alter_parametersetpatch_shock_level_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parametersetpatch',
            name='shock_level',
        ),
        migrations.AddField(
            model_name='parametersetpatch',
            name='shock_levels',
            field=models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True, verbose_name='Levels'),
        ),
    ]
