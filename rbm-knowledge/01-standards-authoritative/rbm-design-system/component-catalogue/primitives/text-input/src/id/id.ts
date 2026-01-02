let n = 0;
export function uid(prefix = "rbm"): string {
  n += 1;
  return `${prefix}-${n}`;
}
