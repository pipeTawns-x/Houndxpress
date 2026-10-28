from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_department"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
    ]
