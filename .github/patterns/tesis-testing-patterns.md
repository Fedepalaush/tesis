# 🧪 TESIS - TESTING PATTERNS (VITEST + DJANGO)

## 📋 **PATRONES OBLIGATORIOS - TESTING STRATEGY**

### ✅ **FRONTEND TESTING CON VITEST**

```typescript
// ✅ CORRECTO: Configuración Vitest
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './coverage/test-results.json'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  }
})

// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// Mock de APIs
global.fetch = vi.fn()

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))

// Mock de ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))
```

### ✅ **COMPONENT TESTING PATTERNS**

```typescript
// ✅ CORRECTO: Test de componente React
// src/components/UserDashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter } from 'react-router-dom'
import UserDashboard from './UserDashboard'
import { GET_USER_PROJECTS } from '@/graphql/queries'

// Mock del query GraphQL
const mocks = [
  {
    request: {
      query: GET_USER_PROJECTS,
      variables: { userId: '1' }
    },
    result: {
      data: {
        userProjects: [
          {
            id: '1',
            title: 'Test Project',
            description: 'Test Description',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ]
      }
    }
  }
]

// Wrapper para providers
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </BrowserRouter>
)

describe('UserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    render(
      <Wrapper>
        <UserDashboard userId="1" />
      </Wrapper>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should render projects after loading', async () => {
    render(
      <Wrapper>
        <UserDashboard userId="1" />
      </Wrapper>
    )

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('should handle project creation', async () => {
    const onProjectCreate = vi.fn()
    
    render(
      <Wrapper>
        <UserDashboard userId="1" onProjectCreate={onProjectCreate} />
      </Wrapper>
    )

    // Esperar a que se cargue
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    // Hacer click en crear proyecto
    const createButton = screen.getByRole('button', { name: /create project/i })
    fireEvent.click(createButton)

    // Verificar que se abrió el modal
    expect(screen.getByTestId('create-project-modal')).toBeInTheDocument()

    // Llenar formulario
    const titleInput = screen.getByLabelText(/project title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    fireEvent.change(titleInput, { target: { value: 'New Project' } })
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } })

    // Submit
    const submitButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitButton)

    // Verificar callback
    await waitFor(() => {
      expect(onProjectCreate).toHaveBeenCalledWith({
        title: 'New Project',
        description: 'New Description'
      })
    })
  })

  it('should handle errors gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_USER_PROJECTS,
          variables: { userId: '1' }
        },
        error: new Error('Network error')
      }
    ]

    render(
      <BrowserRouter>
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <UserDashboard userId="1" />
        </MockedProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading projects/i)).toBeInTheDocument()
    })
  })
})
```

### ✅ **CUSTOM HOOKS TESTING**

```typescript
// ✅ CORRECTO: Test de custom hook
// src/hooks/useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from './useApi'

// Mock de fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should return loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    })

    const { result } = renderHook(() => useApi('/api/test'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const { result } = renderHook(() => useApi('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/test')
  })

  it('should handle errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useApi('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('API Error')
  })

  it('should refetch data when called', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const { result } = renderHook(() => useApi('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear mock to verify refetch
    mockFetch.mockClear()

    // Call refetch
    result.current.refetch()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})
```

### ✅ **INTEGRATION TESTING**

