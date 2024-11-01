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
    ticker = models.CharField(max_length=10)  # Eliminar primary_key=True
    date = models.DateTimeField()
    open_price = models.FloatField(null=True, blank=True)
    high_price = models.FloatField(null=True, blank=True)
    low_price = models.FloatField(null=True, blank=True)
    close_price = models.FloatField(null=True, blank=True)
    volume = models.BigIntegerField()

    class Meta:
        unique_together = (('ticker', 'date'),)  # Mantener la combinación única
        managed = False  # Django no manejará las migraciones para esta tabla

    def __str__(self):
        return f"{self.ticker} - {self.date}"