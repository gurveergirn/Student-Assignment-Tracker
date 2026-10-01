import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

// Placeholder for US-03 (password reset), assigned to Viththakan
export default function ForgotPassword() {
  return (
    <AuthLayout title="Reset your password" subtitle="Coming soon">
      <p className="text-sm text-slate-600">
        Password reset isn't available yet.
      </p>
      <Link to="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
        &larr; Back to login
      </Link>
    </AuthLayout>
  );
}
