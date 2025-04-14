from sklearn.linear_model import LogisticRegression
from .base import preparar_datos, evaluar_modelo

def entrenar_logistic_regression(df, indicador):
    X_train, X_test, y_train, y_test = preparar_datos(df, indicador)

    model = LogisticRegression()
    model.fit(X_train, y_train)

    return evaluar_modelo(model, X_test, y_test)
