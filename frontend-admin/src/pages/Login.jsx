// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() !== "" && password !== "" && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      if (!remember) localStorage.removeItem("token");

      nav("/");
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-200" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-400/25 blur-3xl" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur"
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg">
          <span className="text-lg font-bold">MG</span>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight">
          MenuGo — Panel Admin
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-600">
          Gestiona tu menú, combos y pedidos en un solo lugar.
        </p>

        <label className="mt-6 block text-sm font-medium text-neutral-900">
          Email
        </label>
        <input
          type="email"
          autoComplete="username"
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
          placeholder="admin@menugo.app"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mt-4 block text-sm font-medium text-neutral-900">
          Contraseña
        </label>
        <div className="mt-1 relative">
          <input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-emerald-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs text-neutral-600 hover:bg-neutral-100"
            onClick={() => setShowPass((v) => !v)}
            tabIndex={-1}
          >
            {showPass ? "Ocultar" : "Ver"}
          </button>
        </div>

        <label className="mt-3 inline-flex select-none items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Recordarme
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <p className="mt-5 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} MenuGo — Panel
        </p>
      </form>
    </div>
  );
}
