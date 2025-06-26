# ⚙️ TESIS - DJANGO + DRF + GRAPHQL PATTERNS

## 📋 **PATRONES OBLIGATORIOS - DJANGO BACKEND**

### ✅ **MODELOS CON BUENAS PRÁCTICAS**

```python
# ✅ CORRECTO: Modelo Django con validaciones y métodos
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class TimestampedModel(models.Model):
    """Base model con timestamps automáticos"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class User(AbstractUser):
    """Usuario personalizado del sistema"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profiles/', blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return f"{self.email} ({self.get_full_name()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

class Project(TimestampedModel):
    """Proyecto de investigación"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    collaborators = models.ManyToManyField(User, related_name='collaborated_projects', blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('archived', 'Archived'),
        ],
        default='draft'
    )
    priority = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['owner', 'created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    def add_collaborator(self, user):
        """Añadir colaborador al proyecto"""
        if user != self.owner:
            self.collaborators.add(user)
```

### ✅ **DJANGO REST FRAMEWORK SERIALIZERS**

```python
# ✅ CORRECTO: Serializers con validaciones
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    """Serializer para usuario con validaciones"""
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'full_name', 'is_verified'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False}
        }
    
    def validate(self, attrs):
        """Validación personalizada"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        """Crear usuario con password hasheada"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer para proyecto con campos calculados"""
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    collaborator_count = serializers.SerializerMethodField()
    days_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'owner', 'owner_name', 'collaborator_count', 'days_active',
            'created_at', 'updated_at'
        ]
    
    def get_collaborator_count(self, obj):
        return obj.collaborators.count()
    
    def get_days_active(self, obj):
        if obj.is_active:
            return (timezone.now() - obj.created_at).days
        return None
```

### ✅ **VIEWSETS CON PERMISOS Y PAGINACIÓN**

```python
# ✅ CORRECTO: ViewSets con permisos y filtros
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProjectPermission(BasePermission):
    """Permiso personalizado para proyectos"""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user in obj.collaborators.all()

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de proyectos"""
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchBackend, filters.OrderingBackend]
    filterset_fields = ['status', 'priority', 'owner']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtrar proyectos por usuario"""
        user = self.request.user
        return Project.objects.filter(
            models.Q(owner=user) | models.Q(collaborators=user)
        ).distinct().select_related('owner').prefetch_related('collaborators')
    
    def perform_create(self, serializer):
        """Asignar owner automáticamente"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_collaborator(self, request, pk=None):
        """Añadir colaborador al proyecto"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            project.add_collaborator(user)
            return Response({'status': 'collaborator added'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False)
    def my_projects(self, request):
        """Proyectos del usuario autenticado"""
        projects = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
```

---

## 🔗 **GRAPHQL CON GRAPHENE PATTERNS**

### ✅ **GRAPHQL TYPES Y QUERIES**

```python
# ✅ CORRECTO: GraphQL schema con Graphene
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql_jwt.decorators import login_required

class UserType(DjangoObjectType):
    """Tipo GraphQL para Usuario"""
    full_name = graphene.String()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_verified')
    
    def resolve_full_name(self, info):
        return self.full_name

class ProjectType(DjangoObjectType):
    """Tipo GraphQL para Proyecto"""
    collaborator_count = graphene.Int()
    is_owner = graphene.Boolean()
    
    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'status', 'priority', 'owner', 'created_at')
    
    def resolve_collaborator_count(self, info):
        return self.collaborators.count()
    
    def resolve_is_owner(self, info):
        return self.owner == info.context.user

class Query(graphene.ObjectType):
    """Queries principales"""
    all_projects = DjangoFilterConnectionField(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    my_projects = graphene.List(ProjectType)
    user_profile = graphene.Field(UserType)
    
    def resolve_project(self, info, id):
        try:
            return Project.objects.get(id=id)
        except Project.DoesNotExist:
            return None
    
    @login_required
    def resolve_my_projects(self, info):
        user = info.context.user
        return Project.objects.filter(
            models.Q(owner=user) | models.Q(collaborators=user)
        ).distinct()
    
    @login_required
    def resolve_user_profile(self, info):
        return info.context.user

# Mutations
class CreateProject(graphene.Mutation):
    """Crear nuevo proyecto"""
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        priority = graphene.Int()
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    @login_required
    def mutate(self, info, title, description, priority=3):
        try:
            project = Project.objects.create(
                title=title,
                description=description,
                priority=priority,
                owner=info.context.user
            )
            return CreateProject(project=project, success=True, errors=[])
        except Exception as e:
            return CreateProject(project=None, success=False, errors=[str(e)])

class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
```

