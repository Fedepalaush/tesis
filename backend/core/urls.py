
from api.views import CreateUserView
from api.views import my_custom_view
from django.contrib import admin
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api import views

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('api-auth/', include('rest_framework.urls')),

    path('api/', include('api.urls')),
    path('my_custom_view/', my_custom_view, name='my_custom_view'),
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True))),
    
]
