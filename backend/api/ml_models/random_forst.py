from sklearn.ensemble import RandomForestClassifier
from .base import preparar_datos, evaluar_modelo

def entrenar_random_forest(df, indicador):
    X_train, X_test, y_train, y_test = preparar_datos(df, indicador)

    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    return evaluar_modelo(model, X_test, y_test)
