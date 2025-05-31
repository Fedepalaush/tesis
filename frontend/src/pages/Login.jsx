import Form from "../components/FormLogin";
import React from "react";

function Login() {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return (
    <Form route={`${apiBase}/token/`} method="login" />
  );
}

export default Login;
