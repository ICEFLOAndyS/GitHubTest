import type { ToastIntent } from "./ToastProvider";

export type Operation =
  | "create"
  | "update"
  | "delete"
  | "start"
  | "pause"
  | "resume"
  | "complete"
  | "approve"
  | "reject";

export function toastForSuccess(op: Operation, label: string): { intent: ToastIntent; title: string } {
  const map: Record<Operation, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    start: "Started",
    pause: "Paused",
    resume: "Resumed",
    complete: "Completed",
    approve: "Approved",
    reject: "Rejected",
  };
  return { intent: "success", title: `${map[op]}: ${label}` };
}

export function toastForFailure(op: Operation, label: string): { intent: ToastIntent; title: string } {
  const map: Record<Operation, string> = {
    create: "Create failed",
    update: "Update failed",
    delete: "Delete failed",
    start: "Start failed",
    pause: "Pause failed",
    resume: "Resume failed",
    complete: "Complete failed",
    approve: "Approval failed",
    reject: "Rejection failed",
  };
  return { intent: "critical", title: `${map[op]}: ${label}` };
}
