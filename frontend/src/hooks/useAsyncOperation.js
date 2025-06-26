export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const execute = async (asyncFunction, {
    successMessage,
    errorMessage,
    showSuccessNotification = false
  } = {}) => {
    try {
      setIsLoading(true);
      const result = await asyncFunction();

      if (successMessage && showSuccessNotification) {
        showNotification(successMessage, 'success');
      }

      return result;
    } catch (err) {
      const userError = getUserErrorMessage(err);
      showNotification(errorMessage || userError, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
