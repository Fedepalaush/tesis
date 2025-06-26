# 🌐 TESIS - API PATTERNS (REST + GRAPHQL)

## 📋 **PATRONES OBLIGATORIOS - API DESIGN**

### ✅ **REST API DESIGN PATTERNS**

```python
# ✅ CORRECTO: RESTful endpoints consistentes
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class APIResponseMixin:
    """Mixin para respuestas API consistentes"""
    
    def success_response(self, data=None, message="Success", status_code=status.HTTP_200_OK):
        """Respuesta exitosa estandarizada"""
        return Response({
            'success': True,
            'message': message,
            'data': data,
            'timestamp': timezone.now().isoformat()
        }, status=status_code)
    
    def error_response(self, message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Respuesta de error estandarizada"""
        return Response({
            'success': False,
            'message': message,
            'errors': errors or [],
            'timestamp': timezone.now().isoformat()
        }, status=status_code)

class ProjectAPIViewSet(APIResponseMixin, viewsets.ModelViewSet):
    """API RESTful para proyectos"""
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    # GET /api/projects/
    def list(self, request):
        """Listar proyectos con filtros"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return self.success_response(
            data=serializer.data,
            message="Projects retrieved successfully"
        )
    
    # POST /api/projects/
    def create(self, request):
        """Crear nuevo proyecto"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            project = serializer.save(owner=request.user)
            return self.success_response(
                data=ProjectSerializer(project).data,
                message="Project created successfully",
                status_code=status.HTTP_201_CREATED
            )
        
        return self.error_response(
            message="Validation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # GET /api/projects/{id}/
    def retrieve(self, request, pk=None):
        """Obtener proyecto específico"""
        try:
            project = self.get_object()
            serializer = self.get_serializer(project)
            return self.success_response(
                data=serializer.data,
                message="Project retrieved successfully"
            )
        except Project.DoesNotExist:
            return self.error_response(
                message="Project not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    # PUT /api/projects/{id}/
    def update(self, request, pk=None):
        """Actualizar proyecto completo"""
        project = self.get_object()
        serializer = self.get_serializer(project, data=request.data)
        
        if serializer.is_valid():
            updated_project = serializer.save()
            return self.success_response(
                data=ProjectSerializer(updated_project).data,
                message="Project updated successfully"
            )
        
        return self.error_response(
            message="Validation failed",
            errors=serializer.errors
        )
    
    # PATCH /api/projects/{id}/
    def partial_update(self, request, pk=None):
        """Actualización parcial de proyecto"""
        project = self.get_object()
        serializer = self.get_serializer(project, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_project = serializer.save()
            return self.success_response(
                data=ProjectSerializer(updated_project).data,
                message="Project partially updated successfully"
            )
        
        return self.error_response(
            message="Validation failed",
            errors=serializer.errors
        )
    
    # DELETE /api/projects/{id}/
    def destroy(self, request, pk=None):
        """Eliminar proyecto"""
        project = self.get_object()
        project.delete()
        return self.success_response(
            message="Project deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    
    # POST /api/projects/{id}/archive/
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archivar proyecto"""
        project = self.get_object()
        project.status = 'archived'
        project.save()
        
        return self.success_response(
            data=ProjectSerializer(project).data,
            message="Project archived successfully"
        )
    
    # GET /api/projects/my-projects/
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Proyectos del usuario autenticado"""
        projects = Project.objects.filter(owner=request.user)
        serializer = self.get_serializer(projects, many=True)
        
        return self.success_response(
            data=serializer.data,
            message="User projects retrieved successfully"
        )
    
    # POST /api/projects/{id}/collaborators/
    @action(detail=True, methods=['post'])
    def add_collaborator(self, request, pk=None):
        """Añadir colaborador al proyecto"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return self.error_response(
                message="user_id is required"
            )
        
        try:
            user = User.objects.get(id=user_id)
            project.collaborators.add(user)
            
            return self.success_response(
                data={'collaborator': UserSerializer(user).data},
                message="Collaborator added successfully"
            )
        except User.DoesNotExist:
            return self.error_response(
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
```

### ✅ **GRAPHQL SCHEMA PATTERNS**

