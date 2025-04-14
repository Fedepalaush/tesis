from sklearn.metrics import accuracy_score, mean_absolute_error

def preparar_datos(df, indicador):
    df = df.dropna().copy()
    df['Target'] = df['Close'].shift(-1) > df['Close']
    df.dropna(inplace=True)

    X = df[[indicador]].values[:-1]
    y = df['Target'].astype(int).values[:-1]

    X_train, X_test = X[:-100], X[-100:]
    y_train, y_test = y[:-100], y[-100:]

    return X_train, X_test, y_train, y_test

def evaluar_modelo(model, X_test, y_test):
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)

    return {
        "accuracy": acc,
        "mae": mae,
        "real": y_test.tolist(),
        "predicciones": preds.tolist()
    }
