# Generated by Django 4.2.3 on 2023-09-12 19:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0102_remove_parametersetpatch_drought_level_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parametersetpatch',
            name='shock_level',
            field=models.IntegerField(default=1, verbose_name='Shock Level'),
        ),
        migrations.AlterField(
            model_name='parametersetpatch',
            name='shock_on_period',
            field=models.IntegerField(default=14, verbose_name='Shock On Period'),
        ),
    ]
