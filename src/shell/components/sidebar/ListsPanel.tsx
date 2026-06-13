import { Stack } from "@mantine/core";
import { useListsStore } from "../../../state/listsStore.ts";
import { AddListControl } from "./AddListControl.tsx";
import { ListSection } from "./ListSection.tsx";

export const ListsPanel = () => {
  const lists = useListsStore((state) => state.lists);
  return (
    <Stack gap="lg">
      {lists.map((list) => (
        <ListSection key={list.id} list={list} />
      ))}
      <AddListControl />
    </Stack>
  );
};
