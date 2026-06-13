import { useMediaQuery } from "@mantine/hooks";

export const useIsMobile = (): boolean =>
  useMediaQuery("(max-width: 62em)", false, { getInitialValueInEffect: false });
