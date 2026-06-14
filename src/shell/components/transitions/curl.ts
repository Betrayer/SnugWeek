export interface CurlConfig {
  duration: number;
  ease: readonly [number, number, number, number];
  rotate: number;
  scale: number;
}

export const curlConfig: CurlConfig = {
  duration: 0.72,
  ease: [0.4, 0, 0.2, 1],
  rotate: 2,
  scale: 0.97,
};
