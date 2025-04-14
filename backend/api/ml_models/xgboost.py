import xgboost as xgb
from .base import preparar_datos, evaluar_modelo

def entrenar_xgboost(df, indicador):
    X_train, X_test, y_train, y_test = preparar_datos(df, indicador)

    model = xgb.XGBClassifier()
    model.fit(X_train, y_train)

    return evaluar_modelo(model, X_test, y_test)
