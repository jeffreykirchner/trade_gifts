# Generated by Django 4.2.3 on 2023-08-08 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0059_alter_parametersetfieldtype_good_one_alpha_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameterset',
            name='health_loss_per_second',
            field=models.DecimalField(decimal_places=2, default=1.0, max_digits=3, verbose_name='Health Loss per Second'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='heath_gain_per_sleep_second',
            field=models.DecimalField(decimal_places=2, default=0.25, max_digits=4, verbose_name='Health Gain per Sleep Second'),
        ),
    ]