```typescript
// ✅ CORRECTO: Test de integración frontend
// src/test/integration/ProjectFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import App from '@/App'
import { 
  GET_USER_PROJECTS,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION
} from '@/graphql/queries'

const integrationMocks = [
  // Mock para lista inicial
  {
    request: { query: GET_USER_PROJECTS, variables: { userId: '1' } },
    result: {
      data: {
        userProjects: [
          { id: '1', title: 'Existing Project', status: 'active' }
        ]
      }
    }
  },
  // Mock para crear proyecto
  {
    request: {
      query: CREATE_PROJECT_MUTATION,
      variables: {
        title: 'New Project',
        description: 'New Description',
        priority: 3
      }
    },
    result: {
      data: {
        createProject: {
          project: { id: '2', title: 'New Project', status: 'draft' },
          success: true,
          errors: []
        }
      }
    }
  },
  // Mock para actualizar
  {
    request: {
      query: UPDATE_PROJECT_MUTATION,
      variables: { id: '2', status: 'active' }
    },
    result: {
      data: {
        updateProject: {
          project: { id: '2', title: 'New Project', status: 'active' },
          success: true,
          errors: []
        }
      }
    }
  }
]

describe('Project Management Flow', () => {
  it('should complete full project lifecycle', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={integrationMocks} addTypename={false}>
          <App />
        </MockedProvider>
      </BrowserRouter>
    )

    // 1. Verificar lista inicial
    await waitFor(() => {
      expect(screen.getByText('Existing Project')).toBeInTheDocument()
    })

    // 2. Crear nuevo proyecto
    const createButton = screen.getByRole('button', { name: /create project/i })
    fireEvent.click(createButton)

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Project' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'New Description' }
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    // 3. Verificar que aparece en la lista
    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    // 4. Cambiar estado a activo
    const statusButton = screen.getByTestId('status-button-2')
    fireEvent.click(statusButton)
    fireEvent.click(screen.getByText('Active'))

    // 5. Verificar cambio de estado
    await waitFor(() => {
      expect(screen.getByTestId('project-2-status')).toHaveTextContent('active')
    })
  })
})
```

---

## 🐍 **DJANGO TESTING PATTERNS**

### ✅ **MODEL TESTING**

```python
# ✅ CORRECTO: Tests para modelos Django
# tests/test_models.py
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from myapp.models import Project, TimeSeriesData
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

@pytest.mark.django_db
class TestProjectModel:
    """Tests para modelo Project"""
    
    def test_create_project_success(self, user):
        """Test creación exitosa de proyecto"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user,
            priority=3
        )
        
        assert project.title == "Test Project"
        assert project.owner == user
        assert project.status == "draft"  # default
        assert project.priority == 3
        assert str(project) == "Test Project"
    
    def test_project_title_required(self, user):
        """Test que el título es requerido"""
        with pytest.raises(ValidationError):
            project = Project(
                description="Test description",
                owner=user
            )
            project.full_clean()  # Trigger validation
    
    def test_project_priority_validation(self, user):
        """Test validación de prioridad"""
        with pytest.raises(ValidationError):
            project = Project(
                title="Test Project",
                description="Test description",
                owner=user,
                priority=10  # Fuera del rango válido (1-5)
            )
            project.full_clean()
    
    def test_add_collaborator(self, user, another_user):
        """Test añadir colaborador"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user
        )
        
        project.add_collaborator(another_user)
        
        assert another_user in project.collaborators.all()
        assert project.collaborators.count() == 1
    
    def test_cannot_add_owner_as_collaborator(self, user):
        """Test que no se puede añadir al owner como colaborador"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user
        )
        
        project.add_collaborator(user)
        
        # El owner no debe estar en colaboradores
        assert user not in project.collaborators.all()
        assert project.collaborators.count() == 0
    
    def test_is_active_property(self, user):
        """Test property is_active"""
        project = Project.objects.create(
            title="Test Project",
            description="Test description",
            owner=user,
            status="active"
        )
        
        assert project.is_active is True
        
        project.status = "draft"
        assert project.is_active is False

@pytest.mark.django_db
class TestTimeSeriesModel:
    """Tests para modelo TimeSeries"""
    
    def test_create_timeseries_data(self):
        """Test creación de datos de series temporales"""
        data = TimeSeriesData.objects.create(
            sensor_id="sensor_001",
            temperature=25.5,
            humidity=60.0,
            pressure=1013.25,
            location={"lat": 40.7128, "lng": -74.0060}
        )
        
        assert data.sensor_id == "sensor_001"
        assert data.temperature == 25.5
        assert data.location["lat"] == 40.7128
    
    def test_get_latest_by_sensor(self):
        """Test método get_latest_by_sensor"""
        sensor_id = "sensor_001"
        
        # Crear múltiples lecturas
        for i in range(5):
            TimeSeriesData.objects.create(
                sensor_id=sensor_id,
                temperature=20.0 + i,
                timestamp=timezone.now() - timedelta(hours=i)
            )
        
        latest = TimeSeriesData.get_latest_by_sensor(sensor_id, limit=3)
        
        assert latest.count() == 3
        # Debe estar ordenado por timestamp descendente
        assert latest[0].temperature == 20.0  # Más reciente
        assert latest[1].temperature == 21.0
        assert latest[2].temperature == 22.0
    
    def test_get_time_range(self):
        """Test método get_time_range"""
        sensor_id = "sensor_001"
        now = timezone.now()
        
        # Crear datos en diferentes momentos
        TimeSeriesData.objects.create(
            sensor_id=sensor_id,
            temperature=20.0,
            timestamp=now - timedelta(hours=2)
        )
        TimeSeriesData.objects.create(
            sensor_id=sensor_id,
            temperature=22.0,
            timestamp=now - timedelta(hours=1)
        )
        TimeSeriesData.objects.create(
            sensor_id=sensor_id,
            temperature=24.0,
            timestamp=now
        )
        
        # Buscar en rango específico
        start_time = now - timedelta(hours=1.5)
        end_time = now
        
        data_in_range = TimeSeriesData.get_time_range(start_time, end_time, sensor_id)
        
        assert data_in_range.count() == 2
        assert data_in_range[0].temperature == 22.0  # Ordenado por timestamp
        assert data_in_range[1].temperature == 24.0

# Fixtures
@pytest.fixture
def user():
    return User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='testpass123'
    )

@pytest.fixture
def another_user():
    return User.objects.create_user(
        email='another@example.com',
        username='anotheruser',
        password='testpass123'
    )
```

