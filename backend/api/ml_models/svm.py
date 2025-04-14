from sklearn.svm import SVC
from .base import preparar_datos, evaluar_modelo

def entrenar_svm(df, indicador):
    X_train, X_test, y_train, y_test = preparar_datos(df, indicador)

    model = SVC()
    model.fit(X_train, y_train)

    return evaluar_modelo(model, X_test, y_test)
