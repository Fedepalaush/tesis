# 🤖 TESIS - MACHINE LEARNING + TENSORFLOW PATTERNS

## 📋 **PATRONES OBLIGATORIOS - ML INTEGRATION**

### ✅ **TENSORFLOW MODEL PATTERNS**

```python
# ✅ CORRECTO: Modelo TensorFlow con estructura clara
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from typing import Tuple, Dict, Any

class BaseMLModel:
    """Clase base para modelos de ML"""
    
    def __init__(self, model_name: str, model_version: str = "1.0"):
        self.model_name = model_name
        self.model_version = model_version
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.metrics = {}
        
    def preprocess_data(self, data: pd.DataFrame) -> np.ndarray:
        """Preprocesar datos para entrenamiento/predicción"""
        raise NotImplementedError
    
    def build_model(self) -> keras.Model:
        """Construir arquitectura del modelo"""
        raise NotImplementedError
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> Dict[str, Any]:
        """Entrenar el modelo"""
        raise NotImplementedError
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Hacer predicciones"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict(X)
    
    def save_model(self, path: str):
        """Guardar modelo y componentes"""
        os.makedirs(path, exist_ok=True)
        
        # Guardar modelo TensorFlow
        self.model.save(os.path.join(path, f"{self.model_name}.h5"))
        
        # Guardar scaler si existe
        if self.scaler:
            joblib.dump(self.scaler, os.path.join(path, f"{self.model_name}_scaler.pkl"))
        
        # Guardar metadatos
        metadata = {
            'model_name': self.model_name,
            'model_version': self.model_version,
            'is_trained': self.is_trained,
            'metrics': self.metrics
        }
        joblib.dump(metadata, os.path.join(path, f"{self.model_name}_metadata.pkl"))
    
    def load_model(self, path: str):
        """Cargar modelo y componentes"""
        # Cargar modelo TensorFlow
        self.model = keras.models.load_model(os.path.join(path, f"{self.model_name}.h5"))
        
        # Cargar scaler si existe
        scaler_path = os.path.join(path, f"{self.model_name}_scaler.pkl")
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        
        # Cargar metadatos
        metadata = joblib.load(os.path.join(path, f"{self.model_name}_metadata.pkl"))
        self.model_version = metadata['model_version']
        self.is_trained = metadata['is_trained']
        self.metrics = metadata['metrics']

class TimeSeriesPredictionModel(BaseMLModel):
    """Modelo para predicción de series temporales"""
    
    def __init__(self, sequence_length: int = 60, features: int = 1):
        super().__init__("timeseries_prediction", "1.0")
        self.sequence_length = sequence_length
        self.features = features
        self.scaler = StandardScaler()
    
    def preprocess_data(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocesar datos de series temporales"""
        # Normalizar datos
        scaled_data = self.scaler.fit_transform(data.values.reshape(-1, 1))
        
        # Crear secuencias
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i, 0])
            y.append(scaled_data[i, 0])
        
        return np.array(X), np.array(y)
    
    def build_model(self) -> keras.Model:
        """Construir modelo LSTM para series temporales"""
        model = keras.Sequential([
            # Primera capa LSTM
            layers.LSTM(
                units=50,
                return_sequences=True,
                input_shape=(self.sequence_length, self.features)
            ),
            layers.Dropout(0.2),
            
            # Segunda capa LSTM
            layers.LSTM(units=50, return_sequences=True),
            layers.Dropout(0.2),
            
            # Tercera capa LSTM
            layers.LSTM(units=50, return_sequences=False),
            layers.Dropout(0.2),
            
            # Capas densas
            layers.Dense(units=25, activation='relu'),
            layers.Dense(units=1)
        ])
        
        model.compile(
            optimizer='adam',
            loss='mean_squared_error',
            metrics=['mae', 'mse']
        )
        
        return model
    
    def train(self, data: pd.DataFrame, validation_split: float = 0.2, epochs: int = 100, batch_size: int = 32) -> Dict[str, Any]:
        """Entrenar modelo de series temporales"""
        # Preprocesar datos
        X, y = self.preprocess_data(data)
        
        # Reshape para LSTM [samples, time steps, features]
        X = X.reshape((X.shape[0], X.shape[1], self.features))
        
        # Construir modelo
        self.model = self.build_model()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                patience=10,
                restore_best_weights=True,
                monitor='val_loss'
            ),
            keras.callbacks.ReduceLROnPlateau(
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                monitor='val_loss'
            )
        ]
        
        # Entrenar modelo
        history = self.model.fit(
            X, y,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.is_trained = True
        
        # Guardar métricas
        self.metrics = {
            'final_loss': float(history.history['loss'][-1]),
            'final_val_loss': float(history.history['val_loss'][-1]),
            'final_mae': float(history.history['mae'][-1]),
            'final_val_mae': float(history.history['val_mae'][-1]),
            'epochs_trained': len(history.history['loss'])
        }
        
        return self.metrics
    
    def predict_future(self, data: pd.DataFrame, steps: int = 30) -> np.ndarray:
        """Predecir valores futuros"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Usar los últimos sequence_length valores
        last_sequence = data.tail(self.sequence_length).values
        scaled_sequence = self.scaler.transform(last_sequence.reshape(-1, 1))
        
        predictions = []
        current_sequence = scaled_sequence.reshape(1, self.sequence_length, self.features)
        
        for _ in range(steps):
            # Predecir siguiente valor
            pred = self.model.predict(current_sequence, verbose=0)
            predictions.append(pred[0, 0])
            
            # Actualizar secuencia para próxima predicción
            current_sequence = np.roll(current_sequence, -1, axis=1)
            current_sequence[0, -1, 0] = pred[0, 0]
        
        # Desnormalizar predicciones
        predictions = np.array(predictions).reshape(-1, 1)
        return self.scaler.inverse_transform(predictions).flatten()

class ClassificationModel(BaseMLModel):
    """Modelo para clasificación"""
    
    def __init__(self, num_classes: int, input_shape: Tuple[int, ...]):
        super().__init__("classification", "1.0")
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.scaler = StandardScaler()
    
    def preprocess_data(self, X: np.ndarray, y: np.ndarray = None) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocesar datos para clasificación"""
        # Normalizar features
        X_scaled = self.scaler.fit_transform(X)
        
        # One-hot encode labels si se proporcionan
        if y is not None:
            y_categorical = keras.utils.to_categorical(y, num_classes=self.num_classes)
            return X_scaled, y_categorical
        
        return X_scaled, None
    
    def build_model(self) -> keras.Model:
        """Construir modelo de clasificación"""
        model = keras.Sequential([
            layers.Dense(128, activation='relu', input_shape=self.input_shape),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(64, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def train(self, X: np.ndarray, y: np.ndarray, validation_split: float = 0.2, epochs: int = 100, batch_size: int = 32) -> Dict[str, Any]:
        """Entrenar modelo de clasificación"""
        # Preprocesar datos
        X_processed, y_processed = self.preprocess_data(X, y)
        
        # Construir modelo
        self.model = self.build_model()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                patience=15,
                restore_best_weights=True,
                monitor='val_accuracy'
            ),
            keras.callbacks.ReduceLROnPlateau(
                factor=0.5,
                patience=7,
                min_lr=1e-7,
                monitor='val_loss'
            )
        ]
        
        # Entrenar
        history = self.model.fit(
            X_processed, y_processed,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.is_trained = True
        
        # Guardar métricas
        self.metrics = {
            'final_accuracy': float(history.history['accuracy'][-1]),
            'final_val_accuracy': float(history.history['val_accuracy'][-1]),
            'final_loss': float(history.history['loss'][-1]),
            'final_val_loss': float(history.history['val_loss'][-1]),
            'epochs_trained': len(history.history['loss'])
        }
        
        return self.metrics
```

