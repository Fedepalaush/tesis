import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import pandas_ta as ta
from ..models import StockData


def calcular_indicadores(df, indicadores):
    nuevas_columnas = []

    for indicador in indicadores:
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


def crear_secuencias(X, y, ventana=10):
    X_seq, y_seq = [], []
    for i in range(len(X) - ventana):
        X_seq.append(X.iloc[i:i+ventana].values)
        y_seq.append(y.iloc[i+ventana])
    return np.array(X_seq), np.array(y_seq)


def entrenar_modelo_service(data):
    try:
        ticker = data.get("ticker")
        inicio = data.get("start_date")
        fin = data.get("end_date")
        modelo = data.get("modelo")
        indicadores = data.get("indicadores", [])
        dias_prediccion = int(data.get("dias_prediccion", 1))
        escalador = data.get("escalador", "").lower()  # puede ser: standard, minmax, robust

        if not all([ticker, inicio, fin, modelo]):
            return {"error": "Faltan campos obligatorios."}
        
        if not (1 <= dias_prediccion <= 10):
            return {"error": "La cantidad de días a predecir debe estar entre 1 y 10."}

        data = StockData.objects.filter(ticker=ticker, date__range=(inicio, fin)).order_by('date').values()
        df = pd.DataFrame(data)

        if df.empty:
            return {"error": f"No se encontraron datos para {ticker}"}

        df.reset_index(inplace=True)
        df, nuevas_columnas = calcular_indicadores(df, indicadores)
        df.dropna(inplace=True)

        df["target"] = (df["close_price"].shift(-dias_prediccion) > df["close_price"]).astype(int)
        df.dropna(inplace=True)
        df = df.iloc[:-dias_prediccion]

        features = [col for col in nuevas_columnas if col in df.columns]
        if not features:
            return {"error": "No se encontraron indicadores válidos para usar como features."}

        X = df[features]
        y = df["target"]

        # Aplicar escalador si se solicitó
        scaler = None
        if escalador == "standard":
            scaler = StandardScaler()
        elif escalador == "minmax":
            scaler = MinMaxScaler()
        elif escalador == "robust":
            scaler = RobustScaler()

        if scaler:
            X = pd.DataFrame(scaler.fit_transform(X), columns=features)

        if modelo == "LSTM":
            ventana = 10
            X_seq, y_seq = crear_secuencias(X, y, ventana)
            X_train, X_test, y_train, y_test = train_test_split(X_seq, y_seq, test_size=0.2, random_state=42)

            model = Sequential()
            model.add(LSTM(64, return_sequences=False, input_shape=(X_train.shape[1], X_train.shape[2])))
            model.add(Dropout(0.2))
            model.add(Dense(1, activation='sigmoid'))
            model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
            early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
            model.fit(X_train, y_train, epochs=20, batch_size=32, validation_split=0.2, callbacks=[early_stop], verbose=0)

            y_pred_prob = model.predict(X_test)
            y_pred = (y_pred_prob > 0.5).astype(int).reshape(-1)

            ultima_ventana = X_seq[-1:]
            ultima_prediccion = model.predict(ultima_ventana)
            ultima_pred_clase = int((ultima_prediccion > 0.5).astype(int)[0][0])
        else:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

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

            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)

            ultima_dato = X.iloc[[-1]]
            ultima_pred_clase = clf.predict(ultima_dato)[0]

        cm = confusion_matrix(y_test, y_pred)
        acc = round(accuracy_score(y_test, y_pred), 4)
        prec = round(precision_score(y_test, y_pred), 4)
        rec = round(recall_score(y_test, y_pred), 4)
        f1 = round(f1_score(y_test, y_pred), 4)

        prediccion_texto = "Subirá" if ultima_pred_clase == 1 else "Bajará"

        return {
            "mensaje": f"Modelo {modelo} entrenado exitosamente para {ticker}",
            "ticker": ticker,
            "modelo": modelo,
            "escalador": escalador or "ninguno",
            "dias_prediccion": dias_prediccion,
            "rango_entrenamiento": f"{inicio} a {fin}",
            "features": features,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "prediccion": prediccion_texto,
            "confusion_matrix": cm.tolist(),
        }

    except Exception as e:
        return {"error": str(e)}
