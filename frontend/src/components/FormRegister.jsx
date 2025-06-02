import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function FormRegister({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirm_password) {
    setError("Las contraseñas no coinciden");
    return;
  }

  setLoading(true);
  setError(""); // Limpiar errores previos

  try {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      setError("Este nombre de usuario ya está en uso");
      setLoading(false);
      return;
    }

    const res = await api.post(route, { username, password, confirm_password });

    if (method === "login") {
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      navigate("/");
    } else {
      navigate("/login");
    }
  } catch (error) {
    setLoading(false);

    if (error.response && error.response.data) {
      // Obtenemos todos los mensajes de error y los unimos en un string
      const messages = Object.values(error.response.data)
        .flat()
        .join(" ");
      setError(messages);
    } else {
      setError("Error desconocido. Intenta nuevamente.");
    }
  }
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
    <form onSubmit={handleSubmit}>
      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
        <section className="flex w-[30rem] flex-col space-y-10">
          <div className="text-center text-4xl font-medium">Registrarse</div>

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

          <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
            <input
              type="password"
              placeholder="Confirma Contraseña"
              value={confirm_password}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-none bg-transparent outline-none placeholder-italic focus:outline-none"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <button className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400">Registrarse</button>

        </section>
      </main>
    </form>
  );
}