### ✅ **API TESTING**

```python
# ✅ CORRECTO: Tests para API REST
# tests/test_api.py
import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from myapp.models import Project
import json

User = get_user_model()

@pytest.mark.django_db
class TestProjectAPI:
    """Tests para API de proyectos"""
    
    def setup_method(self):
        """Setup para cada test"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='Test Project',
            description='Test description',
            owner=self.user
        )
    
    def test_list_projects_unauthenticated(self):
        """Test listar proyectos sin autenticación"""
        url = reverse('project-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_projects_authenticated(self):
        """Test listar proyectos autenticado"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['success'] is True
        assert len(data['data']) == 1
        assert data['data'][0]['title'] == 'Test Project'
    
    def test_create_project_success(self):
        """Test crear proyecto exitosamente"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        
        data = {
            'title': 'New Project',
            'description': 'New description',
            'priority': 4
        }
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        response_data = response.json()
        assert response_data['success'] is True
        assert response_data['data']['title'] == 'New Project'
        
        # Verificar en BD
        assert Project.objects.filter(title='New Project').exists()
    
    def test_create_project_validation_error(self):
        """Test validación al crear proyecto"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        
        data = {
            'title': '',  # Título vacío
            'description': 'New description'
        }
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        response_data = response.json()
        assert response_data['success'] is False
        assert 'title' in response_data['errors']
    
    def test_update_project_owner(self):
        """Test actualizar proyecto como owner"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        
        data = {
            'title': 'Updated Project',
            'status': 'active'
        }
        
        response = self.client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert response_data['data']['title'] == 'Updated Project'
        assert response_data['data']['status'] == 'active'
        
        # Verificar en BD
        self.project.refresh_from_db()
        assert self.project.title == 'Updated Project'
        assert self.project.status == 'active'
    
    def test_update_project_non_owner(self):
        """Test actualizar proyecto sin ser owner"""
        other_user = User.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=other_user)
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        
        data = {'title': 'Hacked Project'}
        response = self.client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_project_owner(self):
        """Test eliminar proyecto como owner"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        
        response = self.client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Project.objects.filter(id=self.project.id).exists()
    
    def test_custom_action_archive(self):
        """Test acción personalizada archive"""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-archive', kwargs={'pk': self.project.id})
        
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert response_data['data']['status'] == 'archived'
        
        # Verificar en BD
        self.project.refresh_from_db()
        assert self.project.status == 'archived'
    
    def test_pagination(self):
        """Test paginación de API"""
        # Crear múltiples proyectos
        for i in range(25):
            Project.objects.create(
                title=f'Project {i}',
                description=f'Description {i}',
                owner=self.user
            )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verificar estructura de paginación
        assert 'results' in data
        assert 'count' in data
        assert 'next' in data
        assert 'previous' in data
        assert len(data['results']) <= 20  # page_size default
    
    def test_filtering(self):
        """Test filtros de API"""
        # Crear proyectos con diferentes estados
        Project.objects.create(
            title='Active Project',
            description='Active description',
            owner=self.user,
            status='active'
        )
        Project.objects.create(
            title='Completed Project',
            description='Completed description',
            owner=self.user,
            status='completed'
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        
        # Filtrar por status
        response = self.client.get(url, {'status': 'active'})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data['data']) == 1
        assert data['data'][0]['title'] == 'Active Project'
    
    def test_search(self):
        """Test búsqueda en API"""
        Project.objects.create(
            title='Machine Learning Project',
            description='AI and ML description',
            owner=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        
        # Buscar por título
        response = self.client.get(url, {'search': 'Machine'})
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data['data']) == 1
        assert 'Machine Learning' in data['data'][0]['title']
```

