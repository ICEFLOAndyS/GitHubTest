import type { ReactNode } from "react";
import { Button } from "../primitives/Button";
import { StatusPill, type RbmStatusIntent } from "./StatusPill";
import { cx } from "../utils/cx";
import "./execution-control-bar.css";

export type ExecutionState = "planned" | "active" | "paused" | "completed" | "failed";

export interface ExecutionControlBarProps {
  title: string;
  state: ExecutionState;
  stateLabel: string;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  onStop?: () => void;
  right?: ReactNode;
  className?: string;
}

function intentFor(state: ExecutionState): RbmStatusIntent {
  if (state === "active") return "info";
  if (state === "paused") return "warning";
  if (state === "completed") return "success";
  if (state === "failed") return "critical";
  return "neutral";
}

export function ExecutionControlBar(props: ExecutionControlBarProps) {
  const { title, state, stateLabel, onStart, onPause, onResume, onComplete, onStop, right, className } = props;

  const canStart = state === "planned" && Boolean(onStart);
  const canPause = state === "active" && Boolean(onPause);
  const canResume = state === "paused" && Boolean(onResume);
  const canComplete = (state === "active" || state === "paused") && Boolean(onComplete);
  const canStop = (state === "active" || state === "paused") && Boolean(onStop);

  return (
    <div className={cx("rbm-ecb", className)} role="region" aria-label="Execution controls">
      <div className="rbm-ecb__left">
        <div className="rbm-ecb__title">{title}</div>
        <StatusPill intent={intentFor(state)} label={stateLabel} />
      </div>

      <div className="rbm-ecb__controls" role="group" aria-label="Execution actions">
        <Button variant="primary" disabled={!canStart} onClick={onStart}>Start</Button>
        <Button disabled={!canPause} onClick={onPause}>Pause</Button>
        <Button disabled={!canResume} onClick={onResume}>Resume</Button>
        <Button disabled={!canComplete} onClick={onComplete}>Complete</Button>
        <Button variant="danger" disabled={!canStop} onClick={onStop}>Stop</Button>
      </div>

      {right ? <div className="rbm-ecb__right">{right}</div> : null}
    </div>
  );
}
