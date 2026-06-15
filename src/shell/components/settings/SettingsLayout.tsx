import { Accordion, Tabs } from "@mantine/core";
import type { ReactNode } from "react";
import { useIsMobile } from "../../hooks/useIsMobile.ts";

export interface SettingsSection {
  value: string;
  label: string;
  content: ReactNode;
}

interface SettingsLayoutProps {
  sections: SettingsSection[];
}

export const SettingsLayout = ({ sections }: SettingsLayoutProps) => {
  const isMobile = useIsMobile();
  const first = sections[0]?.value;

  if (isMobile) {
    return (
      <Accordion
        defaultValue={first}
        variant="separated"
        radius="md"
        styles={{
          item: {
            backgroundColor: "var(--sw-card)",
            borderColor: "var(--sw-line)",
          },
          label: { fontWeight: 700, color: "var(--sw-ink)" },
          control: { color: "var(--sw-ink)" },
          chevron: { color: "var(--sw-ink-3)" },
        }}
      >
        {sections.map((section) => (
          <Accordion.Item key={section.value} value={section.value}>
            <Accordion.Control>{section.label}</Accordion.Control>
            <Accordion.Panel>{section.content}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  }

  return (
    <Tabs
      orientation="vertical"
      defaultValue={first}
      color="var(--sw-accent)"
      styles={{
        list: {
          borderInlineEnd: "1px solid var(--sw-line)",
          minWidth: 160,
        },
        tab: { fontWeight: 600, color: "var(--sw-ink-2)" },
        panel: { paddingInlineStart: "var(--mantine-spacing-xl)" },
      }}
    >
      <Tabs.List>
        {sections.map((section) => (
          <Tabs.Tab key={section.value} value={section.value}>
            {section.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {sections.map((section) => (
        <Tabs.Panel key={section.value} value={section.value}>
          {section.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};
