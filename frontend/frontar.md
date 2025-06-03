# Arquitectura del Frontend

## Introducción
El frontend de esta aplicación está diseñado para ser modular, accesible y escalable, siguiendo principios modernos de desarrollo web. Este documento describe los componentes principales, patrones utilizados y la arquitectura general del frontend, con referencias académicas y técnicas.

---

## Componentes Principales

### **1. TickersContext**
#### **Descripción**
`TickersContext` es un contexto global de React que gestiona el estado de los tickers de manera reactiva. Este componente reemplaza el uso de variables globales no reactivas, asegurando que los cambios en los tickers se reflejen automáticamente en toda la aplicación.

#### **Patrón Aplicado**
- **React Context**: Permite compartir estado global entre componentes sin necesidad de prop drilling.

#### **Beneficios**
- Reactividad en tiempo real.
- Reducción de dependencias globales.

#### **Ejemplo de Uso**
```jsx
import { useTickers } from './TickersContext';

function MiComponente() {
  const { tickers, setTickers } = useTickers();
  // ...
}
```

---

### **2. AccessibilityDemo**
#### **Descripción**
`AccessibilityDemo.jsx` es una página demostrativa que implementa componentes accesibles y utilidades de accesibilidad, como `focusManagement.js` y `colorContrast.js`. Este componente sigue las pautas WCAG 2.1.

#### **Patrón Aplicado**
- **Accesibilidad**: Uso de ARIA roles y atributos para mejorar la navegación con teclado y lectores de pantalla.

#### **Beneficios**
- Cumplimiento de estándares WCAG 2.1.
- Mejora de la experiencia de usuario para personas con discapacidades.

#### **Ejemplo de Uso**
```jsx
<a href="#main-content" className="sr-only focus:not-sr-only">Saltar al contenido principal</a>
```

---

### **3. API Centralizada**
#### **Descripción**
`api.js` centraliza la configuración de Axios para realizar solicitudes HTTP al backend. Incluye interceptores para autenticación y logging.

#### **Patrón Aplicado**
- **Centralización de Configuración**: Facilita el mantenimiento y la escalabilidad.

#### **Beneficios**
- Reducción de código repetido.
- Mejora en el manejo de errores y autenticación.

#### **Ejemplo de Uso**
```javascript
export const fetchPivotPoints = async (ticker) => {
  try {
    const response = await api.get("/pivot-points/", { params: { ticker } });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
```

---

## Patrones de Diseño

### **1. Modularidad**
#### **Descripción**
La aplicación está dividida en módulos independientes, como `components`, `utils`, y `contexts`. Esto facilita el mantenimiento y la escalabilidad.

#### **Referencias Académicas**
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software.

---

### **2. Accesibilidad**
#### **Descripción**
Se implementaron componentes accesibles siguiendo las pautas WCAG 2.1, como `Button`, `Input`, y `Table`.

#### **Referencias Académicas**
- W3C. (2018). Web Content Accessibility Guidelines (WCAG) 2.1.

---

### **3. Estado Global**
#### **Descripción**
El estado global se gestiona mediante React Context, eliminando la necesidad de variables globales no reactivas.

#### **Referencias Académicas**
- React Documentation. (2025). Context API.

---

## Arquitectura General

### **Estructura de Carpetas**
```plaintext
src/
├── api.js
├── components/
├── contexts/
├── pages/
├── utils/
```

### **Flujo de Datos**
1. **Estado Global**: `TickersContext` gestiona el estado de los tickers.
2. **Acceso a la API**: `api.js` centraliza las solicitudes HTTP.
3. **Componentes Accesibles**: `AccessibilityDemo.jsx` demuestra las mejores prácticas de accesibilidad.

---

## Conclusión
La arquitectura del frontend está diseñada para ser modular, accesible y escalable, siguiendo principios modernos y referencias académicas. Esto asegura que la aplicación sea robusta y fácil de mantener, cumpliendo con los objetivos de la tesis académica.
