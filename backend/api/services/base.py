from abc import ABC, abstractmethod
from django.core.cache import cache

class BaseService(ABC):
    def get_cached_data(self, cache_key):
        """Retrieve data from cache."""
        return cache.get(cache_key)

    def set_cached_data(self, cache_key, data, timeout=3600):
        """Store data in cache with a timeout."""
        cache.set(cache_key, data, timeout)

    def handle_exception(self, exception, context="Unknown context"):
        """Handle exceptions and log them."""
        # Replace with actual logging logic if needed
        print(f"Exception in {context}: {exception}")

    @abstractmethod
    def execute(self, *args, **kwargs):
        """Abstract method to be implemented by derived services."""
        pass
