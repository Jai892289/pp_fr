import type { PayloadMapRule } from '@/types/common';

export function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === "string" && v.length) return v
  }
  return undefined
}

export function buildPayload(values: Record<string, unknown>, rules: PayloadMapRule[]) {
  const payload: Record<string, unknown> = {};
  for (const rule of rules) {
    const value = values[rule.from];
    const finalValue = 'transform' in rule ? rule.transform?.(value) : value;
    setByPath(payload, rule.path, finalValue);
  }
  return payload;
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let cursor: Record<string, unknown> = target;
  parts.forEach((key, idx) => {
    if (idx === parts.length - 1) {
      cursor[key] = value;
    } else {
      cursor[key] = cursor[key] ?? {};
      cursor = cursor[key] as Record<string, unknown>;
    }
  });
}