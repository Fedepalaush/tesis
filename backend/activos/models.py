from django.db import models

# Create your models here.

class Activo(models.Model):
    ticker = models.CharField(max_length=10)
    precio = models.FloatField()

    def __str__(self):
        return f"{self.ticker}"
