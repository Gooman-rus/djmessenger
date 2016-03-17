import hashlib
import random
import datetime

from django.core.mail import EmailMultiAlternatives
#from django.utils.datetime_safe import datetime


def my_send_email(self, email, username, activation_key, purpose='new'):
    print email
    print username
    subject = 'Account confirmation'
    link = '<a href=\"http://localhost:8000/#/confirm-email/%s\">Confirmation link</a>'% (activation_key)
    if purpose == 'new':
        body = "Hey %s, thanks for signing up. To activate your account, click this link within " \
               "48 hours. \n" % (username) + link
    if purpose == 'resend':
        body = "Hey %s. You asked us to resend the email confirmation. " \
               "To activate your account, click this link within " \
               "48 hours. \n"  % (username) + link
    if purpose == 'change':
        body = "Hey %s. You have changed your email. To confirm the email, click this link within " \
               "48 hours. \n"  % (username) + link

    from_email = 'Dj-Messenger Support <djngmessenger@gmail.com>'
    msg = EmailMultiAlternatives(subject, body, from_email, [email])
    msg.content_subtype = "html"
    msg.send(fail_silently=False)


def gen_activation_key(email):
    salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
    activation_key = hashlib.sha1(salt+email).hexdigest()
    key_expires = datetime.datetime.today() + datetime.timedelta(2)
    return activation_key, key_expires