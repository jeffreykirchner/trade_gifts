# Generated by Django 4.2.3 on 2023-07-24 05:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0044_alter_parametersetfield_parameter_set_field_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='parametersetplayer',
            name='house_x',
            field=models.IntegerField(default=50, verbose_name='House Location X'),
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='house_y',
            field=models.IntegerField(default=50, verbose_name='House Location Y'),
        ),
    ]
