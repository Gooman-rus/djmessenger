from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from accounts.models import Accounts


# class AccountsInline(admin.StackedInline):
#     model = Accounts
#     can_delete = False
#     verbose_name_plural = 'accounts'
#
# # Define a new User admin
# class UserAdmin(BaseUserAdmin):
#     inlines = (AccountsInline, )
#
# admin.site.unregister(User)
# admin.site.register(User, UserAdmin)