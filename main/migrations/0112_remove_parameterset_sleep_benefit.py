# Generated by Django 4.2.3 on 2023-09-20 20:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0111_remove_helpdocssubject_unique_help_doc_subject__and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parameterset',
            name='sleep_benefit',
        ),
    ]