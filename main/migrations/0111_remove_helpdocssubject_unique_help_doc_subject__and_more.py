# Generated by Django 4.2.3 on 2023-09-17 21:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0110_alter_helpdocssubject_instruction_set'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='helpdocssubject',
            name='unique_help_doc_subject  ',
        ),
        migrations.AddConstraint(
            model_name='helpdocssubject',
            constraint=models.UniqueConstraint(fields=('instruction_set', 'title'), name='unique_help_doc_subject'),
        ),
    ]
