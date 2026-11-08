import { useState } from "react";
import { CATEGORIES, PRIORITIES, STATUSES, PARTNERS, toLocalInput, fromLocalInput } from "../config";

// Formulario en hoja inferior (móvil) / modal (escritorio). Sirve para crear y editar.
export default function TaskForm({ task, onSave, onDelete, onClose }) {
  const [f, setF] = useState({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || CATEGORIES[0],
    priority: task?.priority || "media",
    status: task?.status || "pendiente",
    assignee: task?.assignee || "any",
    dueAt: toLocalInput(task?.dueAt)
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, title: f.title.trim(), dueAt: fromLocalInput(f.dueAt) }, task);
  };

  const Field = ({ label, children }) => (
    <label className="block text-sm font-medium">{label}<div className="mt-1 font-normal">{children}</div></label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-2xl bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-2xl">
        <h2 className="text-lg font-bold">{task ? "Editar tarea" : "Nueva tarea"}</h2>
        <Field label="Título"><input className="input" value={f.title} onChange={set("title")} required autoFocus /></Field>
        <Field label="Descripción"><textarea className="input" rows={3} value={f.description} onChange={set("description")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <select className="input" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Prioridad">
            <select className="input" value={f.priority} onChange={set("priority")}>{PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
          </Field>
          <Field label="Asignada a">
            <select className="input" value={f.assignee} onChange={set("assignee")}>
              <option value="any">General / Cualquiera</option>
              {Object.values(PARTNERS).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className="input" value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
          </Field>
        </div>
        <Field label="Fecha y hora límite"><input type="datetime-local" className="input" value={f.dueAt} onChange={set("dueAt")} /></Field>
        <div className="flex gap-2 pt-1">
          {task && <button type="button" className="btn-ghost text-urgent" onClick={() => confirm("¿Eliminar esta tarea?") && onDelete(task)}>Eliminar</button>}
          <button type="button" className="btn-ghost ml-auto" onClick={onClose}>Cancelar</button>
          <button className="btn-primary">{task ? "Guardar cambios" : "Crear tarea"}</button>
        </div>
      </form>
    </div>
  );
}
