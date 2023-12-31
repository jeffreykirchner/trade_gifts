# Generated by Django 4.2.3 on 2023-08-24 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0078_parametersetbarrier_period_off_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parametersetbarrier',
            name='info',
            field=models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info'),
        ),
        migrations.AlterField(
            model_name='parametersetbarrier',
            name='text',
            field=models.CharField(default='Closed until period N', max_length=100, verbose_name='Text'),
        ),
        migrations.AlterField(
            model_name='parametersetground',
            name='info',
            field=models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info'),
        ),
        migrations.AlterField(
            model_name='parametersetnotice',
            name='text',
            field=models.CharField(blank=True, default='Info Here', max_length=200, null=True, verbose_name='Info'),
        ),
        migrations.AlterField(
            model_name='parametersetwall',
            name='info',
            field=models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info'),
        ),
    ]
