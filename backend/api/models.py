from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Activo(models.Model):
    ticker = models.CharField(max_length=10)
    cantidad = models.IntegerField(default=1)
    precioCompra = models.FloatField()
    precioActual = models.FloatField(null=True)
    precioVenta = models.FloatField(null=True)
    fechaCompra = models.DateTimeField(auto_now_add=True)
    fechaVenta = models.DateTimeField(null=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    recomendacion = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return f"{self.ticker}"
    
    
    
class StockData(models.Model):
    ticker = models.CharField(max_length=10)
    date = models.DateField()
    open_price = models.FloatField()
    high_price = models.FloatField()
    low_price = models.FloatField()
    close_price = models.FloatField()
    volume = models.BigIntegerField()

    class Meta:
        unique_together = ('ticker', 'date')
        ordering = ['date']