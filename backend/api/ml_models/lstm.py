import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.preprocessing import MinMaxScaler

def entrenar_lstm(df, indicador):
    df = df.dropna().copy()
    df['Target'] = df['Close'].shift(-1) > df['Close']  # simple binary prediction
    df.dropna(inplace=True)

    scaler = MinMaxScaler()
    features = scaler.fit_transform(df[[indicador]])

    X = []
    y = df['Target'].astype(int).values
    for i in range(10, len(features)):
        X.append(features[i-10:i])

    X = np.array(X)
    y = y[10:]

    X_train, X_test = X[:-100], X[-100:]
    y_train, y_test = y[:-100], y[-100:]

    model = Sequential()
    model.add(LSTM(50, return_sequences=False, input_shape=(X.shape[1], X.shape[2])))
    model.add(Dense(1, activation='sigmoid'))
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    history = model.fit(X_train, y_train, epochs=5, batch_size=16, verbose=0)

    preds = (model.predict(X_test) > 0.5).astype(int).flatten()
    acc = accuracy_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)

    return {
        "accuracy": acc,
        "mae": mae,
        "real": y_test.tolist(),
        "predicciones": preds.tolist(),
        "loss": history.history["loss"]
    }
