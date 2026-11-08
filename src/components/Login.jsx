import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// Acceso privado: solo los dos usuarios creados en Firebase Authentication.
export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch {
      setError("Correo o contraseña incorrectos. Revisa los datos e inténtalo otra vez.");
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-3xl font-bold">Pendientes</h1>
      <p className="mb-6 mt-1 text-muted">Las tareas del negocio, al día entre los dos.</p>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        <input className="input" type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" />
        {error && <p className="text-sm text-urgent">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