### ✅ **DJANGO INTEGRATION PATTERNS**

```python
# ✅ CORRECTO: Integración ML con Django
# models.py
from django.db import models
from django.contrib.auth.models import User
import json

class MLModel(models.Model):
    """Modelo para gestionar modelos de ML"""
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    model_type = models.CharField(max_length=50)
    file_path = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadatos del modelo
    input_shape = models.JSONField(default=dict)
    output_shape = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    hyperparameters = models.JSONField(default=dict)
    
    class Meta:
        unique_together = ['name', 'version']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} v{self.version}"

class Prediction(models.Model):
    """Modelo para almacenar predicciones"""
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    input_data = models.JSONField()
    prediction = models.JSONField()
    confidence = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Prediction by {self.model.name} at {self.created_at}"

class TrainingJob(models.Model):
    """Modelo para trabajos de entrenamiento"""
    name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('running', 'Running'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    # Configuración del entrenamiento
    training_config = models.JSONField(default=dict)
    dataset_path = models.CharField(max_length=255)
    
    # Resultados
    final_metrics = models.JSONField(default=dict)
    model_path = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Training: {self.name} ({self.status})"

# services.py
from .models import MLModel, Prediction, TrainingJob
from .ml_models import TimeSeriesPredictionModel, ClassificationModel
import os
from django.conf import settings
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

class MLModelService:
    """Service para gestionar modelos de ML"""
    
    @staticmethod
    def get_active_model(model_name: str) -> MLModel:
        """Obtener modelo activo por nombre"""
        try:
            return MLModel.objects.get(name=model_name, is_active=True)
        except MLModel.DoesNotExist:
            raise ValueError(f"No active model found with name: {model_name}")
    
    @staticmethod
    def load_model(model_record: MLModel):
        """Cargar modelo desde archivo"""
        if model_record.model_type == 'timeseries':
            model = TimeSeriesPredictionModel()
        elif model_record.model_type == 'classification':
            input_shape = tuple(model_record.input_shape['shape'])
            num_classes = model_record.output_shape['classes']
            model = ClassificationModel(num_classes, input_shape)
        else:
            raise ValueError(f"Unknown model type: {model_record.model_type}")
        
        model.load_model(model_record.file_path)
        return model
    
    @staticmethod
    def make_prediction(model_name: str, input_data: dict, user) -> dict:
        """Hacer predicción con modelo"""
        try:
            # Obtener modelo activo
            model_record = MLModelService.get_active_model(model_name)
            
            # Cargar modelo
            model = MLModelService.load_model(model_record)
            
            # Preparar datos de entrada
            X = np.array(input_data['features']).reshape(1, -1)
            
            # Hacer predicción
            prediction = model.predict(X)
            confidence = None
            
            # Para clasificación, calcular confianza
            if model_record.model_type == 'classification':
                confidence = float(np.max(prediction))
                prediction = int(np.argmax(prediction))
            else:
                prediction = float(prediction[0])
            
            # Guardar predicción en BD
            prediction_record = Prediction.objects.create(
                model=model_record,
                user=user,
                input_data=input_data,
                prediction={'value': prediction},
                confidence=confidence
            )
            
            return {
                'prediction': prediction,
                'confidence': confidence,
                'model_name': model_name,
                'model_version': model_record.version,
                'prediction_id': prediction_record.id
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise

@shared_task
def train_model_task(training_job_id: int):
    """Tarea Celery para entrenar modelo"""
    try:
        job = TrainingJob.objects.get(id=training_job_id)
        job.status = 'running'
        job.started_at = timezone.now()
        job.save()
        
        # Cargar configuración
        config = job.training_config
        model_type = job.model_type
        
        # Cargar datos
        data = pd.read_csv(job.dataset_path)
        
        # Crear modelo según tipo
        if model_type == 'timeseries':
            model = TimeSeriesPredictionModel(
                sequence_length=config.get('sequence_length', 60)
            )
            metrics = model.train(data, **config.get('training_params', {}))
        elif model_type == 'classification':
            # Preparar datos X, y
            X = data.iloc[:, :-1].values
            y = data.iloc[:, -1].values
            
            model = ClassificationModel(
                num_classes=config['num_classes'],
                input_shape=(X.shape[1],)
            )
            metrics = model.train(X, y, **config.get('training_params', {}))
        
        # Guardar modelo
        model_path = os.path.join(
            settings.ML_MODELS_DIR,
            f"{job.name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
        )
        model.save_model(model_path)
        
        # Crear registro del modelo
        ml_model = MLModel.objects.create(
            name=job.name,
            version="1.0",
            model_type=model_type,
            file_path=model_path,
            input_shape={'shape': list(model.input_shape) if hasattr(model, 'input_shape') else []},
            output_shape={'classes': model.num_classes if hasattr(model, 'num_classes') else 1},
            metrics=metrics,
            hyperparameters=config
        )
        
        # Actualizar job
        job.status = 'completed'
        job.completed_at = timezone.now()
        job.final_metrics = metrics
        job.model_path = model_path
        job.save()
        
        logger.info(f"Training completed for job {training_job_id}")
        
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
        job.completed_at = timezone.now()
        job.save()
        
        logger.error(f"Training failed for job {training_job_id}: {str(e)}")
```

