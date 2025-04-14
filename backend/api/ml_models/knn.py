from sklearn.neighbors import KNeighborsClassifier
from .base import preparar_datos, evaluar_modelo

def entrenar_knn(df, indicador):
    X_train, X_test, y_train, y_test = preparar_datos(df, indicador)

    model = KNeighborsClassifier()
    model.fit(X_train, y_train)

    return evaluar_modelo(model, X_test, y_test)
