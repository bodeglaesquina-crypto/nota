import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, limit, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore";
import { auth, db } from "./firebase";
import { CATEGORIES, PARTNERS, PRIORITIES, STATUSES, endOfToday, fmtTime, partnerByEmail, prio, statusLabel } from "./config";
import Login from "./components/Login";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = cargando
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <p className="p-6 text-muted">Cargando…</p>;
  if (!user) return <Login />;

  const me = partnerByEmail(user.email);
  if (!me) {
    return (
      <main className="p-6">
        <p>Esta cuenta no corresponde a ninguno de los dos socios.</p>
        <button className="btn-ghost mt-3" onClick={() => signOut(auth)}>Salir</button>
      </main>
    );
  }
  return <Board me={me} />;
}

function Board({ me }) {
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pending, setPending] = useState(false);      // hay cambios locales sin enviar
  const [online, setOnline] = useState(navigator.onLine);
  const [tab, setTab] = useState("tareas");
  const [editing, setEditing] = useState(null);       // null | "new" | task
  const [filters, setFilters] = useState({ q: "", status: "activas", priority: "", assignee: "", category: "" });

  // --- Tiempo real: cualquier cambio del otro socio llega aquí al instante ---
  useEffect(() => {
    const unsubTasks = onSnapshot(query(collection(db, "tasks"), orderBy("createdAt", "desc")),
      { includeMetadataChanges: true },
      (snap) => { setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setPending(snap.metadata.hasPendingWrites); });
    const unsubAct = onSnapshot(query(collection(db, "activity"), orderBy("at", "desc"), limit(60)),
      (snap) => setActivity(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { unsubTasks(); unsubAct(); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // --- Escrituras: tarea + registro de auditoría en un solo lote atómico.
  //     NO usamos await: offline el lote queda en cola local y se envía solo al reconectar. ---
  const log = (batch, text, taskId) =>
    batch.set(doc(collection(db, "activity")), { text, by: me.id, at: Date.now(), taskId });

  const saveTask = (data, existing) => {
    const batch = writeBatch(db);
    const now = Date.now();
    if (existing) {
      const wasDone = existing.status === "completada", isDone = data.status === "completada";
      batch.update(doc(db, "tasks", existing.id), {
        ...data, updatedAt: now,
        completedBy: isDone ? (wasDone ? existing.completedBy : me.id) : null,
        completedAt: isDone ? (wasDone ? existing.completedAt : now) : null
      });
      log(batch, `${me.name} editó «${data.title}»`, existing.id);
    } else {
      const ref = doc(collection(db, "tasks"));
      batch.set(ref, { ...data, createdBy: me.id, createdAt: now, updatedAt: now,
        completedBy: data.status === "completada" ? me.id : null, completedAt: data.status === "completada" ? now : null });
      log(batch, `${me.name} creó «${data.title}»`, ref.id);
    }
    batch.commit(); setEditing(null);
  };

  const changeStatus = (task, status) => {
    const batch = writeBatch(db);
    const done = status === "completada";
    batch.update(doc(db, "tasks", task.id), {
      status, updatedAt: Date.now(),
      completedBy: done ? me.id : null, completedAt: done ? Date.now() : null
    });
    log(batch, done ? `${me.name} completó «${task.title}»` : `${me.name} pasó «${task.title}» a ${statusLabel(status)}`, task.id);
    batch.commit();
  };

  const removeTask = (task) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, "tasks", task.id));
    log(batch, `${me.name} eliminó «${task.title}»`, task.id);
    batch.commit(); setEditing(null);
  };

  // --- Vista "Urgentes para hoy": no completadas, urgentes o que vencen hoy (o ya vencidas) ---
  const urgentToday = useMemo(() => {
    const eod = endOfToday();
    return tasks
      .filter((t) => t.status !== "completada" && (t.priority === "urgente" || (t.dueAt && t.dueAt <= eod)))
      .sort((a, b) => (a.dueAt || Infinity) - (b.dueAt || Infinity));
  }, [tasks]);

  // --- Filtros y búsqueda ---
  const visible = useMemo(() => {
    const q = filters.q.toLowerCase();
    return tasks
      .filter((t) =>
        (!q || `${t.title} ${t.description}`.toLowerCase().includes(q)) &&
        (filters.status === "todas" || (filters.status === "activas" ? t.status !== "completada" : t.status === filters.status)) &&
        (!filters.priority || t.priority === filters.priority) &&
        (!filters.assignee || t.assignee === filters.assignee) &&
        (!filters.category || t.category === filters.category))
      .sort((a, b) => prio(b.priority).weight - prio(a.priority).weight || (a.dueAt || Infinity) - (b.dueAt || Infinity));
  }, [tasks, filters]);

  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const sync = !online ? ["Sin conexión · se guardará al volver", "bg-amber-100 text-amber-800"]
    : pending ? ["Sincronizando…", "bg-sky-100 text-sky-700"] : ["Sincronizado", "bg-brand-soft text-brand-dark"];

  return (
    <div className="mx-auto min-h-screen max-w-3xl pb-28">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div>
          <h1 className="text-xl font-bold leading-tight">Pendientes</h1>
          <p className="text-xs text-muted">Hola, {me.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sync[1]}`}>{sync[0]}</span>
          <button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => signOut(auth)}>Salir</button>
        </div>
      </header>

      {tab === "tareas" ? (
        <main className="space-y-5 px-4 pt-4">
          {/* Urgentes para hoy: lo primero que se ve al abrir la app */}
          <section aria-label="Urgentes para hoy">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-urgent">
              Urgentes para hoy
              <span className="rounded-full bg-urgent px-2 text-xs text-white">{urgentToday.length}</span>
            </h2>
            {urgentToday.length === 0
              ? <p className="rounded-xl border border-dashed border-line bg-white p-3 text-sm text-muted">Nada urgente por hoy. Buen momento para adelantar pendientes.</p>
              : <div className="space-y-2">{urgentToday.map((t) => <TaskCard key={t.id} task={t} onStatus={changeStatus} onEdit={setEditing} />)}</div>}
          </section>

          <section aria-label="Todas las tareas" className="space-y-3">
            <input className="input" type="search" placeholder="Buscar tarea…" value={filters.q} onChange={setF("q")} />
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              <select className="input !w-auto" value={filters.status} onChange={setF("status")}>
                <option value="activas">Activas</option><option value="todas">Todas</option>
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select className="input !w-auto" value={filters.priority} onChange={setF("priority")}>
                <option value="">Prioridad</option>{PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select className="input !w-auto" value={filters.assignee} onChange={setF("assignee")}>
                <option value="">Asignada a</option><option value="any">General</option>
                {Object.values(PARTNERS).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="input !w-auto" value={filters.category} onChange={setF("category")}>
                <option value="">Categoría</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {visible.length === 0
              ? <p className="py-8 text-center text-muted">No hay tareas con estos filtros. Crea una con el botón +.</p>
              : visible.map((t) => <TaskCard key={t.id} task={t} onStatus={changeStatus} onEdit={setEditing} />)}
          </section>
        </main>
      ) : (
        <main className="px-4 pt-4">
          <h2 className="mb-3 font-bold">Registro de actividad</h2>
          {activity.length === 0 && <p className="text-muted">Aún no hay actividad.</p>}
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                <span>{a.text}</span><time className="shrink-0 text-xs text-muted">{fmtTime(a.at)}</time>
              </li>
            ))}
          </ul>
        </main>
      )}

      <button onClick={() => setEditing("new")} aria-label="Nueva tarea"
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-brand text-3xl text-white shadow-lg hover:bg-brand-dark sm:right-[max(1rem,calc(50%-23rem))]">+</button>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-2">
          {[["tareas", "Tareas"], ["actividad", "Actividad"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`py-3 text-sm font-semibold ${tab === id ? "text-brand" : "text-muted"}`}>{label}</button>
          ))}
        </div>
      </nav>

      {editing && (
        <TaskForm task={editing === "new" ? null : editing} onSave={saveTask} onDelete={removeTask} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
