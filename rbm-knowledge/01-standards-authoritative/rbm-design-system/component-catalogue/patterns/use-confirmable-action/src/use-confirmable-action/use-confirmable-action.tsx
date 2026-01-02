import { useCallback, useState } from "react";
import { useToast } from "../feedback/ToastProvider";
import { toastForFailure, toastForSuccess, type Operation } from "../feedback/toastPatterns";

export interface ConfirmableActionOptions {
  op: Operation;
  label: string;
  onExecute: () => Promise<void>;
  successMessage?: string;
  failureMessage?: string;
  onAudit?: (result: "success" | "failure") => void;
}

export function useConfirmableAction(opts: ConfirmableActionOptions) {
  const toast = useToast();
  const [isOpen, setOpen] = useState(false);
  const [isBusy, setBusy] = useState(false);

  const open = useCallback(() => setOpen(true), []);
  const cancel = useCallback(() => { if (!isBusy) setOpen(false); }, [isBusy]);

  const confirm = useCallback(async () => {
    setBusy(true);
    try {
      await opts.onExecute();
      toast.push({ ...toastForSuccess(opts.op, opts.label), message: opts.successMessage ?? "Action completed." });
      opts.onAudit?.("success");
      setOpen(false);
    } catch {
      toast.push({ ...toastForFailure(opts.op, opts.label), message: opts.failureMessage ?? "Action failed." });
      opts.onAudit?.("failure");
    } finally {
      setBusy(false);
    }
  }, [opts, toast]);

  return { isOpen, isBusy, open, cancel, confirm };
}