### ✅ **AUTENTICACIÓN JWT**

```python
# ✅ CORRECTO: Sistema de autenticación JWT
from django.contrib.auth import authenticate
import graphql_jwt
from graphql_jwt.decorators import login_required

class AuthMutation(graphene.ObjectType):
    """Mutations de autenticación"""
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    
class LoginMutation(graphene.Mutation):
    """Login personalizado"""
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
    
    token = graphene.String()
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, email, password):
        user = authenticate(email=email, password=password)
        if user and user.is_active:
            token = get_token(user)
            return LoginMutation(
                token=token,
                user=user,
                success=True,
                errors=[]
            )
        return LoginMutation(
            token=None,
            user=None,
            success=False,
            errors=['Invalid credentials']
        )
```

---

## 📊 **TIMESCALEDB PATTERNS**

### ✅ **MODELOS PARA TIME-SERIES**

```python
# ✅ CORRECTO: Modelo para datos de TimescaleDB
class TimeSeriesData(models.Model):
    """Modelo base para datos de series temporales"""
    timestamp = models.DateTimeField(db_index=True)
    metric_name = models.CharField(max_length=100, db_index=True)
    value = models.FloatField()
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['timestamp', 'metric_name']),
            models.Index(fields=['metric_name', 'timestamp']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.metric_name} at {self.timestamp}: {self.value}"

class SensorReading(models.Model):
    """Lecturas de sensores con TimescaleDB"""
    sensor_id = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    pressure = models.FloatField(null=True, blank=True)
    location = models.JSONField(default=dict)
    
    class Meta:
        # TimescaleDB hypertable configuration
        db_table = 'sensor_readings'
        indexes = [
            models.Index(fields=['sensor_id', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
        
    @classmethod
    def get_latest_by_sensor(cls, sensor_id, limit=100):
        """Obtener últimas lecturas por sensor"""
        return cls.objects.filter(sensor_id=sensor_id).order_by('-timestamp')[:limit]
    
    @classmethod
    def get_time_range(cls, start_time, end_time, sensor_id=None):
        """Obtener datos en rango de tiempo"""
        queryset = cls.objects.filter(timestamp__range=[start_time, end_time])
        if sensor_id:
            queryset = queryset.filter(sensor_id=sensor_id)
        return queryset.order_by('timestamp')
```

### ✅ **CONSULTAS OPTIMIZADAS PARA TIME-SERIES**

```python
# ✅ CORRECTO: Manager para consultas de TimescaleDB
from django.db import models
from django.db.models import Avg, Max, Min, Count
from django.utils import timezone
from datetime import timedelta

class TimeSeriesManager(models.Manager):
    """Manager optimizado para consultas de series temporales"""
    
    def time_bucket(self, interval, time_column='timestamp'):
        """Agrupar por intervalos de tiempo"""
        return self.extra(
            select={
                'time_bucket': f"time_bucket('{interval}', {time_column})"
            }
        )
    
    def aggregate_by_hour(self, hours=24):
        """Agregar datos por hora"""
        start_time = timezone.now() - timedelta(hours=hours)
        return self.filter(timestamp__gte=start_time).extra(
            select={
                'hour_bucket': "date_trunc('hour', timestamp)"
            }
        ).values('hour_bucket').annotate(
            avg_value=Avg('value'),
            max_value=Max('value'),
            min_value=Min('value'),
            count=Count('id')
        ).order_by('hour_bucket')
    
    def last_value_per_sensor(self):
        """Último valor por sensor"""
        return self.values('sensor_id').annotate(
            last_timestamp=Max('timestamp'),
            last_value=models.Subquery(
                self.filter(
                    sensor_id=models.OuterRef('sensor_id'),
                    timestamp=models.OuterRef('last_timestamp')
                ).values('value')[:1]
            )
        )

class TimeSeriesData(models.Model):
    # ... campos del modelo ...
    objects = TimeSeriesManager()
```

---

## ⚡ **CACHE Y PERFORMANCE PATTERNS**

### ✅ **REDIS CACHE CON DJANGO**

