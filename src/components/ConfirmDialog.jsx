import { useState } from "react";
import { Button, Modal } from "./ui";

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", busyLabel = "Deleting…", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={handleConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
