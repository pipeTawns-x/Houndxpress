import { contrastRatio } from './contrast.ts';

it('keeps hero text above AA even over a white video pixel through the minimum 80% navy veil', () => {
  const brightestBackground = '#3c4351';
  expect(contrastRatio('#ffffff', brightestBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio('#afc0d6', brightestBackground)).toBeGreaterThanOrEqual(4.5);
});
it('keeps hints on white and the ten-city caption on navy above AA', () => {
  expect(contrastRatio('#475569', '#ffffff')).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio('#afc0d6', '#0b1426')).toBeGreaterThanOrEqual(4.5);
});
