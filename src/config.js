// Catálogos del negocio y utilidades. Edita aquí categorías, prioridades o estados.
const env = import.meta.env;

export const PARTNERS = {
  A: { id: "A", email: env.VITE_PARTNER_A_EMAIL, name: env.VITE_PARTNER_A_NAME || "Socio A" },
  B: { id: "B", email: env.VITE_PARTNER_B_EMAIL, name: env.VITE_PARTNER_B_NAME || "Socio B" }
};
export const partnerByEmail = (email) =>
  Object.values(PARTNERS).find((p) => p.email?.toLowerCase() === email?.toLowerCase()) || null;
export const nameOf = (id) => (id === "any" || !id ? "General" : PARTNERS[id]?.name || id);

export const CATEGORIES = ["Inventario", "Ventas", "Proveedores", "Mantenimiento", "Finanzas", "Otro"];

export const PRIORITIES = [
  { id: "baja", label: "Baja", weight: 1, cls: "bg-slate-100 text-slate-600" },
  { id: "media", label: "Media", weight: 2, cls: "bg-sky-100 text-sky-700" },
  { id: "alta", label: "Alta", weight: 3, cls: "bg-amber-100 text-amber-800" },
  { id: "urgente", label: "Urgente", weight: 4, cls: "bg-urgent text-white" }
];
export const STATUSES = [
  { id: "pendiente", label: "Pendiente" },
  { id: "progreso", label: "En progreso" },
  { id: "completada", label: "Completada" },
  { id: "bloqueada", label: "Bloqueada / Esperando" }
];
export const prio = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label || id;

// ---- Fechas (guardamos milisegundos; el input datetime-local usa hora local) ----
const pad = (n) => String(n).padStart(2, "0");
export const toLocalInput = (ms) => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (v) => (v ? new Date(v).getTime() : null);
export const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
export const fmtDate = (ms) =>
  new Date(ms).toLocaleString("es", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const fmtTime = (ms) =>
  new Date(ms).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
