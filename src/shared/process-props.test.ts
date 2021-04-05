import { processSingleProps, processMultipleProps } from './process-props';
import { defaultRangeProps } from './props';

describe('processSingleProps(), processMultipleProps() >', () => {
  const funcs = [processSingleProps, processMultipleProps];

  describe('multiple >', () => {
    it('sets "multiple" to false in processSingleProps() by default', () => {
      expect(processSingleProps().multiple).toBe(false);
    });
    it('ensures "multiple" is false in processSingleProps()', () => {
      expect(processSingleProps({ multiple: true }).multiple).toBe(false);
    });
    it('sets "multiple" to true in processMultipleProps() by default', () => {
      expect(processSingleProps().multiple).toBe(true);
    });
    it('ensures "multiple" is true in processMultipleProps()', () => {
      expect(processSingleProps({ multiple: false }).multiple).toBe(true);
    });
  });

  describe('min, max >', () => {
    funcs.forEach(fn => {
      describe(`${fn.name}() >`, () => {
        it('returns an object with "min" and "max defined to default values if they are not already defined', () => {
          const { min, max } = fn();
          expect(min).toBe(defaultRangeProps.min);
          expect(max).toBe(defaultRangeProps.max);
        });
        it('does not allow min to be greater than max', () => {
          const { min, max } = fn({ min: 100, max: 50 });
          expect(min).toBe(50);
          expect(max).toBe(50);
        });
      });
    });
  });

  describe('processSingleProps() value, defaultValue >', () => {
    ['value', 'defaultValue'].forEach(key => {
      it(`sets value by default halfway between min and max`, () => {
        type valueType = 'value' | 'defaultValue';
        expect(processSingleProps({ min: 0, max: 100 })[key as valueType]).toBe(50);
        expect(processSingleProps({ min: -100, max: -50 })[key as valueType]).toBe(-75);
        expect(processSingleProps({ min: -0.5, max: 1.0 })[key as valueType]).toBe(0.25);
      });
    });
  });
});
