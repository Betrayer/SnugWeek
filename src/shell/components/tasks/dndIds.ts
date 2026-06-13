export const dayContainerId = (day: number): string => `day:${day}`;

export const listContainerId = (listId: string): string => `list:${listId}`;

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
