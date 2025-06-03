# Global Loading System Usage Guide

## Overview
The global loading system provides a centralized way to show loading states across the entire application using the `LoadingContext` and `useAsyncOperationWithLoading` hook.

## Components

### LoadingProvider
The provider that wraps the entire application and manages the global loading state.

```jsx
// Already integrated in main.jsx
<LoadingProvider>
  <App />
</LoadingProvider>
```

### GlobalLoadingOverlay
The visual overlay component that displays when global loading is active.

```jsx
// Already integrated in App.jsx
<GlobalLoadingOverlay />
```

## Hooks

### useAsyncOperationWithLoading
Enhanced hook that integrates with the global loading system.

#### Options:
- `useGlobalLoading`: boolean - Whether to show global loading overlay
- `showNotifications`: boolean - Whether to show success/error notifications  
- `defaultLoadingMessage`: string - Default loading message

#### Example Usage:

```jsx
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';

const MyComponent = () => {
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: true
  });

  const handleSubmit = async () => {
    await execute(
      async () => {
        // Your async operation
        const result = await api.fetchData();
        return result;
      },
      'Loading data...' // Custom loading message
    );
  };

  return (
    <button 
      onClick={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Submit'}
    </button>
  );
};
```

## Updated Components

The following components have been updated to use the global loading system:

### 1. Correlacion.jsx
- Uses global loading for correlation matrix calculations
- Shows success/error notifications
- Disables button during loading

### 2. Backtesting.jsx  
- Uses global loading for backtest execution
- Shows progress messages
- Enhanced error handling

### 3. Fundamental.jsx
- Uses global loading for fundamental data fetching
- Automatic success notifications
- Better UX with loading messages

### 4. SharpeRatio.jsx
- Uses global loading for Sharpe ratio calculations
- Sector-specific loading messages
- Integrated notifications

### 5. RetornosMensuales.jsx
- Uses global loading for monthly returns data
- Ticker-specific loading messages
- Success feedback

### 6. MediasMoviles.jsx
- Uses global loading for EMA signal calculations
- Progress indicators
- Result count notifications

## Benefits

1. **Consistent UX**: All loading states look and behave the same
2. **Centralized Management**: One place to control loading behavior
3. **Better Error Handling**: Automatic error notifications
4. **Progress Feedback**: Custom loading messages for different operations
5. **Accessibility**: Proper loading state management
6. **No Loading State Conflicts**: Reference counting prevents conflicts

## Best Practices

1. Always use `useGlobalLoading: true` for major operations that should block the UI
2. Provide descriptive loading messages
3. Keep local `isLoading` for button states and minor UI updates
4. Use notifications to provide feedback on operation completion
5. Handle errors gracefully with user-friendly messages

## Migration from Local Loading

Before (local loading):
```jsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await api.call();
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
```

After (global loading):
```jsx
const { execute, isLoading } = useAsyncOperationWithLoading({
  useGlobalLoading: true,
  showNotifications: true
});

const handleSubmit = async () => {
  await execute(
    async () => await api.call(),
    'Processing request...'
  );
};
```

## Testing
All existing tests continue to pass. The loading system is designed to be non-intrusive and maintains backward compatibility.