### ✅ **GRAPHQL TESTING**

```python
# ✅ CORRECTO: Tests para GraphQL
# tests/test_graphql.py
import pytest
from django.test import TestCase
from graphene.test import Client
from django.contrib.auth import get_user_model
from myapp.schema import schema
from myapp.models import Project

User = get_user_model()

@pytest.mark.django_db
class TestGraphQLQueries:
    """Tests para queries GraphQL"""
    
    def setup_method(self):
        """Setup para cada test"""
        self.client = Client(schema)
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='Test Project',
            description='Test description',
            owner=self.user
        )
    
    def test_query_all_projects_unauthenticated(self):
        """Test query sin autenticación"""
        query = '''
        query {
            allProjects {
                edges {
                    node {
                        title
                        description
                    }
                }
            }
        }
        '''
        
        result = self.client.execute(query)
        
        assert 'errors' in result
        assert 'permission' in result['errors'][0]['message'].lower()
    
    def test_query_my_projects(self):
        """Test query de proyectos del usuario"""
        query = '''
        query {
            myProjects {
                id
                title
                description
                isOwner
            }
        }
        '''
        
        # Simular autenticación añadiendo user al context
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(query, context_value=context)
        
        assert 'errors' not in result
        data = result['data']['myProjects']
        assert len(data) == 1
        assert data[0]['title'] == 'Test Project'
        assert data[0]['isOwner'] is True
    
    def test_query_project_statistics(self):
        """Test query de estadísticas"""
        # Crear más proyectos
        Project.objects.create(
            title='Active Project',
            description='Active description',
            owner=self.user,
            status='active'
        )
        Project.objects.create(
            title='Completed Project',
            description='Completed description',
            owner=self.user,
            status='completed'
        )
        
        query = '''
        query {
            projectStatistics {
                totalProjects
                activeProjects
                completedProjects
                draftProjects
            }
        }
        '''
        
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(query, context_value=context)
        
        assert 'errors' not in result
        stats = result['data']['projectStatistics']
        assert stats['totalProjects'] == 3
        assert stats['activeProjects'] == 1
        assert stats['completedProjects'] == 1
        assert stats['draftProjects'] == 1

@pytest.mark.django_db
class TestGraphQLMutations:
    """Tests para mutations GraphQL"""
    
    def setup_method(self):
        """Setup para cada test"""
        self.client = Client(schema)
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
    
    def test_create_project_mutation(self):
        """Test mutation para crear proyecto"""
        mutation = '''
        mutation CreateProject($title: String!, $description: String!, $priority: Int) {
            createProject(title: $title, description: $description, priority: $priority) {
                project {
                    id
                    title
                    description
                    priority
                }
                success
                errors
            }
        }
        '''
        
        variables = {
            'title': 'New Project',
            'description': 'New description',
            'priority': 4
        }
        
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(mutation, variables=variables, context_value=context)
        
        assert 'errors' not in result
        data = result['data']['createProject']
        assert data['success'] is True
        assert data['project']['title'] == 'New Project'
        assert data['project']['priority'] == 4
        assert len(data['errors']) == 0
        
        # Verificar en BD
        assert Project.objects.filter(title='New Project').exists()
    
    def test_create_project_validation_error(self):
        """Test validation error en mutation"""
        mutation = '''
        mutation CreateProject($title: String!, $description: String!) {
            createProject(title: $title, description: $description) {
                project {
                    id
                    title
                }
                success
                errors
            }
        }
        '''
        
        variables = {
            'title': 'AB',  # Muy corto
            'description': 'Test description'
        }
        
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(mutation, variables=variables, context_value=context)
        
        assert 'errors' not in result
        data = result['data']['createProject']
        assert data['success'] is False
        assert len(data['errors']) > 0
        assert 'at least 3 characters' in data['errors'][0]
    
    def test_update_project_mutation(self):
        """Test mutation para actualizar proyecto"""
        project = Project.objects.create(
            title='Original Title',
            description='Original description',
            owner=self.user
        )
        
        mutation = '''
        mutation UpdateProject($id: ID!, $title: String, $status: String) {
            updateProject(id: $id, title: $title, status: $status) {
                project {
                    id
                    title
                    status
                }
                success
                errors
            }
        }
        '''
        
        variables = {
            'id': str(project.id),
            'title': 'Updated Title',
            'status': 'active'
        }
        
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(mutation, variables=variables, context_value=context)
        
        assert 'errors' not in result
        data = result['data']['updateProject']
        assert data['success'] is True
        assert data['project']['title'] == 'Updated Title'
        assert data['project']['status'] == 'active'
        
        # Verificar en BD
        project.refresh_from_db()
        assert project.title == 'Updated Title'
        assert project.status == 'active'
    
    def test_delete_project_permission_denied(self):
        """Test delete sin permisos"""
        other_user = User.objects.create_user(
            email='other@example.com',
            username='otheruser',
            password='testpass123'
        )
        
        project = Project.objects.create(
            title='Other User Project',
            description='Other description',
            owner=other_user
        )
        
        mutation = '''
        mutation DeleteProject($id: ID!) {
            deleteProject(id: $id) {
                success
                errors
            }
        }
        '''
        
        variables = {'id': str(project.id)}
        
        context = type('Context', (), {'user': self.user})()
        result = self.client.execute(mutation, variables=variables, context_value=context)
        
        assert 'errors' not in result
        data = result['data']['deleteProject']
        assert data['success'] is False
        assert 'owner' in data['errors'][0].lower()
```

