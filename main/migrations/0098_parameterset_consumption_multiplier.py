# Generated by Django 4.2.3 on 2023-09-11 15:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0097_parametersetgrove_info'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameterset',
            name='consumption_multiplier',
            field=models.TextField(blank=True, default='', verbose_name='Consumption 3rd Good'),
        ),
    ]