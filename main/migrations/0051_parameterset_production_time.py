# Generated by Django 4.2.3 on 2023-07-26 01:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0050_remove_parameterset_tokens_per_period_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameterset',
            name='production_time',
            field=models.IntegerField(default=10, verbose_name='Production Time'),
        ),
    ]