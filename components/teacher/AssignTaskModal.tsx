// components/teacher/AssignTaskModal.tsx
import * as React from "react";

export type AssignTaskModalProps = {
  open: boolean;
  onClose: () => void;
  cohortId: string;
  /** If provided, called instead of default POST to /api/teacher/assignments */
  onSubmit?: (data: { cohortId: string; title: string; description?: string; dueDate: string }) => Promise<void> | void;
};

export function AssignTaskModal({ open, onClose, cohortId, onSubmit }: AssignTaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDueDate(new Date().toISOString().slice(0, 10));
      setBusy(false);
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (onSubmit) {
        await onSubmit({ cohortId, title: title.trim(), description: description.trim() || undefined, dueDate });
      } else {
        const res = await fetch("/api/teacher/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cohortId, title: title.trim(), description: description.trim() || undefined, dueDate }),
        });
        if (!res.ok) throw new Error("Failed to create assignment");
      }
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Assign task to cohort</h3>
          <button
            type="button"
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-border/30"
            onClick={() => !busy && onClose()}
          >
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
              placeholder="e.g. Complete Listening Mock 01"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
              placeholder="Add instructions or links…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cohort</label>
              <input
                type="text"
                value={cohortId}
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => !busy && onClose()}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30 disabled:opacity-50"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-border bg-primary px-3 py-1.5 text-sm text-background hover:opacity-90 disabled:opacity-50"
              disabled={busy}
            >
              {busy ? "Assigning…" : "Assign task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
