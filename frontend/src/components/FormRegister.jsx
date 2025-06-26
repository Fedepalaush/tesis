import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

export default function FormRegister({ route, method }) {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: false // Manejamos las notificaciones manualmente
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm_password) {
      const msg = "Las contraseñas no coinciden";
      setError(msg);
      showError(msg);
      return;
    }

    setError(""); // Limpiar errores previos
    const loadingMessage = method === "login" ? "Iniciando sesión..." : "Creando cuenta...";

    try {
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
      }, loadingMessage);
    } catch (error) {
      let errorMessage = "Error desconocido. Intenta nuevamente.";

      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat().join(" ");
        errorMessage = messages;
      }

      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const checkIfUserExists = async (username) => {
    try {
      const res = await api.get(`/user/exists/${username}`);
      return res.data.exists;
    } catch {
      return false;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
      <section className="flex w-[30rem] flex-col space-y-10" role="main" aria-labelledby="register-title">
        <div className="text-center text-4xl font-medium">
          <h1 id="register-title">Registrarse</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="space-y-6">
            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <input
                id="register-username"
                name="username"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic"
                required
                autoComplete="username"
                minLength="3"
              />
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic"
                required
                autoComplete="new-password"
                minLength="6"
              />
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <input
                id="confirm-password"
                name="confirm_password"
                type="password"
                placeholder="Confirma Contraseña"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-red-500 p-3 rounded-md bg-red-50 border border-red-200" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-sm py-2 font-bold duration-300 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-400'
              }`}
            >
              {isLoading ? (method === "login" ? "Iniciando..." : "Registrando...") : "Registrarse"}
            </button>
          </fieldset>
        </form>

        <nav className="text-center">
          <p className="text-gray-400 mb-2">¿Ya tienes una cuenta?</p>
          <a href="/login" className="text-lg font-semibold text-indigo-600 hover:underline">
            Inicia Sesión
          </a>
        </nav>
      </section>
    </main>
  );
}
