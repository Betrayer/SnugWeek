import { Anchor, Box, Divider, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ShareDoc } from "../services/share/shareTypes.ts";
import { WeekView } from "../shell/components/weekview/WeekView.tsx";

interface PublicShareViewProps {
  share: ShareDoc;
}

export const PublicShareView = ({ share }: PublicShareViewProps) => {
  const { t } = useTranslation("share");
  return (
    <Box style={{ minHeight: "100vh", background: "var(--sw-paper)" }}>
      <Box
        style={{
          maxWidth: 1120,
          marginInline: "auto",
          padding: "clamp(16px, 4vw, 40px)",
        }}
      >
        <Group component="header" justify="space-between" mb="lg" wrap="nowrap">
          <Text ff="var(--sw-font-hand)" fz={26} fw={600} c="var(--sw-ink-2)">
            SnugWeek
          </Text>
          <Text fz="xs" fw={700} c="var(--sw-ink-3)" tt="uppercase">
            {t("readOnlyBadge")}
          </Text>
        </Group>

        <Box component="main">
          <WeekView model={share} variant="screen" />
        </Box>

        <Divider my="xl" color="var(--sw-line)" />

        <Group component="footer" justify="center">
          <Anchor href="/" c="var(--sw-ink-3)" fz="sm" underline="hover">
            {t("madeWith")}
          </Anchor>
        </Group>
      </Box>
    </Box>
  );
};
