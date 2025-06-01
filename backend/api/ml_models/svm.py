from .base import BaseModel
from sklearn.svm import SVC

class SVMModel(BaseModel):
    def train(self, df, indicador):
        X_train, X_test, y_train, y_test = self.preparar_datos(df, indicador)
        self.model = SVC()
        self.model.fit(X_train, y_train)
        return self.evaluar_modelo(self.model, X_test, y_test)

    def predict(self, X):
        return self.model.predict(X)
