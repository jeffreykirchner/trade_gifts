# Generated by Django 4.2.7 on 2023-11-22 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0127_alter_parametersetnotice_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parameterset',
            name='enable_hats',
        ),
        migrations.AddField(
            model_name='parameterset',
            name='hat_mode',
            field=models.CharField(choices=[('No Hats', 'No Hats'), ('Non-Binding', 'Non-Binding'), ('Binding', 'Binding')], default='No Hats', max_length=100, verbose_name='Hat Mode'),
        ),
    ]
