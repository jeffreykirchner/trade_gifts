# Generated by Django 4.2.3 on 2023-08-23 16:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0074_parametersetbarrier'),
    ]

    operations = [
        migrations.AddField(
            model_name='parametersetbarrier',
            name='groups',
            field=models.ManyToManyField(related_name='parameter_set_barriers_b', to='main.parametersetgroup'),
        ),
        migrations.AlterField(
            model_name='parametersetbarrier',
            name='parameter_set',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_barriers_a', to='main.parameterset'),
        ),
    ]