### ✅ **API ENDPOINTS PARA ML**

```python
# ✅ CORRECTO: ViewSets para ML API
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import MLModelService
from .tasks import train_model_task

class MLModelViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de modelos ML"""
    serializer_class = MLModelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MLModel.objects.all()
    
    @action(detail=False, methods=['post'])
    def predict(self, request):
        """Endpoint para hacer predicciones"""
        try:
            model_name = request.data.get('model_name')
            input_data = request.data.get('input_data')
            
            if not model_name or not input_data:
                return Response(
                    {'error': 'model_name and input_data are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = MLModelService.make_prediction(
                model_name=model_name,
                input_data=input_data,
                user=request.user
            )
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def train(self, request):
        """Endpoint para iniciar entrenamiento"""
        try:
            data = request.data
            
            # Crear job de entrenamiento
            training_job = TrainingJob.objects.create(
                name=data['name'],
                model_type=data['model_type'],
                training_config=data['config'],
                dataset_path=data['dataset_path']
            )
            
            # Iniciar tarea de entrenamiento
            train_model_task.delay(training_job.id)
            
            return Response(
                {
                    'message': 'Training started',
                    'job_id': training_job.id
                },
                status=status.HTTP_202_ACCEPTED
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def training_status(self, request):
        """Obtener estado de entrenamientos"""
        job_id = request.query_params.get('job_id')
        
        if job_id:
            try:
                job = TrainingJob.objects.get(id=job_id)
                serializer = TrainingJobSerializer(job)
                return Response(serializer.data)
            except TrainingJob.DoesNotExist:
                return Response(
                    {'error': 'Training job not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Listar todos los jobs del usuario
        jobs = TrainingJob.objects.filter(
            # Filtrar por usuario si es necesario
        ).order_by('-created_at')[:10]
        
        serializer = TrainingJobSerializer(jobs, many=True)
        return Response(serializer.data)

# GraphQL para ML
class MLModelType(DjangoObjectType):
    """Tipo GraphQL para modelo ML"""
    class Meta:
        model = MLModel
        fields = '__all__'

class PredictionType(DjangoObjectType):
    """Tipo GraphQL para predicción"""
    class Meta:
        model = Prediction
        fields = '__all__'

class MakePredictionMutation(graphene.Mutation):
    """Mutation para hacer predicción"""
    class Arguments:
        model_name = graphene.String(required=True)
        input_data = graphene.JSONString(required=True)
    
    prediction = graphene.Field(PredictionType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    @login_required
    def mutate(self, info, model_name, input_data):
        try:
            result = MLModelService.make_prediction(
                model_name=model_name,
                input_data=json.loads(input_data),
                user=info.context.user
            )
            
            prediction = Prediction.objects.get(id=result['prediction_id'])
            
            return MakePredictionMutation(
                prediction=prediction,
                success=True,
                errors=[]
            )
            
        except Exception as e:
            return MakePredictionMutation(
                prediction=None,
                success=False,
                errors=[str(e)]
            )
```

