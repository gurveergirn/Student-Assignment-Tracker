import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { mapFirebaseError } from "../firebaseErrors";
import { savePasswordCredential } from "../savePassword";
import AuthLayout, { ErrorAlert, FormField, SubmitButton } from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await savePasswordCredential(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your tasks"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />

        <FormField id="email" label="Email" type="email" placeholder="you@torontomu.ca" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username email" required />

        <div>
          <FormField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Logging in...">
          Log in
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
