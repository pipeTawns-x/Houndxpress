# Generado por Django 5.2.17 el 2026-10-23 a las 09:27

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="guide",
            name="tracking_number",
            field=models.CharField(
                max_length=22,
                unique=True,
                validators=[
                    django.core.validators.RegexValidator(
                        "^(21[0-9]{14}|[A-Z0-9]{22})$",
                        "Número de guía inválido: 16 dígitos que empiezan con 21 o 22 caracteres alfanuméricos en mayúscula.",
                    )
                ],
            ),
        ),
    ]