---

## 🚀 **DEPLOYMENT PATTERNS**

### ✅ **MODEL SERVING CON TENSORFLOW SERVING**

```dockerfile
# ✅ CORRECTO: Dockerfile para TensorFlow Serving
FROM tensorflow/serving:latest

# Copiar modelos
COPY models/ /models/

# Configuración
ENV MODEL_NAME=timeseries_model
ENV MODEL_BASE_PATH=/models

# Exponer puerto
EXPOSE 8501

# Comando de inicio
CMD ["tensorflow_model_server", "--rest_api_port=8501", "--model_name=${MODEL_NAME}", "--model_base_path=${MODEL_BASE_PATH}"]
```

```yaml
# ✅ CORRECTO: Servicio ML en docker-compose
# Añadir al docker-compose.yml principal
services:
  # ... otros servicios ...
  
  ml-serving:
    build:
      context: ./ml-serving
      dockerfile: Dockerfile
    container_name: tesis_ml_serving
    ports:
      - "8501:8501"
    volumes:
      - ./ml-models:/models
    environment:
      - MODEL_NAME=timeseries_model
      - MODEL_BASE_PATH=/models
    networks:
      - tesis_network
    restart: unless-stopped

  # Worker para tareas ML
  ml-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: tesis_ml_worker
    command: celery -A backend worker -l info -Q ml_tasks
    environment:
      - DATABASE_URL=postgresql://tesis_user:${DB_PASSWORD:-secure_password}@timescaledb:5432/tesis_db
      - REDIS_URL=redis://redis:6379/0
      - ML_MODELS_DIR=/app/ml_models
    volumes:
      - ./backend:/app
      - ./ml-models:/app/ml_models
    depends_on:
      timescaledb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tesis_network
    restart: unless-stopped
```

