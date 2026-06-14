import { Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MoonDoodle } from "../common/doodles.tsx";

interface AuthErrorScreenProps {
  onRetry: () => void;
}

export const AuthErrorScreen = ({ onRetry }: AuthErrorScreenProps) => {
  const { t } = useTranslation("common");
  return (
    <Stack
      align="center"
      justify="center"
      gap="md"
      mih="100vh"
      px="lg"
      style={{ textAlign: "center" }}
    >
      <span aria-hidden style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
        <MoonDoodle size={76} />
      </span>
      <Text ff="var(--sw-font-hand)" fz={34} c="var(--sw-ink-2)">
        {t("authError.title", { defaultValue: "Не вдалося увійти" })}
      </Text>
      <Text fz="sm" c="var(--sw-ink-3)" maw={360}>
        {t("authError.message", {
          defaultValue:
            "Не вийшло підключитися до акаунта. Перевірте зʼєднання та спробуйте ще раз.",
        })}
      </Text>
      <Button
        radius="md"
        onClick={onRetry}
        styles={{
          root: {
            backgroundColor: "var(--sw-accent)",
            color: "var(--sw-accent-ink)",
          },
        }}
      >
        {t("authError.retry", { defaultValue: "Спробувати ще раз" })}
      </Button>
    </Stack>
  );
};
