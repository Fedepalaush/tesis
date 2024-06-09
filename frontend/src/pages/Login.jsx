import Form from "../components/FormLogin";

import React from "react";
function Login() {
  return (
      <Form route="/api/token/" method="login" />

  );
}

export default Login;
