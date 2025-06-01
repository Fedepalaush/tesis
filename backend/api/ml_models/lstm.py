from .base import BaseModel
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import numpy as np

class LSTMModel(BaseModel):
    def train(self, df, indicador):
        df = df.dropna().copy()
        df['Target'] = df['Close'].shift(-1) > df['Close']
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

        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])),
            LSTM(50),
            Dense(1, activation='sigmoid')
        ])
        self.model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        self.model.fit(X_train, y_train, epochs=10, batch_size=32, verbose=0)

        preds = (self.model.predict(X_test) > 0.5).astype(int)
        return self.evaluar_modelo(self.model, X_test, y_test)

    def predict(self, X):
        return (self.model.predict(X) > 0.5).astype(int)
