import { Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

export const StatsPage = () => {
  const { t } = useTranslation("common");
  return (
    <Stack align="center" justify="center" mih="60vh">
      <Text ff="var(--sw-font-hand)" fz={32} c="var(--sw-ink-3)">
        {t("comingSoon")}
      </Text>
    </Stack>
  );
};
