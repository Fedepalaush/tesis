import Form from "../components/FormLogin";

import React from "react";
function Login() {
  return (
  <Form route="http://localhost:8000/api/token/" method="login" />


  );
}

export default Login;