---

## 📊 **DATA PIPELINE PATTERNS**

### ✅ **ETL PARA TRAINING DATA**

```python
# ✅ CORRECTO: Pipeline ETL para datos de entrenamiento
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

class DataPipeline:
    """Pipeline para preprocesamiento de datos"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.is_fitted = False
    
    def extract_timeseries_data(self, source: str, **kwargs) -> pd.DataFrame:
        """Extraer datos de series temporales"""
        if source == 'database':
            # Extraer desde TimescaleDB
            query = """
            SELECT timestamp, value, sensor_id
            FROM sensor_readings
            WHERE timestamp >= %s AND timestamp <= %s
            ORDER BY timestamp
            """
            data = pd.read_sql(query, connection, params=kwargs.values())
        elif source == 'csv':
            data = pd.read_csv(kwargs['file_path'])
        else:
            raise ValueError(f"Unsupported source: {source}")
        
        return data
    
    def clean_timeseries_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Limpiar datos de series temporales"""
        # Remover duplicados
        data = data.drop_duplicates()
        
        # Manejar valores faltantes
        data = data.fillna(method='forward').fillna(method='backward')
        
        # Remover outliers (método IQR)
        Q1 = data['value'].quantile(0.25)
        Q3 = data['value'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        data = data[(data['value'] >= lower_bound) & (data['value'] <= upper_bound)]
        
        # Resample para intervalos regulares si es necesario
        if 'timestamp' in data.columns:
            data['timestamp'] = pd.to_datetime(data['timestamp'])
            data = data.set_index('timestamp').resample('1H').mean().dropna()
        
        return data
    
    def transform_features(self, data: pd.DataFrame, feature_columns: list) -> pd.DataFrame:
        """Transformar features"""
        transformed_data = data.copy()
        
        for column in feature_columns:
            if data[column].dtype in ['object', 'category']:
                # Encoding categórico
                if column not in self.encoders:
                    self.encoders[column] = LabelEncoder()
                    transformed_data[column] = self.encoders[column].fit_transform(data[column])
                else:
                    transformed_data[column] = self.encoders[column].transform(data[column])
            
            elif data[column].dtype in ['int64', 'float64']:
                # Scaling numérico
                if column not in self.scalers:
                    self.scalers[column] = StandardScaler()
                    transformed_data[column] = self.scalers[column].fit_transform(
                        data[column].values.reshape(-1, 1)
                    ).flatten()
                else:
                    transformed_data[column] = self.scalers[column].transform(
                        data[column].values.reshape(-1, 1)
                    ).flatten()
        
        return transformed_data
    
    def create_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Crear features derivadas"""
        feature_data = data.copy()
        
        # Features temporales si hay timestamp
        if 'timestamp' in data.columns:
            feature_data['hour'] = data['timestamp'].dt.hour
            feature_data['day_of_week'] = data['timestamp'].dt.dayofweek
            feature_data['month'] = data['timestamp'].dt.month
            feature_data['quarter'] = data['timestamp'].dt.quarter
        
        # Features estadísticas móviles
        if 'value' in data.columns:
            feature_data['rolling_mean_7'] = data['value'].rolling(window=7).mean()
            feature_data['rolling_std_7'] = data['value'].rolling(window=7).std()
            feature_data['rolling_mean_30'] = data['value'].rolling(window=30).mean()
            feature_data['rolling_std_30'] = data['value'].rolling(window=30).std()
            
            # Lag features
            for lag in [1, 2, 3, 7, 14]:
                feature_data[f'lag_{lag}'] = data['value'].shift(lag)
        
        # Remover NaN creados por rolling/lag
        feature_data = feature_data.dropna()
        
        return feature_data
    
    def split_data(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2, random_state: int = 42) -> Tuple[np.ndarray, ...]:
        """Dividir datos en train/test"""
        return train_test_split(X, y, test_size=test_size, random_state=random_state)
    
    def process_timeseries_data(self, source: str, target_column: str, **kwargs) -> Dict[str, Any]:
        """Pipeline completo para datos de series temporales"""
        logger.info("Starting timeseries data processing pipeline")
        
        # Extract
        data = self.extract_timeseries_data(source, **kwargs)
        logger.info(f"Extracted {len(data)} records")
        
        # Clean
        data = self.clean_timeseries_data(data)
        logger.info(f"After cleaning: {len(data)} records")
        
        # Feature engineering
        data = self.create_features(data)
        logger.info(f"After feature engineering: {len(data)} records, {data.shape[1]} features")
        
        # Transform
        feature_columns = [col for col in data.columns if col != target_column]
        data = self.transform_features(data, feature_columns)
        
        # Prepare X, y
        X = data[feature_columns].values
        y = data[target_column].values
        
        # Split
        X_train, X_test, y_train, y_test = self.split_data(X, y)
        
        self.is_fitted = True
        
        return {
            'X_train': X_train,
            'X_test': X_test,
            'y_train': y_train,
            'y_test': y_test,
            'feature_names': feature_columns,
            'data_shape': data.shape
        }

# Tarea Celery para pipeline de datos
@shared_task
def run_data_pipeline(config: dict):
    """Ejecutar pipeline de datos"""
    try:
        pipeline = DataPipeline()
        result = pipeline.process_timeseries_data(**config)
        
        # Guardar datos procesados
        output_path = config.get('output_path', '/tmp/processed_data.pkl')
        joblib.dump(result, output_path)
        
        logger.info(f"Data pipeline completed. Output saved to {output_path}")
        return {'status': 'success', 'output_path': output_path}
        
    except Exception as e:
        logger.error(f"Data pipeline failed: {str(e)}")
        return {'status': 'failed', 'error': str(e)}
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: Modelo sin estructura**

```python
# ❌ MAL: Código ML sin organización
import tensorflow as tf

