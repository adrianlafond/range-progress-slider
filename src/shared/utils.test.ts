import { getSingleValue, getMultipleValues, validateMinMax } from './utils';
import { defaultRangeProps } from './props';

describe('utils >', () => {
  describe('getSingleValue() >', () => {
    it('outputs value unchanged if input value is a number', () => {
      expect(getSingleValue(-50)).toBe(-50);
      expect(getSingleValue(-0.5)).toBe(-0.5);
      expect(getSingleValue(0)).toBe(0);
      expect(getSingleValue(0.5)).toBe(0.5);
      expect(getSingleValue(50)).toBe(50);
    });
    it('outputs default value if input value is not a number', () => {
      expect(getSingleValue(undefined)).toBe(defaultRangeProps.value);
      expect(getSingleValue(0/0)).toBe(defaultRangeProps.value);
      // @ts-ignore
      expect(getSingleValue('string')).toBe(defaultRangeProps.value);
    });
    it('outputs a number value if input value is an array', () => {
      expect(getSingleValue([-50, 0])).toBe(-50);
      expect(getSingleValue([-0.5, 50])).toBe(-0.5);
      expect(getSingleValue([0, 100])).toBe(0);
      expect(getSingleValue([0.5, 0])).toBe(0.5);
      expect(getSingleValue([50, 0])).toBe(50);
      // @ts-ignore
      expect(getSingleValue([undefined, 0])).toBe(defaultRangeProps.value);
      expect(getSingleValue([0 / 0])).toBe(defaultRangeProps.value);
    });
  });

  describe('getMultipleValue() >', () => {
    it('outputs an array with the default value if input value is neither an array nor a number', () => {
      expect(getMultipleValues(undefined)).toEqual([defaultRangeProps.value]);
      expect(getMultipleValues(0 / 0)).toEqual([defaultRangeProps.value]);
      // @ts-ignore
      expect(getMultipleValues('string')).toEqual([defaultRangeProps.value]);
    });
    it('outputs an array with a number if input value a number', () => {
      expect(getMultipleValues(-50)).toEqual([-50]);
      expect(getMultipleValues(-0.5)).toEqual([-0.5]);
      expect(getMultipleValues(-0)).toEqual([-0]);
      expect(getMultipleValues(0.5)).toEqual([0.5]);
      expect(getMultipleValues(50)).toEqual([50]);
    });
    it('outputs an array with default values to fill in for invalid values', () => {
      // @ts-ignore
      expect(getMultipleValues([undefined, null, 'string', 0])).toEqual([
        defaultRangeProps.value,
        defaultRangeProps.value,
        defaultRangeProps.value,
        0,
      ]);
    });
  });

  describe('validateMinMax() >', () => {
    it('returns min and max as is if min is <= max', () => {
      expect(validateMinMax(0, 100)).toEqual([0, 100]);
    });
  });
});