```python
# ✅ CORRECTO: GraphQL schema bien estructurado
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql_jwt.decorators import login_required
from graphene import relay

class ProjectNode(DjangoObjectType):
    """Nodo GraphQL para Project con Relay"""
    collaborator_count = graphene.Int()
    is_owner = graphene.Boolean()
    can_edit = graphene.Boolean()
    
    class Meta:
        model = Project
        interfaces = (relay.Node, )
        filterset_fields = {
            'title': ['exact', 'icontains'],
            'status': ['exact'],
            'priority': ['exact', 'gte', 'lte'],
            'created_at': ['exact', 'gte', 'lte'],
        }
    
    def resolve_collaborator_count(self, info):
        return self.collaborators.count()
    
    def resolve_is_owner(self, info):
        return self.owner == info.context.user
    
    def resolve_can_edit(self, info):
        user = info.context.user
        return self.owner == user or user in self.collaborators.all()

class UserNode(DjangoObjectType):
    """Nodo GraphQL para User"""
    full_name = graphene.String()
    project_count = graphene.Int()
    
    class Meta:
        model = User
        interfaces = (relay.Node, )
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_verified')
    
    def resolve_full_name(self, info):
        return f"{self.first_name} {self.last_name}".strip()
    
    def resolve_project_count(self, info):
        return self.projects.count()

class Query(graphene.ObjectType):
    """Queries principales del sistema"""
    
    # Relay connections
    all_projects = DjangoFilterConnectionField(ProjectNode)
    all_users = DjangoFilterConnectionField(UserNode)
    
    # Single object queries
    project = relay.Node.Field(ProjectNode)
    user = relay.Node.Field(UserNode)
    
    # Custom queries
    my_projects = graphene.List(ProjectNode)
    project_statistics = graphene.Field('ProjectStatistics')
    search_projects = graphene.List(
        ProjectNode,
        query=graphene.String(required=True),
        limit=graphene.Int(default_value=10)
    )
    
    @login_required
    def resolve_my_projects(self, info):
        """Proyectos del usuario autenticado"""
        user = info.context.user
        return Project.objects.filter(
            models.Q(owner=user) | models.Q(collaborators=user)
        ).distinct()
    
    @login_required
    def resolve_project_statistics(self, info):
        """Estadísticas de proyectos del usuario"""
        user = info.context.user
        projects = Project.objects.filter(owner=user)
        
        return {
            'total_projects': projects.count(),
            'active_projects': projects.filter(status='active').count(),
            'completed_projects': projects.filter(status='completed').count(),
            'draft_projects': projects.filter(status='draft').count(),
        }
    
    def resolve_search_projects(self, info, query, limit=10):
        """Búsqueda de proyectos por texto"""
        return Project.objects.filter(
            models.Q(title__icontains=query) | 
            models.Q(description__icontains=query)
        )[:limit]

class ProjectStatistics(graphene.ObjectType):
    """Tipo para estadísticas de proyectos"""
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    draft_projects = graphene.Int()
```

### ✅ **GRAPHQL MUTATIONS PATTERNS**

