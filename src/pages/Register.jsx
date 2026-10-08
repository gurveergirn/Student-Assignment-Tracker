import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { mapFirebaseError } from "../firebaseErrors";
import { savePasswordCredential } from "../savePassword";
import AuthLayout, { ErrorAlert, FormField, SubmitButton } from "../components/AuthLayout";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Create the auth user
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Set display name on the auth profile
      await updateProfile(user, { displayName: `${form.firstName} ${form.lastName}` });

      // Create a matching user doc in Firestore (Users schema from the sprint doc)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        createdAt: serverTimestamp(),
      });

      await savePasswordCredential(form.email, form.password, `${form.firstName} ${form.lastName}`);
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
      title="Create your account"
      subtitle="Start keeping track of your assignments"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />

        <div className="grid grid-cols-2 gap-3">
          <FormField id="firstName" label="First name" value={form.firstName} onChange={update("firstName")} autoComplete="given-name" required />
          <FormField id="lastName" label="Last name" value={form.lastName} onChange={update("lastName")} autoComplete="family-name" required />
        </div>

        <FormField id="email" label="Email" type="email" placeholder="you@torontomu.ca" value={form.email} onChange={update("email")} autoComplete="username email" required />

        <FormField id="password" label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={update("password")} autoComplete="new-password" minLength={6} required />

        <FormField id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} autoComplete="new-password" minLength={6} required />

        <SubmitButton loading={loading} loadingText="Creating account...">
          Sign up
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
