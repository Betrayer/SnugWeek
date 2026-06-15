import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ComingSoon } from "../../common/ComingSoon.tsx";

export const RemindersSection = () => {
  const { t } = useTranslation("settings");
  return (
    <Stack gap="sm">
      <ComingSoon label={t("remindersTitle")} hint={t("remindersHint")} />
    </Stack>
  );
};
