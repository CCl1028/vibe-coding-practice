export * from './colors';
export * from './spacing';

import { colors } from './colors';
import { spacing, borderRadius, fontSize, fontWeight } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
};

export type Theme = typeof theme;
