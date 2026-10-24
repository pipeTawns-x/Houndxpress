from django.contrib import admin

from .models import Guide, StatusHistory


class StatusHistoryInline(admin.TabularInline):
    model = StatusHistory
    extra = 0
    readonly_fields = ["guide", "stage", "timestamp", "updated_by", "location", "note"]
    can_delete = False
    show_change_link = False

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = [
        "tracking_number",
        "origin",
        "destination",
        "recipient",
        "current_stage",
        "is_archived",
        "created_at",
    ]
    search_fields = ["tracking_number", "recipient"]
    list_filter = ["current_stage", "is_archived"]
    inlines = [StatusHistoryInline]
    readonly_fields = ["created_at", "updated_at"]

    def get_readonly_fields(self, request, obj=None):
        # La etapa solo cambia al registrar StatusHistory, que exige el orden.
        readonly_fields = [*super().get_readonly_fields(request, obj), "current_stage"]
        if obj is not None:
            readonly_fields.append("tracking_number")
        return readonly_fields


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ["guide", "stage", "timestamp", "updated_by", "location"]
    readonly_fields = ["guide", "stage", "timestamp", "updated_by", "location", "note"]
    search_fields = ["guide__tracking_number"]
    list_filter = ["stage"]
    list_select_related = ["guide", "updated_by"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions
