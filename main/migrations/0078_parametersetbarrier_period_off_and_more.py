# Generated by Django 4.2.3 on 2023-08-23 18:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0077_alter_parametersetbarrier_rotation'),
    ]

    operations = [
        migrations.AddField(
            model_name='parametersetbarrier',
            name='period_off',
            field=models.IntegerField(default=14, verbose_name='Period Off'),
        ),
        migrations.AddField(
            model_name='parametersetbarrier',
            name='period_on',
            field=models.IntegerField(default=1, verbose_name='Period On'),
        ),
    ]
