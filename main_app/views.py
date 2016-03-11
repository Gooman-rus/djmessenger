from django.views.generic import TemplateView
from django.views.decorators.csrf import requires_csrf_token


class MainView(TemplateView):
    template_name = 'index.html'

    #@requires_csrf_token
    def dispatch(self, *args, **kwargs):
        return super(MainView, self).dispatch(*args, **kwargs)