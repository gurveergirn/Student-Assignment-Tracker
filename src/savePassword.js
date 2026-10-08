// Asks the browser's password manager to save the login (Chrome/Edge support this API).
// Other browsers skip it and fall back to detecting the form submit themselves.
export async function savePasswordCredential(email, password, name) {
  if (!window.PasswordCredential || !navigator.credentials) return;
  try {
    await navigator.credentials.store(new window.PasswordCredential({ id: email, password, name }));
  } catch (err) {
    // Saving is a nice-to-have, never block login over it
    console.warn("Couldn't save credentials", err);
  }
}
