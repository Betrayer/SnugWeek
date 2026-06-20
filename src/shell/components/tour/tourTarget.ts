const isVisible = (element: Element): boolean => {
  if (!(element instanceof HTMLElement)) return false;
  if (element.getClientRects().length === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

export const firstVisibleMatch = (selector: string): HTMLElement | null => {
  const matches = document.querySelectorAll(selector);
  for (const element of matches) {
    if (isVisible(element)) return element as HTMLElement;
  }
  return null;
};
