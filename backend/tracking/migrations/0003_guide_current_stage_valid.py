from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0002_alter_guide_tracking_number"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="guide",
            constraint=models.CheckConstraint(
                condition=models.Q(
                    (
                        "current_stage__in",
                        [
                            "cargo_received",
                            "vehicle_loaded",
                            "vehicle_released",
                            "vehicle_in_transit",
                            "cargo_delivered",
                        ],
                    )
                ),
                name="current_stage_valid",
            ),
        ),
    ]
