import { processProps } from './process-props';
import { defaultRangeProps } from './props';

describe('processProps() >', () => {
  describe('multiple (property) >', () => {
    it('returns false by default for "multiple"', () => {
      expect(processProps().multiple).toBe(false);
      expect(processProps().rangeProps.multiple).toBe(false);
    });
  });

  describe('min, max >', () => {
    describe('single', () => {
      it('returns an object with "min" and "max defined to default values if they are not already defined', () => {
        const { min, max } = processProps().rangeProps;
        expect(min).toBe(defaultRangeProps.min);
        expect(max).toBe(defaultRangeProps.max);
      });
      it('does not allow min to be greater than max', () => {
        const { min, max } = processProps({ min: 100, max: 50 }).rangeProps;
        expect(min).toBe(50);
        expect(max).toBe(50);
      });
    });
  });

  describe('step, disabled, readOnly >', () => {
    it(`sets "step" to ${defaultRangeProps.step} by default`, () => {
      expect(processProps().rangeProps.step).toBe(defaultRangeProps.step);
    });
    it(`sets "disabled" to ${defaultRangeProps.disabled} by default`, () => {
      expect(processProps().rangeProps.disabled).toBe(defaultRangeProps.disabled);
    });
    it(`sets "readOnly" to ${defaultRangeProps.readOnly} by default`, () => {
      expect(processProps().rangeProps.readOnly).toBe(defaultRangeProps.readOnly);
    });
  });

  describe('name, name2 >', () => {
    it('sets name to "" by default', () => {
      expect(processProps().rangeProps.name).toBe('');
    });
    it('sets name2 to "" by default if multiple', () => {
      expect(processProps({ multiple: true }).rangeProps.name2).toBe('');
    });
  });

  describe('single value >', () => {
    ['value', 'defaultValue'].forEach(key => {
      it(`sets ${key} by default halfway between min and max`, () => {
        type valueType = 'value' | 'defaultValue';
        expect(processProps({ min: 0, max: 100 }).rangeProps[key as valueType][0]).toBe(50);
        expect(processProps({ min: -100, max: -50 }).rangeProps[key as valueType][0]).toBe(-75);
        expect(processProps({ min: -0.5, max: 1.0 }).rangeProps[key as valueType][0]).toBe(0.25);
      });
    });
  });

  describe('multiple value >', () => {
    type valueType = 'value' | 'defaultValue';
    ['value', 'defaultValue'].forEach(key => {
      it(`sets ${key} by default halfway between min and max`, () => {
        expect(processProps({ multiple: true, min: 0, max: 100 }).rangeProps[key as valueType][0]).toBe(50);
        expect(processProps({ multiple: true, min: 0, max: 100 }).rangeProps[key as valueType][1]).toBe(50);
        expect(processProps({ multiple: true, min: -100, max: -50 }).rangeProps[key as valueType][0]).toBe(-75);
        expect(processProps({ multiple: true, min: -100, max: -50 }).rangeProps[key as valueType][1]).toBe(-75);
        expect(processProps({ multiple: true, min: -0.5, max: 1.0 }).rangeProps[key as valueType][0]).toBe(0.25);
        expect(processProps({ multiple: true, min: -0.5, max: 1.0 }).rangeProps[key as valueType][1]).toBe(0.25);
      });
      it(`ensures second value value is >= first value when the first knob is the focussed knob`, () => {
        const result = processProps({ multiple: true, [key]: [75, 25] }, 0);
        expect(result.rangeProps[key as valueType][0]).toBe(75);
        expect(result.rangeProps[key as valueType][1]).toBe(75);
      });
      it(`ensures first value is <= second value when the second knob is the focussed knob`, () => {
        const result = processProps({ multiple: true, [key]: [75, 25] }, 1);
        expect(result.rangeProps[key as valueType][0]).toBe(25);
        expect(result.rangeProps[key as valueType][1]).toBe(25);
      });
    });
  });

  describe('data attributes >', () => {
    it('returns an empty object if no data attributes are found', () => {
      expect(processProps().dataProps).toEqual({});
    });
    it('returns an object with all data atttributes', () => {
      expect(processProps({
        multiple: true,
        'data-foo': 'bar',
        'data-test': 'ok',
      }).dataProps).toEqual({
          'data-foo': 'bar',
          'data-test': 'ok',
      });
    });
  });

  describe('other props >', () => {
    it('returns an empty object if no data attributes are found', () => {
      expect(processProps().otherProps).toEqual({});
    });
    it('returns an object with all other props', () => {
      const func = () => undefined;
      expect(processProps({
        step: 5,
        'data-foo': 'bar',
        foo: 'bar',
        onEvent: func,
      }).otherProps).toEqual({
        foo: 'bar',
        onEvent: func,
      });
    });
  });
});
