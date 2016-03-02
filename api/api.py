from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource

from accounts.models import Accounts

class AccountsResource(ModelResource):
     """
     API Facet
     """
     class Meta:
         queryset = Accounts.objects.all()
         resource_name = 'accounts'
         allowed_methods = ['post', 'get', 'patch', 'delete']
         authentication = Authentication()
         authorization = Authorization()
         alwayss_return_data = True