# Sin clases, sin estructura, todo en funciones globales
def train_model(data):
    model = tf.keras.Sequential([...])  # Sin configuración
    model.fit(data)  # Sin validación
    return model  # Sin guardar métricas

def predict(model, data):
    return model.predict(data)  # Sin preprocesamiento
```

### ❌ **INCORRECTO: Sin gestión de versiones**

```python
# ❌ MAL: Sin versionado de modelos
model.save('model.h5')  # Sobrescribe siempre el mismo archivo
# Sin metadatos, sin tracking de experimentos
```

### ❌ **INCORRECTO: Datos sin validación**

```python
# ❌ MAL: Sin validación de datos
def train(data):
    model.fit(data)  # Sin verificar calidad de datos
    # Sin detectar outliers, sin manejar NaN
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **Clases base** para modelos ML con interfaces consistentes  
✅ **Versionado de modelos** con metadatos completos  
✅ **Pipeline de datos** con validación y limpieza  
✅ **Integración Django** con models y APIs  
✅ **Tareas asíncronas** con Celery para entrenamiento  
✅ **TensorFlow Serving** para deployment escalable  
✅ **Logging comprehensivo** para debugging  
✅ **Validación de datos** antes de entrenamiento  
✅ **Gestión de experimentos** con tracking de métricas
patterns