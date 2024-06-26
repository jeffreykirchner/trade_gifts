# Generated by Django 4.2.13 on 2024-06-25 17:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0130_session_replay_data'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='session',
            options={'base_manager_name': 'objects', 'ordering': ['-start_date'], 'verbose_name': 'Session', 'verbose_name_plural': 'Sessions'},
        ),
        migrations.AddField(
            model_name='parametersetbarrier',
            name='period_on_modulus',
            field=models.IntegerField(default=100, verbose_name='Period On Modulus'),
        ),
    ]
