# cron.py
from django_cron import CronJobBase, Schedule
from .logica.importStock import import_stock_data  # Importa la función

class ImportStockDataCronJob(CronJobBase):
    RUN_EVERY_MINS = 1  # Ejecutar cada 1 minuto

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'myapp.import_stock_data_cron_job'  # Identificador único para el cron job

    def do(self):
        print("Iniciando la importación de datos de acciones...")
        import_stock_data()  # Llamar a la función directamente
        print("Datos de acciones importados.")