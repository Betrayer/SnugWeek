type ReadErrorHandler = (error: unknown) => void;

let handler: ReadErrorHandler = (error) => {
  console.error(error);
};

export const setReadErrorHandler = (next: ReadErrorHandler): void => {
  handler = next;
};

export const reportReadError = (error: unknown): void => {
  handler(error);
};
