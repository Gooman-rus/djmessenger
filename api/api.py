import hashlib
import re

from django.shortcuts import get_object_or_404
from django.utils import timezone
from tastypie import fields
from tastypie.authorization import DjangoAuthorization, Authorization
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.resources import ModelResource
from django.contrib.auth.models import User, Group
from tastypie.authentication import SessionAuthentication, Authentication
from django.contrib.auth import authenticate, login, logout
from tastypie.http import HttpUnauthorized, HttpForbidden
from django.conf.urls import url
from tastypie.utils import trailing_slash

from main_app.models import UserProfile
from tastypie_extras.email import my_send_email, gen_activation_key
from tastypie_extras.exceptions import CustomBadRequest

class UserProfileResource(ModelResource):

    class Meta:
        queryset = UserProfile.objects.all()
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        allowed_methods = ['get']
        resource_name = 'profile'
        excludes = ['id']
        include_resource_uri = False



class UserResource(ModelResource):
    userprofile = fields.ToOneField(UserProfileResource, 'userprofile', null=True, full=True)

    class Meta:
        queryset = User.objects.all()
        fields = ['first_name', 'last_name', 'email', 'date_joined', 'last_login', 'userprofile']
        allowed_methods = ['get', 'post', 'patch']
        resource_name = 'user'
        detail_uri_name = 'username'
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        #include_resource_uri = False

    def obj_create(self, bundle, **kwargs):
        return super(UserResource, self).obj_create(bundle, user=bundle.request.user)

    def authorized_read_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

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
            url(r'^(?P<resource_name>%s)/confirm_email%s(?P<activation_key>\w+)' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('confirm_email'), name='api_confirm_email'),
            url(r"^(?P<resource_name>%s)/(?P<username>[\w\d_.-]+)/$"
                % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
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

    def confirm_email(self, request, **kwargs):
        # check if there is UserProfile which matches the activation key (if not then display 404)
        user_profile = get_object_or_404(UserProfile, activation_key=kwargs['activation_key'])

        user = user_profile.user
        if (user.is_active):
            return self.create_response(request, {
                'success': False,
                'reason': 'already activated'
            })

        #check if the activation key has expired, if it hase then render confirm_expired.html
        if user_profile.key_expires < timezone.now():
            return self.create_response(request, {
                'success': False,
                'reason': 'expired',
            })

        user.is_active = True
        user.save()

        return self.create_response(request, {
            'success': True,
            'reason': 'activated'
        })

    def obj_update(self, bundle, request, **kwargs):
        #get authenticated user
        #curr_user = bundle.request.user
        curr_user = request.user

        #get username to edit from URI
        username_regex = re.compile("/(\w+)/$")
        request_username = username_regex.findall(bundle.data['resource_uri'])[0]

        #you can edit only your profile
        if (str(curr_user) != request_username):
            raise ImmediateHttpResponse(HttpForbidden())

        old_email = bundle.obj.email

        bundle = super(UserResource, self).obj_update(bundle, request)

        bundle.obj.first_name = bundle.data['first_name']
        bundle.obj.last_name = bundle.data['last_name']

        #has email been changed?
        #print old_email
        #print bundle.data['email']
        #print bundle.obj.userprofile.activation_key
        #need_to_logout = False
        if old_email != bundle.data['email']:
            bundle.obj.is_active = False
            activation_key, key_expires = gen_activation_key(bundle.data['email'])
            bundle.obj.userprofile.activation_key = activation_key
            bundle.obj.userprofile.key_expires = key_expires
            my_send_email(bundle.data['email'], curr_user, activation_key, purpose='change')
            bundle.obj.email = bundle.data['email']
            #need_to_logout = True

        self.is_valid(bundle)
        if bundle.errors:
            raise ImmediateHttpResponse(response=self.error_response(bundle.request, bundle.errors))

        bundle.obj.userprofile.save()
        bundle.obj.save()

        # if need_to_logout and request.user and request.user.is_authenticated():
        #     logout(request)

        return bundle




class CreateUserResource(ModelResource):

    class Meta:
        allowed_methods = ['post']
        always_return_data = True
        #authentication = SessionAuthentication()
        authorization = Authorization()
        queryset = User.objects.all()
        resource_name = 'create_user'


    def hydrate(self, bundle):
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
        bundle.obj.is_active = False

        user_group = Group.objects.get(name='CommonUsers')
        user_group.user_set.add(bundle.obj)

        self.is_valid(bundle)
        if bundle.errors:
            raise ImmediateHttpResponse(response=self.error_response(bundle.request, bundle.errors))

        bundle.obj.save()

        activation_key, key_expires = gen_activation_key(email)

        #Get user by username
        user = User.objects.get(username=username)

        # Create and save user profile
        new_profile = UserProfile(user=user, activation_key=activation_key, key_expires=key_expires,
                                  avatar=hashlib.md5(email.lower()).hexdigest())
        new_profile.save()

        # Send email with activation key
        my_send_email(email, username, activation_key)

        return bundle

