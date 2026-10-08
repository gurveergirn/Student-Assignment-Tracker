import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { mapFirebaseError } from "../firebaseErrors";
import AuthLayout, { ErrorAlert, FormField, SubmitButton } from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // After resetting on Firebase's page, the user gets a "Continue" link back to our login
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email
      if (err.code === "auth/user-not-found") {
        setSent(true);
      } else {
        console.error(err);
        setError(mapFirebaseError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = (
    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
      &larr; Back to login
    </Link>
  );

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a reset link" footer={backToLogin}>
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          If an account exists for <span className="font-medium">{email}</span>, you'll get an email with a link to reset your password. Check your spam folder if it doesn't show up in a few minutes.
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Use a different email
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link" footer={backToLogin}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />

        <FormField id="email" label="Email" type="email" placeholder="you@torontomu.ca" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />

        <SubmitButton loading={loading} loadingText="Sending...">
          Send reset link
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
