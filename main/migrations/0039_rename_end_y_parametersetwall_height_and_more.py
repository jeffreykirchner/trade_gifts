# Generated by Django 4.2.3 on 2023-07-17 20:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0038_parametersetwall_info'),
    ]

    operations = [
        migrations.RenameField(
            model_name='parametersetwall',
            old_name='end_y',
            new_name='height',
        ),
        migrations.RenameField(
            model_name='parametersetwall',
            old_name='end_x',
            new_name='width',
        ),
    ]
