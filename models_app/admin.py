from django.contrib import admin

# Register your models here.
from models_app.models import *


# class UserAccountAdmin(admin.ModelAdmin):
#     list_display = ("first_name", "last_name")


admin.site.register(Company)
admin.site.register(CompanyPhoto)
admin.site.register(EntrepreneurAccount)
admin.site.register(InvestorAccount)
admin.site.register(Stock)
admin.site.register(UserAccount)
