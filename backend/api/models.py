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

    def __str__(self):
        return f"{self.ticker}"
