const fieldInput = {
  backgroundColor: "var(--sw-card)",
  borderColor: "var(--sw-line)",
  color: "var(--sw-ink)",
};

export const fieldStyles = {
  label: { color: "var(--sw-ink-2)", fontWeight: 600 },
  input: fieldInput,
};

export const inputFieldStyles = {
  input: { ...fieldInput, "--input-placeholder-color": "var(--sw-ink-3)" },
};
