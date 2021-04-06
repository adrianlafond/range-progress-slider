import { processProps } from './process-props';
import { defaultRangeProps } from './props';

describe('processProps() >', () => {
  describe('mutliple >', () => {
    it('returns false by default for "multiple"', () => {
      expect(processProps().multiple).toBe(false);
    });
  });

  describe('singleProps, multipleProps >', () => {
    it('returns singleProps but not multipleProps if multiple is false', () => {
      const { singleProps, multipleProps } = processProps();
      expect(singleProps).toBeDefined();
      expect(singleProps).not.toBeNull();
      expect(multipleProps).toBeNull();
    });
    it('returns multipleProps but not singleProps if multipe is true', () => {
      const { singleProps, multipleProps } = processProps({ multiple: true });
      expect(singleProps).toBeNull();
      expect(multipleProps).toBeDefined();
      expect(multipleProps).not.toBeNull();
    });
  });

  describe('min, max >', () => {
    describe('singleProps', () => {
      it('returns an object with "min" and "max defined to default values if they are not already defined', () => {
        const { min, max } = processProps().baseProps;
        expect(min).toBe(defaultRangeProps.min);
        expect(max).toBe(defaultRangeProps.max);
      });
      it('does not allow min to be greater than max', () => {
        const { min, max } = processProps({ min: 100, max: 50 }).baseProps;
        expect(min).toBe(50);
        expect(max).toBe(50);
      });
    });
  });

  describe('step, disabled, readOnly >', () => {
    it(`sets "step" to ${defaultRangeProps.step} by default`, () => {
      expect(processProps().baseProps.step).toBe(defaultRangeProps.step);
    });
    it(`sets "disabled" to ${defaultRangeProps.disabled} by default`, () => {
      expect(processProps().baseProps.disabled).toBe(defaultRangeProps.disabled);
    });
    it(`sets "readOnly" to ${defaultRangeProps.readOnly} by default`, () => {
      expect(processProps().baseProps.readOnly).toBe(defaultRangeProps.readOnly);
    });
  });

  describe('name, name2 >', () => {
    it('sets name to "" by default', () => {
      expect(processProps().baseProps.name).toBe('');
    });
    it('sets name2 to "" by default if multiple', () => {
      expect(processProps({ multiple: true}).multipleProps!.name2).toBe('');
    });
  });

  describe('singleProps value >', () => {
    ['value', 'defaultValue'].forEach(key => {
      it(`sets ${key} by default halfway between min and max`, () => {
        type valueType = 'value' | 'defaultValue';
        expect(processProps({ min: 0, max: 100 }).singleProps![key as valueType]).toBe(50);
        expect(processProps({ min: -100, max: -50 }).singleProps![key as valueType]).toBe(-75);
        expect(processProps({ min: -0.5, max: 1.0 }).singleProps![key as valueType]).toBe(0.25);
      });
    });
  });

  describe('multipleProps value >', () => {
    type valueType = 'value' | 'defaultValue';
    ['value', 'defaultValue'].forEach(key => {
      it(`sets ${key} by default halfway between min and max`, () => {
        expect(processProps({ multiple: true, min: 0, max: 100 }).multipleProps![key as valueType][0]).toBe(50);
        expect(processProps({ multiple: true, min: 0, max: 100 }).multipleProps![key as valueType][1]).toBe(50);
        expect(processProps({ multiple: true, min: -100, max: -50 }).multipleProps![key as valueType][0]).toBe(-75);
        expect(processProps({ multiple: true, min: -100, max: -50 }).multipleProps![key as valueType][1]).toBe(-75);
        expect(processProps({ multiple: true, min: -0.5, max: 1.0 }).multipleProps![key as valueType][0]).toBe(0.25);
        expect(processProps({ multiple: true, min: -0.5, max: 1.0 }).multipleProps![key as valueType][1]).toBe(0.25);
      });
      it(`ensures first value is <= second value`, () => {
        expect(processProps({ multiple: true, [key]: [75, 25] }).multipleProps![key as valueType][0]).toBe(25);
        expect(processProps({ multiple: true, [key]: [75, 25] }).multipleProps![key as valueType][1]).toBe(25);
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
