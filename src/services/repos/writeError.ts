type WriteErrorHandler = (error: unknown) => void;

let handler: WriteErrorHandler = (error) => {
  console.error(error);
};

export const setWriteErrorHandler = (next: WriteErrorHandler): void => {
  handler = next;
};

export const reportWriteError = (error: unknown): void => {
  handler(error);
};
