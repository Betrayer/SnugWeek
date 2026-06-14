export const dayContainerId = (day: number): string => `day:${day}`;

export const listContainerId = (listId: string): string => `list:${listId}`;

export const dayColumnId = (day: number): string => `daycol:${day}`;

export const LIST_SIDEBAR_DROP_ID = "listsidebar";

const LIST_DRAG_PREFIX = "listdrag:";

export const listDragId = (listId: string): string =>
  `${LIST_DRAG_PREFIX}${listId}`;

export const parseListDragId = (id: string): string | null =>
  id.startsWith(LIST_DRAG_PREFIX) ? id.slice(LIST_DRAG_PREFIX.length) : null;

export const parseDayColumnId = (id: string): number | null => {
  if (!id.startsWith("daycol:")) return null;
  const day = Number(id.slice("daycol:".length));
  return Number.isInteger(day) ? day : null;
};

export type ParsedContainer =
  | { kind: "day"; day: number }
  | { kind: "list"; listId: string };

export const parseContainerId = (id: string): ParsedContainer | null => {
  if (id.startsWith("day:")) {
    const day = Number(id.slice(4));
    return Number.isInteger(day) ? { kind: "day", day } : null;
  }
  if (id.startsWith("list:")) {
    return { kind: "list", listId: id.slice(5) };
  }
  return null;
};
