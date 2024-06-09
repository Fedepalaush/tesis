
from api.views import CreateUserView
from api.views import get_activo, get_fundamental_info
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
    #path('api-auth/', include('rest_framework.urls')),

    path('api/', include('api.urls')),
    path('get_activo/', get_activo, name='get_activo'),
    path('get_fundamental/', get_fundamental_info, name='get_fundamental'),
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True))),

    path('api/get_correlation_matrix', views.get_correlation_matrix, name='get_correlation_matrix'),
    path('sharpe-ratio/', views.sharpe_ratio, name='sharpe_ratio'),
    
]
