export const ORDER_SPACING = 1024;

const MIN_GAP = 1e-6;

export interface Ordered {
  id: string;
  order: number;
}

export const orderForTop = (items: readonly Ordered[]): number => {
  const first = items[0];
  return first ? first.order - ORDER_SPACING : 0;
};

export const orderForBottom = (items: readonly Ordered[]): number => {
  const last = items[items.length - 1];
  return last ? last.order + ORDER_SPACING : 0;
};

export const orderBetween = (
  before: Ordered | undefined,
  after: Ordered | undefined,
): number => {
  if (!before && !after) return 0;
  if (!before && after) return after.order - ORDER_SPACING;
  if (before && !after) return before.order + ORDER_SPACING;
  if (before && after) return (before.order + after.order) / 2;
  return 0;
};

export const needsRenormalize = (items: readonly Ordered[]): boolean => {
  for (let index = 0; index < items.length; index += 1) {
    const current = items[index];
    if (!current || !Number.isFinite(current.order)) return true;
    const next = items[index + 1];
    if (next && Math.abs(next.order - current.order) < MIN_GAP) return true;
  }
  return false;
};

export const renormalize = (
  items: readonly Ordered[],
): { id: string; order: number }[] =>
  items.map((item, index) => ({ id: item.id, order: index * ORDER_SPACING }));
