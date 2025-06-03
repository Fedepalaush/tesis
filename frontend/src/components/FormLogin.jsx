import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import api from "../api";

export default function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { execute, isLoading } = useAsyncOperation();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "El usuario es requerido";
    }
    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (method === "login") {
      const result = await execute(
        async () => {
          const loginResult = await login(username, password);
          if (!loginResult.success) {
            throw new Error(loginResult.error);
          }
          return loginResult;
        },
        {
          successMessage: "¡Bienvenido! Has iniciado sesión correctamente",
          errorMessage: "Las credenciales de ingreso son incorrectas",
          showSuccessNotification: true
        }
      );
      
      if (result.success) {
        navigate("/");
      }
    } else {
      // Keep register logic as before for now
      await execute(
        async () => {
          const res = await api.post(route, { username, password });
          showSuccess("Usuario registrado exitosamente");
          navigate("/login");
        },
        {
          errorMessage: "Error al registrar el usuario"
        }
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
      <section className="flex w-[30rem] flex-col space-y-10" role="main" aria-labelledby="form-title">
        <div className="text-center text-4xl font-medium">
          <h1 id="form-title">{name}</h1>
        </div>

        <form 
          onSubmit={handleSubmit}
          role="form"
          aria-labelledby="form-title"
          noValidate
        >
          <fieldset className="space-y-6" aria-describedby="form-instructions">
            <legend className="sr-only">
              {method === "login" ? "Credenciales de acceso" : "Información de registro"}
            </legend>
            
            <p id="form-instructions" className="sr-only">
              {method === "login" 
                ? "Ingresa tu nombre de usuario y contraseña para acceder a tu cuenta"
                : "Crea una nueva cuenta proporcionando un nombre de usuario y contraseña"
              }
            </p>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <label htmlFor="username" className="sr-only">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Nombre de usuario"
                aria-describedby={errors.username ? "username-error" : undefined}
                aria-invalid={!!errors.username}
                required
                autoComplete="username"
              />
              {errors.username && (
                <p id="username-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Contraseña"
                aria-describedby={errors.password ? "password-error" : "password-help"}
                aria-invalid={!!errors.password}
                required
                autoComplete={method === "login" ? "current-password" : "new-password"}
                minLength="6"
              />
              <p id="password-help" className="sr-only">
                La contraseña debe tener al menos 6 caracteres
              </p>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                  {errors.password}
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={isLoading ? "Procesando solicitud..." : `${name} en el sistema`}
              aria-describedby="submit-help"
            >
              {isLoading ? "Cargando..." : name}
            </button>
            <p id="submit-help" className="sr-only">
              {method === "login" 
                ? "Presiona para iniciar sesión con las credenciales proporcionadas"
                : "Presiona para crear tu nueva cuenta"
              }
            </p>
          </fieldset>
        </form>

        {method === "login" && (
          <nav aria-label="Enlaces adicionales" className="space-y-4">
            <a 
              href="#" 
              className="block transform text-center font-semibold text-gray-500 duration-300 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Recuperar contraseña olvidada"
            >
              ¿Olvidaste la Contraseña?
            </a>

            <div className="flex mx-auto space-x-3 justify-center items-center" role="group" aria-label="Crear cuenta nueva">
              <p className="text-center text-lg">¿No Tenés Cuenta?</p>
              <a 
                href="/register" 
                className="text-lg font-semibold text-indigo-600 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Crear una cuenta nueva"
              >
                Crear una
              </a>
            </div>
          </nav>
        )}
      </section>
    </main>
  );
}