from __future__ import unicode_literals

import django
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    avatar = models.CharField(max_length=40, default='0')
    activation_key = models.CharField(max_length=40, blank=True)
    key_expires = models.DateTimeField(default=django.utils.timezone.now)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = u'User profiles'