```python
# ✅ CORRECTO: Mutations con validación y manejo de errores
class CreateProjectMutation(graphene.Mutation):
    """Crear nuevo proyecto"""
    
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        priority = graphene.Int(default_value=3)
        collaborator_ids = graphene.List(graphene.ID)
    
    # Output fields
    project = graphene.Field(ProjectNode)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    @login_required
    def mutate(self, info, title, description, priority=3, collaborator_ids=None):
        """Ejecutar mutación"""
        try:
            # Validaciones
            if len(title.strip()) < 3:
                return CreateProjectMutation(
                    project=None,
                    success=False,
                    errors=["Title must be at least 3 characters long"]
                )
            
            if priority < 1 or priority > 5:
                return CreateProjectMutation(
                    project=None,
                    success=False,
                    errors=["Priority must be between 1 and 5"]
                )
            
            # Crear proyecto
            project = Project.objects.create(
                title=title.strip(),
                description=description.strip(),
                priority=priority,
                owner=info.context.user
            )
            
            # Añadir colaboradores si se especifican
            if collaborator_ids:
                collaborators = User.objects.filter(id__in=collaborator_ids)
                project.collaborators.set(collaborators)
            
            return CreateProjectMutation(
                project=project,
                success=True,
                errors=[]
            )
            
        except Exception as e:
            return CreateProjectMutation(
                project=None,
                success=False,
                errors=[str(e)]
            )

class UpdateProjectMutation(graphene.Mutation):
    """Actualizar proyecto existente"""
    
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.Int()
    
    project = graphene.Field(ProjectNode)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    @login_required
    def mutate(self, info, id, **kwargs):
        """Ejecutar actualización"""
        try:
            project = Project.objects.get(id=id)
            user = info.context.user
            
            # Verificar permisos
            if project.owner != user and user not in project.collaborators.all():
                return UpdateProjectMutation(
                    project=None,
                    success=False,
                    errors=["Permission denied"]
                )
            
            # Actualizar campos
            for field, value in kwargs.items():
                if value is not None:
                    if field == 'title' and len(value.strip()) < 3:
                        return UpdateProjectMutation(
                            project=None,
                            success=False,
                            errors=["Title must be at least 3 characters long"]
                        )
                    setattr(project, field, value.strip() if isinstance(value, str) else value)
            
            project.save()
            
            return UpdateProjectMutation(
                project=project,
                success=True,
                errors=[]
            )
            
        except Project.DoesNotExist:
            return UpdateProjectMutation(
                project=None,
                success=False,
                errors=["Project not found"]
            )
        except Exception as e:
            return UpdateProjectMutation(
                project=None,
                success=False,
                errors=[str(e)]
            )

class DeleteProjectMutation(graphene.Mutation):
    """Eliminar proyecto"""
    
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    @login_required
    def mutate(self, info, id):
        """Ejecutar eliminación"""
        try:
            project = Project.objects.get(id=id)
            user = info.context.user
            
            # Solo el owner puede eliminar
            if project.owner != user:
                return DeleteProjectMutation(
                    success=False,
                    errors=["Only project owner can delete the project"]
                )
            
            project.delete()
            
            return DeleteProjectMutation(
                success=True,
                errors=[]
            )
            
        except Project.DoesNotExist:
            return DeleteProjectMutation(
                success=False,
                errors=["Project not found"]
            )
        except Exception as e:
            return DeleteProjectMutation(
                success=False,
                errors=[str(e)]
            )

class Mutation(graphene.ObjectType):
    """Mutations principales"""
    create_project = CreateProjectMutation.Field()
    update_project = UpdateProjectMutation.Field()
    delete_project = DeleteProjectMutation.Field()
    
    # JWT Auth mutations
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
```

---

## 🔒 **AUTHENTICATION & PERMISSIONS PATTERNS**

### ✅ **JWT AUTHENTICATION**

```python
# ✅ CORRECTO: Autenticación JWT personalizada
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personalizado para JWT tokens"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Añadir claims personalizados
        token['email'] = user.email
        token['full_name'] = user.get_full_name()
        token['is_verified'] = user.is_verified
        
        return token
    
    def validate(self, attrs):
        """Validación personalizada"""
        data = super().validate(attrs)
        
        # Añadir información del usuario en la respuesta
        data.update({
            'user': {
                'id': self.user.id,
                'email': self.user.email,
                'full_name': self.user.get_full_name(),
                'is_verified': self.user.is_verified,
            }
        })
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para obtener tokens"""
    serializer_class = CustomTokenObtainPairSerializer

# Middleware para GraphQL JWT
class GraphQLJWTMiddleware:
    """Middleware para autenticación JWT en GraphQL"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.path == '/graphql/':
            token = self.get_token_from_request(request)
            if token:
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    user = User.objects.get(id=payload['user_id'])
                    request.user = user
                except (jwt.InvalidTokenError, User.DoesNotExist):
                    request.user = AnonymousUser()
        
        return self.get_response(request)
    
    def get_token_from_request(self, request):
        """Extraer token del header Authorization"""
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header[7:]
        return None
```

### ✅ **PERMISSIONS PATTERNS**

```python
# ✅ CORRECTO: Permisos granulares
from rest_framework.permissions import BasePermission

class IsOwnerOrCollaborator(BasePermission):
    """Permiso para owners y colaboradores"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions para cualquiera autenticado
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions solo para owner y colaboradores
        return (
            obj.owner == request.user or 
            request.user in obj.collaborators.all()
        )

class IsOwnerOnly(BasePermission):
    """Permiso solo para el owner"""
    
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class CanEditProject(BasePermission):
    """Permiso personalizado para editar proyectos"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Diferentes permisos según la acción
        if view.action in ['retrieve', 'list']:
            return True
        elif view.action in ['update', 'partial_update']:
            return obj.owner == request.user or request.user in obj.collaborators.all()
        elif view.action in ['destroy', 'archive']:
            return obj.owner == request.user
        
        return False

# GraphQL Permissions
def user_passes_test_graphql(test_func):
    """Decorator para permisos en GraphQL"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, info, *args, **kwargs):
            user = info.context.user
            if not user.is_authenticated or not test_func(user):
                raise PermissionDenied("Permission denied")
            return func(self, info, *args, **kwargs)
        return wrapper
    return decorator

def is_project_owner_or_collaborator(user, project_id):
    """Verificar si usuario es owner o colaborador"""
    try:
        project = Project.objects.get(id=project_id)
        return project.owner == user or user in project.collaborators.all()
    except Project.DoesNotExist:
        return False
```

