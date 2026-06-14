import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/common/EmptyState.tsx";
import { MugDoodle } from "../components/common/doodles.tsx";

export const StatsPage = () => {
  const { t } = useTranslation("common");
  return (
    <Stack align="center" justify="center" mih="60vh">
      <EmptyState
        icon={<MugDoodle size={40} />}
        label={t("comingSoon")}
        minHeight={0}
      />
    </Stack>
  );
};
