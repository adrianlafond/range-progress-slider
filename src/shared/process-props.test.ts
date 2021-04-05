import { processProps } from './process-props';
import { defaultRangeProps } from './props';

describe('processProps() >', () => {
  it('returns an object with all RangeProps defined', () => {
    const result: { [key: string]: any } = processProps();
    Object.keys(defaultRangeProps).forEach(key => {
      expect(result[key]).toBeDefined();
    });
  });

  describe('multiple >', () => {
    it('returns an object with "multiple" defined if it is not already defined', () => {
      expect(defaultRangeProps.multiple).toBeDefined();
      expect(processProps().multiple).toBe(defaultRangeProps.multiple);
    });
    it('does not update "multiple" if it is already defined and valid', () => {
      // Set test value to opposite of the default to ensure it's not just setting to default.
      const value = !defaultRangeProps.multiple;
      expect(processProps({ multiple: value }).multiple).toBe(value);
    });
  });

  describe('min, max >', () => {
    it('returns an object with "min" and "max defined to default values if they are not already defined', () => {
      const { min, max } = processProps();
      expect(min).toBe(defaultRangeProps.min);
      expect(max).toBe(defaultRangeProps.max);
    });
    it('does not allow min to be greater than max', () => {
      const { min, max } = processProps({ min: 100, max: 50 });
      expect(min).toBe(50);
      expect(max).toBe(50);
    });
  });

  describe('value, defaultValue >', () => {
    ['value', 'defaultValue'].forEach(key => {
      it(`sets value by default halfway between min and max`, () => {
        type valueType = 'value' | 'defaultValue';
        expect(processProps({ min: 0, max: 100 })[key as valueType]).toBe(50);
        expect(processProps({ min: -100, max: -50 })[key as valueType]).toBe(-75);
        expect(processProps({ min: -0.5, max: 1.0 })[key as valueType]).toBe(0.25);
      });
    });
  });
});
