from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

DEPARTMENT_FIELDSET = ("Departamento", {"fields": ("department",)})


class StaffUserAdmin(UserAdmin):
    list_display = (*UserAdmin.list_display, "department")
    fieldsets = (*UserAdmin.fieldsets, DEPARTMENT_FIELDSET)
    add_fieldsets = (*UserAdmin.add_fieldsets, DEPARTMENT_FIELDSET)


admin.site.register(User, StaffUserAdmin)
