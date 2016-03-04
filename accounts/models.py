from __future__ import unicode_literals

from aptdaemon.enums import _

from django.db import models
from datetime import date
from django.contrib.auth.models import User


class Accounts(models.Model):
     user = models.OneToOneField(User, on_delete=models.CASCADE)
     birthdate = models.DateField(_("Date"), default=date.today)
     activation_key = models.CharField(max_length=50, default='12345test')
     activated = models.BooleanField(default=False)