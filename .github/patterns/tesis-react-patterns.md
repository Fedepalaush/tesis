# 🎨 TESIS - REACT + TYPESCRIPT PATTERNS

## 📋 **PATRONES OBLIGATORIOS - REACT FRONTEND**

### ✅ **ESTRUCTURA DE COMPONENTES**

```typescript
// ✅ CORRECTO: Componente funcional con TypeScript
interface UserDashboardProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  userId, 
  onUpdate, 
  className = '' 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom hook para lógica reutilizable
  const { data, error } = useUserData(userId);
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Component content */}
    </div>
  );
};

export default UserDashboard;
```

### ✅ **CUSTOM HOOKS PATTERN**

```typescript
// ✅ CORRECTO: Custom hook con TypeScript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useApiData = <T>(endpoint: string): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<T>(endpoint);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};
```

### ✅ **CONTEXT PATTERN CON TYPESCRIPT**

```typescript
// ✅ CORRECTO: Context tipado con reducer
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AppAction = 
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar el context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

### ✅ **APOLLO CLIENT PATTERNS**

```typescript
// ✅ CORRECTO: GraphQL con Apollo Client
import { gql, useQuery, useMutation } from '@apollo/client';

// Query tipada
const GET_USERS = gql`
  query GetUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      email
      createdAt
    }
  }
`;

// Mutation tipada
const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

// Componente usando GraphQL
const UserList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<GetUsersQuery>(GET_USERS, {
    variables: { limit: 10 }
  });
  
  const [createUser] = useMutation<CreateUserMutation>(CREATE_USER, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error creating user:', error)
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error.message} />;
  
  return (
    <div className="space-y-4">
      {data?.users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### ✅ **FORM HANDLING PATTERNS**

```typescript
// ✅ CORRECTO: Form con validación TypeScript
interface FormData {
  name: string;
  email: string;
  password: string;
}

const UserForm: React.FC<{ onSubmit: (data: FormData) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (formData.password.length < 6) newErrors.password = 'Password min 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Name"
        value={formData.name}
        onChange={handleInputChange('name')}
        error={errors.name}
      />
      {/* More fields */}
    </form>
  );
};
```

---

## 🎨 **TAILWINDCSS PATTERNS**

### ✅ **COMPONENT STYLING PATTERNS**

```typescript
// ✅ CORRECTO: Tailwind con variant patterns
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
};
```

### ✅ **RESPONSIVE DESIGN PATTERNS**

```typescript
// ✅ CORRECTO: Layout responsivo con Tailwind
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <Navigation />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="md:col-span-1">
              <SidebarContent />
            </aside>
            
            {/* Content */}
            <section className="md:col-span-2 lg:col-span-3">
              {children}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
```

---

## 📊 **CHART INTEGRATION PATTERNS**

### ✅ **CHART.JS WITH REACT**

```typescript
// ✅ CORRECTO: Chart.js component tipado
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  color?: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6' 
}) => {
  const chartData = {
    labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Date' } },
      y: { display: true, title: { display: true, text: 'Value' } },
    },
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: Componente sin TypeScript**

```javascript
// ❌ MAL: Sin tipos, props no definidas
const BadComponent = ({ data, onClick }) => {
  return <div onClick={onClick}>{data}</div>;
};
```

### ❌ **INCORRECTO: Estado mal manejado**

```typescript
// ❌ MAL: Muchos useState separados
const BadForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // ... más estados
};
```

### ❌ **INCORRECTO: Estilos inline mezclados**

```typescript
// ❌ MAL: Mezclar Tailwind con styles inline
const BadComponent = () => (
  <div className="bg-blue-500" style={{ padding: '20px', margin: '10px' }}>
    Content
  </div>
);
```

---

## ✅ **TESTING PATTERNS CON VITEST**

```typescript
// ✅ CORRECTO: Test tipado con Vitest
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserForm from './UserForm';

describe('UserForm', () => {
  it('should call onSubmit with form data', async () => {
    const mockOnSubmit = vi.fn();
    
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **TypeScript** en todos los componentes nuevos  
✅ **Functional Components** con hooks  
✅ **Custom Hooks** para lógica reutilizable  
✅ **Context + Reducer** para estado global  
✅ **TailwindCSS** para estilos consistentes  
✅ **Apollo Client** para GraphQL  
✅ **Vitest** para testing  
✅ **Props tipadas** con interfaces  
✅ **Error boundaries** para componentes críticos
