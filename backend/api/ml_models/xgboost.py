from .base import BaseModel
import xgboost as xgb

class XGBoostModel(BaseModel):
    def train(self, df, indicador):
        X_train, X_test, y_train, y_test = self.preparar_datos(df, indicador)
        self.model = xgb.XGBClassifier()
        self.model.fit(X_train, y_train)
        return self.evaluar_modelo(self.model, X_test, y_test)

    def predict(self, X):
        return self.model.predict(X)
