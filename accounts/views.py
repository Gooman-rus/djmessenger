from django.core.serializers import serialize
from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseBadRequest, HttpResponse
from tastypie import serializers

from models import Accounts

class MainView(TemplateView):
    template_name = 'index.html'
    #model = Accounts

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(MainView, self).dispatch(*args, **kwargs)