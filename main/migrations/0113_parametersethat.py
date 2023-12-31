# Generated by Django 4.2.3 on 2023-09-20 22:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0112_remove_parameterset_sleep_benefit'),
    ]

    operations = [
        migrations.CreateModel(
            name='ParameterSetHat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('info', models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info')),
                ('texture', models.CharField(default='Name Here', verbose_name='Texture Name')),
                ('scale', models.DecimalField(decimal_places=2, default=1, max_digits=3)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_hats', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Hat',
                'verbose_name_plural': 'Parameter Set Hats',
                'ordering': ['id'],
            },
        ),
    ]
