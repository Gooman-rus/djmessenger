from __future__ import unicode_literals

from aptdaemon.enums import _

from django.db import models
from datetime import date


class Accounts(models.Model):
     login = models.CharField(max_length=30)
     password = models.CharField(max_length=30)
     email = models.EmailField(max_length=100)
     birthdate = models.DateField(_("Date"), default=date.today)