```python
# ✅ CORRECTO: Cache con Redis
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from functools import wraps

def cache_result(timeout=300, key_prefix=''):
    """Decorator para cachear resultados de métodos"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de cache
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Intentar obtener del cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator

class ProjectService:
    """Service layer con cache"""
    
    @cache_result(timeout=600, key_prefix='project_stats')
    def get_project_statistics(self, user_id):
        """Estadísticas de proyectos con cache"""
        return {
            'total_projects': Project.objects.filter(owner_id=user_id).count(),
            'active_projects': Project.objects.filter(
                owner_id=user_id, 
                status='active'
            ).count(),
            'completed_projects': Project.objects.filter(
                owner_id=user_id, 
                status='completed'
            ).count(),
        }
    
    def invalidate_user_cache(self, user_id):
        """Invalidar cache del usuario"""
        pattern = f"project_stats:*:{user_id}*"
        cache.delete_pattern(pattern)

# ViewSet con cache
@method_decorator(cache_page(60 * 15), name='list')  # 15 minutos
class CachedProjectViewSet(ProjectViewSet):
    """ViewSet con cache automático"""
    
    def perform_create(self, serializer):
        super().perform_create(serializer)
        # Invalidar cache después de crear
        cache.delete_pattern('project_stats:*')
```

---

## 🧪 **TESTING PATTERNS**

### ✅ **TESTS CON PYTEST-DJANGO**

```python
# ✅ CORRECTO: Tests comprehensivos
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, Mock

User = get_user_model()

@pytest.mark.django_db
class TestProjectModel:
    """Tests para modelo Project"""
    
    def test_create_project(self, user):
        """Test crear proyecto"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user
        )
        assert project.title == "Test Project"
        assert project.owner == user
        assert project.is_active is False  # default status is draft
    
    def test_add_collaborator(self, user, another_user):
        """Test añadir colaborador"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user
        )
        
        project.add_collaborator(another_user)
        assert another_user in project.collaborators.all()
        
        # No debe añadir al owner como colaborador
        project.add_collaborator(user)
        assert user not in project.collaborators.all()

@pytest.mark.django_db
class TestProjectAPI:
    """Tests para API de proyectos"""
    
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_project_authenticated(self):
        """Test crear proyecto autenticado"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'New Project',
            'description': 'Project description',
            'priority': 4
        }
        
        response = self.client.post('/api/projects/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Project.objects.filter(title='New Project').exists()
    
    def test_create_project_unauthenticated(self):
        """Test crear proyecto sin autenticación"""
        data = {
            'title': 'New Project',
            'description': 'Project description'
        }
        
        response = self.client.post('/api/projects/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @patch('myapp.services.external_api_call')
    def test_external_service_integration(self, mock_api):
        """Test integración con servicio externo"""
        mock_api.return_value = {'status': 'success', 'data': 'mocked'}
        
        # Test logic here
        result = some_function_that_calls_external_api()
        assert result['status'] == 'success'
        mock_api.assert_called_once()

# Fixtures
@pytest.fixture
def user():
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def another_user():
    return User.objects.create_user(
        email='another@example.com',
        password='testpass123'
    )
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: Fat Models**

```python
# ❌ MAL: Modelo con demasiada lógica
class BadProject(models.Model):
    # ... fields ...
    
    def calculate_stats(self):
        # 100+ líneas de lógica compleja
        pass
    
    def send_notifications(self):
        # Lógica de notificaciones en el modelo
        pass
    
    def generate_report(self):
        # Lógica de reportes en el modelo
        pass
```

### ❌ **INCORRECTO: N+1 Queries**

```python
# ❌ MAL: N+1 queries sin optimización
def bad_project_list(request):
    projects = Project.objects.all()
    for project in projects:
        print(project.owner.name)  # Query por cada proyecto
        print(project.collaborators.count())  # Query por cada proyecto
```

### ❌ **INCORRECTO: Sin validaciones**

```python
# ❌ MAL: Serializer sin validaciones
class BadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'  # Expone todos los campos
    
    # Sin validaciones personalizadas
    # Sin control de permisos
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **Models** con validaciones y métodos específicos  
✅ **Serializers** con validaciones personalizadas  
✅ **ViewSets** con permisos y filtros  
✅ **GraphQL** con tipos tipados y resolvers  
✅ **TimescaleDB** para datos de series temporales  
✅ **Cache** con Redis para performance  
✅ **Tests** comprehensivos con pytest  
✅ **Service Layer** para lógica de negocio compleja  
✅ **Managers** personalizados para queries complejas
