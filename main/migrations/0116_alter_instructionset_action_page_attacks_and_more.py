# Generated by Django 4.2.5 on 2023-09-28 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0115_parameterset_enable_hats'),
    ]

    operations = [
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_attacks',
            field=models.IntegerField(default=6, verbose_name='Required Action: Attack'),
        ),
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_harvest',
            field=models.IntegerField(default=3, verbose_name='Required Action: Harvest'),
        ),
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_house',
            field=models.IntegerField(default=4, verbose_name='Required Action: House'),
        ),
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_move',
            field=models.IntegerField(default=1, verbose_name='Required Action: Move'),
        ),
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_sleep',
            field=models.IntegerField(default=5, verbose_name='Required Action: Sleep'),
        ),
    ]