import { PARTNERS, nameOf, prio, STATUSES, fmtDate, fmtTime } from "../config";

// Tarjeta de tarea: check rápido, estado editable y datos de auditoría.
export default function TaskCard({ task, onStatus, onEdit }) {
  const p = prio(task.priority);
  const done = task.status === "completada";
  const overdue = !done && task.dueAt && task.dueAt < Date.now();

  return (
    <article className={`rounded-xl border bg-white p-3 ${task.priority === "urgente" && !done ? "border-urgent" : "border-line"} ${done ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatus(task, done ? "pendiente" : "completada")}
          aria-label={done ? "Reabrir tarea" : "Marcar como completada"}
          className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${done ? "border-brand bg-brand text-white" : "border-line hover:border-brand"}`}
        >{done && "✓"}</button>

        <div className="min-w-0 flex-1">
          <button onClick={() => onEdit(task)} className="block w-full text-left">
            <h3 className={`font-semibold leading-snug ${done ? "line-through" : ""}`}>{task.title}</h3>
            {task.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{task.description}</p>}
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`rounded-md px-2 py-0.5 font-semibold ${p.cls}`}>{p.label}</span>
            <span className="rounded-md bg-paper px-2 py-0.5">{task.category}</span>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-brand-dark">{nameOf(task.assignee)}</span>
            {task.dueAt && (
              <span className={`rounded-md px-2 py-0.5 ${overdue ? "bg-urgent-soft font-semibold text-urgent" : "bg-paper"}`}>
                {overdue ? "Vencida · " : ""}{fmtDate(task.dueAt)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <select className="rounded-md border border-line bg-white px-2 py-1 text-xs" value={task.status} onChange={(e) => onStatus(task, e.target.value)} aria-label="Estado">
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <span className="text-right text-[11px] text-muted">
              {done && task.completedBy
                ? `Completada por ${PARTNERS[task.completedBy]?.name} · ${fmtTime(task.completedAt)}`
                : `Creada por ${PARTNERS[task.createdBy]?.name}`}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