---

## 📊 **API VERSIONING PATTERNS**

### ✅ **URL VERSIONING**

```python
# ✅ CORRECTO: Versionado de API por URL
from rest_framework.versioning import URLPathVersioning

class APIVersioning(URLPathVersioning):
    """Versionado personalizado de API"""
    default_version = 'v1'
    allowed_versions = ['v1', 'v2']
    version_param = 'version'

# urls.py
urlpatterns = [
    path('api/v1/', include('myapp.urls.v1')),
    path('api/v2/', include('myapp.urls.v2')),
    path('graphql/v1/', GraphQLView.as_view(schema=schema_v1)),
    path('graphql/v2/', GraphQLView.as_view(schema=schema_v2)),
]

# Serializers versionados
class ProjectSerializerV1(serializers.ModelSerializer):
    """Serializer para API v1"""
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status']

class ProjectSerializerV2(serializers.ModelSerializer):
    """Serializer para API v2 con campos adicionales"""
    collaborator_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'priority', 'collaborator_count']
    
    def get_collaborator_count(self, obj):
        return obj.collaborators.count()

# ViewSet con versionado
class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet con soporte para múltiples versiones"""
    
    def get_serializer_class(self):
        if self.request.version == 'v2':
            return ProjectSerializerV2
        return ProjectSerializerV1
```

---

## 📈 **API MONITORING & LOGGING PATTERNS**

### ✅ **REQUEST LOGGING**

```python
# ✅ CORRECTO: Logging comprehensivo de API
import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')

class APILoggingMiddleware(MiddlewareMixin):
    """Middleware para logging de requests API"""
    
    def process_request(self, request):
        request.start_time = time.time()
        
        # Log request
        logger.info(f"API Request: {request.method} {request.path}", extra={
            'method': request.method,
            'path': request.path,
            'user': getattr(request.user, 'email', 'anonymous'),
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        })
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log response
            logger.info(f"API Response: {response.status_code}", extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': duration,
                'user': getattr(request.user, 'email', 'anonymous'),
            })
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

# Rate limiting
from django_ratelimit.decorators import ratelimit

class RateLimitedViewSet(viewsets.ModelViewSet):
    """ViewSet con rate limiting"""
    
    @ratelimit(key='user', rate='100/h', method='POST')
    def create(self, request, *args, **kwargs):
        """Crear con rate limiting"""
        return super().create(request, *args, **kwargs)
    
    @ratelimit(key='ip', rate='1000/h', method='GET')
    def list(self, request, *args, **kwargs):
        """Listar con rate limiting por IP"""
        return super().list(request, *args, **kwargs)
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: APIs inconsistentes**

```python
# ❌ MAL: Respuestas inconsistentes
def bad_api_view(request):
    if success:
        return JsonResponse({'data': result})  # Formato inconsistente
    else:
        return JsonResponse({'error': 'Failed'}, status=400)  # Sin estructura
```

### ❌ **INCORRECTO: Sin validación**

```python
# ❌ MAL: GraphQL sin validaciones
def resolve_create_project(self, info, title, description):
    # Sin validar autenticación
    # Sin validar permisos  
    # Sin validar datos de entrada
    return Project.objects.create(title=title, description=description)
```

### ❌ **INCORRECTO: Exposición de datos sensibles**

```python
# ❌ MAL: Serializer que expone todos los campos
class BadUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Expone password, tokens, etc.
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **REST APIs** con respuestas consistentes y manejo de errores  
✅ **GraphQL** con tipos tipados y validaciones  
✅ **Autenticación JWT** con claims personalizados  
✅ **Permisos granulares** por endpoint y acción  
✅ **Versionado de API** para compatibilidad  
✅ **Logging y monitoring** de requests  
✅ **Rate limiting** para protección  
✅ **Serializers** con validaciones estrictas  
✅ **Error handling** comprehensivo
