from tastypie.authorization import DjangoAuthorization, Authorization
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.resources import ModelResource
from django.contrib.auth.models import User
from tastypie.authentication import SessionAuthentication, Authentication
from django.contrib.auth import authenticate, login, logout
from tastypie.http import HttpUnauthorized, HttpForbidden
from django.conf.urls import url
from tastypie.utils import trailing_slash

from tastypie_extras.exceptions import CustomBadRequest


class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        fields = ['first_name']
        allowed_methods = ['get', 'post']
        resource_name = 'user'
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
            url(r'^(?P<resource_name>%s)/logged_in%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logged_in'), name='api_logged_in'),
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.body, format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        password = data.get('password', '')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True,
                    'username': user.username
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                }, HttpForbidden )
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
            }, HttpUnauthorized )

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })
        else:
            return self.create_response(request, { 'success': False }, HttpUnauthorized)


    def logged_in(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user.is_authenticated():
            return self.create_response(request, {
                'logged_in': True,
                'username': request.user
            })
        else:
            return self.create_response(request, {
                'logged_in': False
            })



class CreateUserResource(ModelResource):
    #user = fields.ForeignKey('core.api.UserResource', 'user', full=True)

    class Meta:
        allowed_methods = ['post']
        always_return_data = True
        #authentication = SessionAuthentication()
        authorization = Authorization()
        queryset = User.objects.all()
        resource_name = 'create_user'
        always_return_data = True


    def hydrate(self, bundle):
        # REQUIRED_USER_PROFILE_FIELDS = ("user")
        # for field in REQUIRED_USER_PROFILE_FIELDS:
        #     if field not in bundle.data:
        #         raise CustomBadRequest(
        #             code="missing_key",
        #             message="Must provide {missing_key} when creating a user."
        #                     .format(missing_key=field))

        REQUIRED_USER_FIELDS = ("username", "email", "first_name", "last_name",
                                "password")
        for field in REQUIRED_USER_FIELDS:
            if field not in bundle.data:
                raise CustomBadRequest(
                    code="missing_key",
                    message="Must provide {missing_key} when creating a user."
                            .format(missing_key=field))
        return bundle

    def obj_create(self, bundle, **kwargs):
        try:
            email = bundle.data['email']
            username = bundle.data['username']
            if User.objects.filter(username=username):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That username is already used.")
            if User.objects.filter(email=email):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That email is already used.")
        except KeyError as missing_key:
            raise CustomBadRequest(
                code="missing_key",
                message="Must provide {missing_key} when creating a user."
                        .format(missing_key=missing_key))
        except User.DoesNotExist:
            pass

        bundle.obj = User.objects.create_user(bundle.data['username'],
                                              bundle.data['email'],
                                              bundle.data['password'])
        bundle.obj.first_name = bundle.data['first_name']
        bundle.obj.last_name = bundle.data['last_name']
        self.is_valid(bundle)

        if bundle.errors:
            raise ImmediateHttpResponse(response=self.error_response(bundle.request, bundle.errors))
        return bundle