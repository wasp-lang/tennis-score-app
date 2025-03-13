import { SignupForm } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import { AuthLayout } from "./AuthLayout";

export function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
      <br />
      <span>
        I already have an account (<Link to="/login">go to login</Link>).
      </span>
    </AuthLayout>
  );
}
