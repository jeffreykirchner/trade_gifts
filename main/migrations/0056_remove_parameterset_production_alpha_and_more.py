# Generated by Django 4.2.3 on 2023-07-26 22:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0055_rename_production_time_parameterset_production_effort'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parameterset',
            name='production_alpha',
        ),
        migrations.RemoveField(
            model_name='parameterset',
            name='production_omega',
        ),
        migrations.RemoveField(
            model_name='parameterset',
            name='production_rho',
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_one_alpha',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good One Production Alpha'),
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_one_omega',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good One Production Omega'),
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_one_rho',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good One Production Rho'),
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_two_alpha',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good Two Production Alpha'),
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_two_omega',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good Two Production Omega'),
        ),
        migrations.AddField(
            model_name='parametersetfieldtype',
            name='good_two_rho',
            field=models.DecimalField(decimal_places=5, default=1, max_digits=6, verbose_name='Good Two Production Rho'),
        ),
        migrations.AlterField(
            model_name='parameterset',
            name='production_effort',
            field=models.IntegerField(default=10, verbose_name='Production Effort'),
        ),
    ]