---

## 🔄 **INTEGRATION TESTING**

### ✅ **END-TO-END TESTING**

```python
# ✅ CORRECTO: Tests de integración completa
# tests/test_integration.py
import pytest
from django.test import TransactionTestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from myapp.models import Project, Prediction
from myapp.services import MLModelService
from unittest.mock import patch, Mock
import tempfile
import os

User = get_user_model()

@pytest.mark.django_db
class TestProjectWorkflow:
    """Tests de workflow completo de proyectos"""
    
    def setup_method(self):
        """Setup para tests de integración"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_complete_project_lifecycle(self):
        """Test ciclo completo de proyecto"""
        # 1. Crear proyecto
        create_data = {
            'title': 'ML Research Project',
            'description': 'Machine learning research',
            'priority': 4
        }
        
        create_response = self.client.post('/api/projects/', create_data, format='json')
        assert create_response.status_code == 201
        
        project_id = create_response.json()['data']['id']
        
        # 2. Actualizar estado a activo
        update_response = self.client.patch(
            f'/api/projects/{project_id}/',
            {'status': 'active'},
            format='json'
        )
        assert update_response.status_code == 200
        assert update_response.json()['data']['status'] == 'active'
        
        # 3. Añadir colaborador
        collaborator = User.objects.create_user(
            email='collab@example.com',
            username='collaborator',
            password='testpass123'
        )
        
        collab_response = self.client.post(
            f'/api/projects/{project_id}/add_collaborator/',
            {'user_id': collaborator.id},
            format='json'
        )
        assert collab_response.status_code == 200
        
        # 4. Verificar colaborador puede ver proyecto
        self.client.force_authenticate(user=collaborator)
        
        list_response = self.client.get('/api/projects/')
        projects = list_response.json()['data']
        project_titles = [p['title'] for p in projects]
        assert 'ML Research Project' in project_titles
        
        # 5. Archivar proyecto (solo owner)
        self.client.force_authenticate(user=self.user)
        
        archive_response = self.client.post(f'/api/projects/{project_id}/archive/')
        assert archive_response.status_code == 200
        assert archive_response.json()['data']['status'] == 'archived'
        
        # 6. Verificar que colaborador ya no puede editarlo
        self.client.force_authenticate(user=collaborator)
        
        edit_response = self.client.patch(
            f'/api/projects/{project_id}/',
            {'title': 'Hacked Title'},
            format='json'
        )
        assert edit_response.status_code == 403

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class TestMLWorkflow:
    """Tests de workflow ML completo"""
    
    @patch('myapp.services.MLModelService.load_model')
    @patch('myapp.services.MLModelService.get_active_model')
    def test_ml_prediction_workflow(self, mock_get_model, mock_load_model):
        """Test workflow completo de ML"""
        
        # Setup mocks
        mock_model_record = Mock()
        mock_model_record.name = 'test_model'
        mock_model_record.version = '1.0'
        mock_model_record.model_type = 'classification'
        mock_get_model.return_value = mock_model_record
        
        mock_ml_model = Mock()
        mock_ml_model.predict.return_value = [[0.2, 0.8]]  # Clase 1 con 80% confianza
        mock_load_model.return_value = mock_ml_model
        
        # Setup usuario y autenticación
        user = User.objects.create_user(
            email='ml@example.com',
            username='mluser',
            password='testpass123'
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # 1. Hacer predicción
        prediction_data = {
            'model_name': 'test_model',
            'input_data': {
                'features': [1.0, 2.0, 3.0, 4.0]
            }
        }
        
        response = client.post('/api/ml/predict/', prediction_data, format='json')
        
        assert response.status_code == 200
        result = response.json()
        assert 'prediction' in result
        assert 'confidence' in result
        assert result['model_name'] == 'test_model'
        
        # 2. Verificar que se guardó la predicción
        prediction = Prediction.objects.filter(user=user).first()
        assert prediction is not None
        assert prediction.model.name == 'test_model'
        
        # 3. Obtener histórico de predicciones
        history_response = client.get('/api/predictions/')
        assert history_response.status_code == 200
        
        predictions = history_response.json()['data']
        assert len(predictions) == 1
        assert predictions[0]['prediction']['value'] == 1  # Clase predicha
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: Tests sin aislamiento**

```python
# ❌ MAL: Tests que dependen de estado externo
class BadTest(TestCase):
    def test_something(self):
        # Asume que existe data específica en BD
        project = Project.objects.get(id=1)  # ¡Puede fallar!
        # No usa fixtures ni setup
```

### ❌ **INCORRECTO: Tests con hardcoded IDs**

```typescript
// ❌ MAL: IDs hardcodeados en tests
it('should update project', () => {
  const response = api.put('/api/projects/123/', data)  // ID hardcoded
  expect(response.status).toBe(200)
})
```

### ❌ **INCORRECTO: Tests sin assertions**

```typescript
// ❌ MAL: Test que no verifica nada
it('should render component', () => {
  render(<MyComponent />)
  // ¡Sin expect/assert!
})
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **Vitest** configurado con jsdom y coverage  
✅ **Testing Library** para tests de componentes React  
✅ **pytest-django** para tests de backend  
✅ **Fixtures** para setup de datos de test  
✅ **Mocking** apropiado de APIs y servicios externos  
✅ **Tests de integración** end-to-end  
✅ **Separación** de tests unitarios vs integración  
✅ **GraphQL testing** con cliente de prueba  
✅ **API testing** con autenticación y permisos  
✅ **Coverage** de código > 80% en componentes críticos
