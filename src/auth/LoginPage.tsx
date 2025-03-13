import { LoginForm } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import { AuthLayout } from "./AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <br />
      <span>
        I don't have an account yet (<Link to="/signup">go to signup</Link>).
      </span>
    </AuthLayout>
  );
}
