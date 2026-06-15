import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "#/lib/utils.ts";

export type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let counter = 0;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

function emit() {
  for (const l of listeners) l([...items]);
}

export function toast(message: string, tone: ToastTone = "info") {
  const id = ++counter;
  items = [...items, { id, message, tone }];
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    emit();
  }, 4000);
}
toast.success = (m: string) => toast(m, "success");
toast.error = (m: string) => toast(m, "error");

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-danger" />,
  info: <Info className="h-4 w-4 text-accent" />,
};

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {list.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-text shadow-lg",
          )}
        >
          {icons[t.tone]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => {
              items = items.filter((i) => i.id !== t.id);
              emit();
            }}
            className="text-muted hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
