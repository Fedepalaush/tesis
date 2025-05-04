import yfinance as yf
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pandas_ta as ta
from sklearn.metrics import confusion_matrix

def calcular_indicadores(df, indicadores):
    nuevas_columnas = []

    for indicador in indicadores:
        # Validación por si viene como tupla (e.g., (nombre, params))
        if isinstance(indicador, tuple):
            nombre = indicador[0]
            params = indicador[1] if len(indicador) > 1 else {}
        elif isinstance(indicador, dict):
            nombre = indicador.get("nombre", "")
            params = indicador.get("parametros", {})
        else:
            print("⚠️ Formato de indicador no válido:", indicador)
            continue

        nombre = nombre.upper()
        columnas_antes = set(df.columns)

        if nombre == "RSI":
            periodo = int(params.get("periodo", 14))
            df.ta.rsi(close="Close", length=periodo, append=True)

        elif nombre == "EMA":
            periodo = int(params.get("periodo", 20))
            df.ta.ema(close="Close", length=periodo, append=True)

        elif nombre == "SMA":
            periodo = int(params.get("periodo", 20))
            df.ta.sma(close="Close", length=periodo, append=True)

        elif nombre == "BOLLINGERBANDS":
            periodo = int(params.get("periodo", 20))
            stddev = float(params.get("stddev", 2))
            df.ta.bbands(close="Close", length=periodo, std=stddev, append=True)

        elif nombre == "MACD":
            fast = int(params.get("rapida", 12))
            slow = int(params.get("lenta", 26))
            signal = int(params.get("signal", 9))
            df.ta.macd(close="Close", fast=fast, slow=slow, signal=signal, append=True)
        else:
            print(f"⚠️ Indicador '{nombre}' no reconocido")
            continue

        columnas_despues = set(df.columns)
        nuevas = list(columnas_despues - columnas_antes)
        nuevas_columnas.extend(nuevas)

    return df, nuevas_columnas

def entrenar_modelo_service(data):
    try:
        ticker = data.get("ticker")
        inicio = data.get("start_date")
        fin = data.get("end_date")
        modelo = data.get("modelo")
        indicadores = data.get("indicadores", [])
        dias_prediccion = int(data.get("dias_prediccion", 1))

        if not all([ticker, inicio, fin, modelo]):
            return {"error": "Faltan campos obligatorios."}
        
        if not (1 <= dias_prediccion <= 10):
            return {"error": "La cantidad de días a predecir debe estar entre 1 y 10."}

        # 1. Descargar datos históricos
        df = yf.Ticker(ticker).history(start=inicio, end=fin)
        if df.empty:
            return {"error": f"No se encontraron datos para {ticker}"}

        df.reset_index(inplace=True)

        # 2. Calcular indicadores con pandas_ta
        df, nuevas_columnas = calcular_indicadores(df, indicadores)

        # 3. Limpiar NaNs
        df.dropna(inplace=True)

        # 4. Etiquetado: sube o baja en N días
        df["target"] = (df["Close"].shift(-dias_prediccion) > df["Close"]).astype(int)
        df.dropna(inplace=True)
        df = df.iloc[:-dias_prediccion]  # <-- Esto evita usar datos con targets que miran más allá del final

        # 5. Features: solo columnas generadas por indicadores
        features = [col for col in nuevas_columnas if col in df.columns]

        if not features:
            return {"error": "No se encontraron indicadores válidos para usar como features."}

        X = df[features]
        y = df["target"]

        # 6. División de datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 7. Selección del modelo
        if modelo == "RandomForest":
            clf = RandomForestClassifier(n_estimators=100, random_state=42)
        elif modelo == "LogisticRegression":
            clf = LogisticRegression(max_iter=1000)
        elif modelo == "SVM":
            clf = SVC()
        elif modelo == "XGBoost":
            clf = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        elif modelo == "KNN":
            clf = KNeighborsClassifier(n_neighbors=5)
        elif modelo == "NaiveBayes":
            clf = GaussianNB()
        else:
            return {"error": f"Modelo '{modelo}' no soportado."}

        # 8. Entrenamiento
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        print(y_pred)
        
        cm = confusion_matrix(y_test, y_pred)
        # 9. Métricas
        acc = round(accuracy_score(y_test, y_pred), 4)
        prec = round(precision_score(y_test, y_pred), 4)
        rec = round(recall_score(y_test, y_pred), 4)
        f1 = round(f1_score(y_test, y_pred), 4)

        # 10. Predicción de tendencia para los próximos días
        # Tomamos el último dato disponible de los datos históricos (última fila de df)
        ultimo_dato = df.iloc[-1:][features]  # Asegúrate de seleccionar solo las columnas de características

        # Predicción para el próximo día
        ultima_prediccion = clf.predict(ultimo_dato)
        print(ultima_prediccion)
        print(y_train.value_counts())
        # Si la predicción es 1, significa que el modelo predice un aumento en el precio
        prediccion_texto = "Subirá" if ultima_prediccion[0] == 1 else "Bajará"
        print("CM")
        print(cm)
        

        return {
            "mensaje": f"Modelo {modelo} entrenado exitosamente para {ticker}",
            "ticker": ticker,
            "modelo": modelo,
            "dias_prediccion": dias_prediccion,
            "rango_entrenamiento": f"{inicio} a {fin}",
            "features": features,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "prediccion": prediccion_texto,  # Agregar este campo para la predicción
            "confusion_matrix": cm.tolist(),
        }

    except Exception as e:
        return {"error": str(e)}
