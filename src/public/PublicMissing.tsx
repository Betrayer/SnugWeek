import { Button, Center, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface PublicMissingProps {
  variant: "missing" | "error";
}

const FoldedPage = () => (
  <svg
    width="84"
    height="84"
    viewBox="0 0 64 64"
    fill="none"
    stroke="var(--sw-ink-3)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M16 8h22l10 10v38H16z" fill="var(--sw-card)" />
    <path d="M38 8v10h10" />
    <path d="M23 30h18M23 38h18M23 46h12" stroke="var(--sw-line)" />
  </svg>
);

export const PublicMissing = ({ variant }: PublicMissingProps) => {
  const { t } = useTranslation("share");
  return (
    <Center
      component="main"
      mih="100vh"
      style={{ background: "var(--sw-paper)", padding: 24 }}
    >
      <Stack align="center" gap="md" maw={420}>
        <FoldedPage />
        <Text fz="xl" fw={700} c="var(--sw-ink)" ta="center">
          {t(variant === "error" ? "error.title" : "missing.title")}
        </Text>
        <Text c="var(--sw-ink-2)" ta="center">
          {t(variant === "error" ? "error.body" : "missing.body")}
        </Text>
        <Button component="a" href="/" mt="xs">
          {t("openApp")}
        </Button>
      </Stack>
    </Center>
  );
};
