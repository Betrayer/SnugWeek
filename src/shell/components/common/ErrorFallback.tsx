import { Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MugDoodle } from "./doodles.tsx";

export const ErrorFallback = () => {
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
        <MugDoodle size={76} />
      </span>
      <Text ff="var(--sw-font-hand)" fz={34} c="var(--sw-ink-2)">
        {t("error.title", { defaultValue: "Щось пішло не так" })}
      </Text>
      <Text fz="sm" c="var(--sw-ink-3)" maw={360}>
        {t("error.message", {
          defaultValue:
            "Сторінку трохи зім'яло. Перезавантажте - і повертаймося до затишку.",
        })}
      </Text>
      <Button
        radius="md"
        onClick={() => window.location.reload()}
        styles={{
          root: {
            backgroundColor: "var(--sw-accent)",
            color: "var(--sw-accent-ink)",
          },
        }}
      >
        {t("error.reload", { defaultValue: "Перезавантажити" })}
      </Button>
    </Stack>
  );
};
