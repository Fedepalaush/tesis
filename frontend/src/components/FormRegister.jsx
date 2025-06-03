import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

export default function FormRegister({ route, method }) {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  
  // Use global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: false // We'll handle notifications manually for better UX
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const name = method === "login" ? "Login" : "Register";

const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirm_password) {
    setError("Las contraseñas no coinciden");
    showError("Las contraseñas no coinciden");
    return;
  }

  setError(""); // Limpiar errores previos

  const loadingMessage = method === "login" ? "Iniciando sesión..." : "Creando cuenta...";

  await execute(async () => {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      const errorMsg = "Este nombre de usuario ya está en uso";
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    const res = await api.post(route, { username, password, confirm_password });

    if (method === "login") {
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      showSuccess("¡Inicio de sesión exitoso!");
      navigate("/");
    } else {
      showSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
      navigate("/login");
    }
  }, {
    loadingMessage,
    onError: (error) => {
      let errorMessage = "Error desconocido. Intenta nuevamente.";
      
      if (error.response && error.response.data) {
        // Obtenemos todos los mensajes de error y los unimos en un string
        const messages = Object.values(error.response.data)
          .flat()
          .join(" ");
        errorMessage = messages;
      }
      
      setError(errorMessage);
      showError(errorMessage);
    }
  });
};


  const checkIfUserExists = async (username) => {
    try {
      console.log('intento el try')
      const res = await api.get(`/user/exists/${username}`);
      console.log(res)
      console.log('este si existe')
      return res.data.exists;
    } catch (error) {
      return false;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
      <section className="flex w-[30rem] flex-col space-y-10" role="main" aria-labelledby="register-title">
        <div className="text-center text-4xl font-medium">
          <h1 id="register-title">Registrarse</h1>
        </div>

        <form 
          onSubmit={handleSubmit}
          role="form"
          aria-labelledby="register-title"
          noValidate
        >
          <fieldset className="space-y-6" aria-describedby="form-instructions">
            <legend className="sr-only">
              Crear nueva cuenta de usuario
            </legend>
            
            <p id="form-instructions" className="sr-only">
              Completa todos los campos para crear tu nueva cuenta. La contraseña debe tener al menos 6 caracteres y debes confirmarla.
            </p>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <label htmlFor="register-username" className="sr-only">Nombre de usuario</label>
              <input
                id="register-username"
                name="username"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Nombre de usuario para la nueva cuenta"
                aria-describedby="username-help"
                required
                autoComplete="username"
                minLength="3"
              />
              <p id="username-help" className="sr-only">
                El nombre de usuario debe tener al menos 3 caracteres y será único en el sistema
              </p>
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <label htmlFor="register-password" className="sr-only">Contraseña</label>
              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Contraseña para la nueva cuenta"
                aria-describedby="password-help"
                required
                autoComplete="new-password"
                minLength="6"
              />
              <p id="password-help" className="sr-only">
                La contraseña debe tener al menos 6 caracteres para mayor seguridad
              </p>
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <label htmlFor="confirm-password" className="sr-only">Confirmar contraseña</label>
              <input
                id="confirm-password"
                name="confirm_password"
                type="password"
                placeholder="Confirma Contraseña"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Confirmar contraseña"
                aria-describedby="confirm-password-help"
                required
                autoComplete="new-password"
              />
              <p id="confirm-password-help" className="sr-only">
                Repite la misma contraseña para confirmar que la escribiste correctamente
              </p>
            </div>

            {error && (
              <div 
                className="text-red-500 p-3 rounded-md bg-red-50 border border-red-200" 
                role="alert" 
                aria-live="polite"
                aria-label="Error de validación"
              >
                <strong>Error:</strong> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full transform rounded-sm py-2 font-bold duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-400'
              }`}
              aria-label={isLoading ? "Creando cuenta..." : "Crear cuenta nueva"}
              aria-describedby="submit-help"
            >
              {isLoading ? (method === "login" ? "Iniciando..." : "Registrando...") : "Registrarse"}
            </button>
            <p id="submit-help" className="sr-only">
              Presiona para crear tu nueva cuenta con la información proporcionada
            </p>
          </fieldset>
        </form>

        <nav aria-label="Enlaces adicionales" className="text-center">
          <p className="text-gray-400 mb-2">¿Ya tienes una cuenta?</p>
          <a 
            href="/login" 
            className="text-lg font-semibold text-indigo-600 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Ir al formulario de inicio de sesión"
          >
            Inicia Sesión
          </a>
        </nav>
      </section>
    </main>
  );
}