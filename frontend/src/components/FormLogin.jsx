import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Added state to handle error messages
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      // If there is an error during login, display a specific message
      if (method === "login") {
        setError("Las credenciales de ingreso son incorrectas");
      } else {
        setError("Error al registrar el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
        <section className="flex w-[30rem] flex-col space-y-10">
          <div className="text-center text-4xl font-medium">{name}</div>

          <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none"
            />
          </div>

          <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <button className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400">{name}</button>

          {method === "login" && (
            <a href="#" className="transform text-center font-semibold text-gray-500 duration-300 hover:text-gray-300">
              Olvidaste la Contraseña?
            </a>
          )}

          {method === "login" && (
            <div className="flex mx-auto space-x-3">
              <p className="text-center text-lg">No Tenés Cuenta?</p>
              <a href="/register" className="text-lg font-semibold text-indigo-600 underline-offset-4 hover:underline">
                Crear una
              </a>
            </div>
          )}
        </section>
      </main>
    </form>
  );
}