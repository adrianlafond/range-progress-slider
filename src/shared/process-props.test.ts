import {
  processHorizontalRangeProps,
  processVerticalRangeProps,
  processCircularRangeProps,
} from './process-props';
import { defaultRangeProps, MultipleRangeProps, SingleRangeProps } from './props';

[processHorizontalRangeProps, processVerticalRangeProps, processCircularRangeProps].forEach(procressFn => {
  describe(`${procressFn.name}() >`, () => {
    describe('multiple (property) >', () => {
      it('returns false by default for "multiple"', () => {
        expect(procressFn().multiple).toBe(false);
        expect(procressFn().rangeProps.multiple).toBe(false);
      });
    });

    describe('min, max >', () => {
      describe('single', () => {
        it('returns an object with "min" and "max defined to default values if they are not already defined', () => {
          const { min, max } = procressFn().rangeProps;
          expect(min).toBe(defaultRangeProps.min);
          expect(max).toBe(defaultRangeProps.max);
        });
        it('does not allow min to be greater than max', () => {
          const { min, max } = procressFn({ min: 100, max: 50 }).rangeProps;
          expect(min).toBe(50);
          expect(max).toBe(50);
        });
      });
    });

    describe('step, disabled, readOnly >', () => {
      it(`sets "step" to ${defaultRangeProps.step} by default`, () => {
        expect(procressFn().rangeProps.step).toBe(defaultRangeProps.step);
      });
      it(`sets "disabled" to ${defaultRangeProps.disabled} by default`, () => {
        expect(procressFn().rangeProps.disabled).toBe(defaultRangeProps.disabled);
      });
    });

    describe('name, name2 >', () => {
      it('sets name to "" by default', () => {
        expect(procressFn().rangeProps.name).toBe('');
      });
      it('sets name2 to "" by default if multiple', () => {
        expect((procressFn({ multiple: true }).rangeProps as MultipleRangeProps).name2).toBe('');
      });
    });

    describe('single value >', () => {
      ['value', 'defaultValue'].forEach(key => {
        it(`sets ${key} by default halfway between min and max`, () => {
          type valueType = 'value' | 'defaultValue';
          expect((procressFn({ min: 0, max: 100 }).rangeProps as SingleRangeProps)[key as valueType]).toBe(50);
          expect((procressFn({ min: -100, max: -50 }).rangeProps as SingleRangeProps)[key as valueType]).toBe(-75);
          expect((procressFn({ min: -0.5, max: 1.0 }).rangeProps as SingleRangeProps)[key as valueType]).toBe(0.25);
        });
      });
      it(`uses defaultValue to define value if defaultValue is defined and value is not defined`, () => {
        expect((procressFn({ defaultValue: 25 }).rangeProps as SingleRangeProps).value).toBe(25);
      });
    });

    describe('multiple value >', () => {
      type valueType = 'value' | 'defaultValue';
      ['value', 'defaultValue'].forEach(key => {
        it(`sets ${key} by default halfway between min and max`, () => {
          expect((procressFn({ multiple: true, min: 0, max: 100 }).rangeProps as MultipleRangeProps)[key as valueType]![1]).toBe(50);
          expect((procressFn({ multiple: true, min: -100, max: -50 }).rangeProps as MultipleRangeProps)[key as valueType]![0]).toBe(-75);
          expect((procressFn({ multiple: true, min: -100, max: -50 }).rangeProps as MultipleRangeProps)[key as valueType]![1]).toBe(-75);
          expect((procressFn({ multiple: true, min: -0.5, max: 1.0 }).rangeProps as MultipleRangeProps)[key as valueType]![0]).toBe(0.25);
          expect((procressFn({ multiple: true, min: -0.5, max: 1.0 }).rangeProps as MultipleRangeProps)[key as valueType]![1]).toBe(0.25);
        });
        it(`ensures second value value is >= first value when the first knob is the focussed knob`, () => {
          const result = (procressFn({ multiple: true, [key]: [75, 25] }, 0).rangeProps as MultipleRangeProps)[key as valueType]!;
          expect(result[0]).toBe(75);
          expect(result[1]).toBe(75);
        });
        it(`ensures first value is <= second value when the second knob is the focussed knob`, () => {
          const result = (procressFn({ multiple: true, [key]: [75, 25] }, 1).rangeProps as MultipleRangeProps)[key as valueType]!;
          expect(result[0]).toBe(25);
          expect(result[1]).toBe(25);
        });
      });
      it(`uses defaultValue to define value if defaultValue is defined and value is not defined`, () => {
        expect((procressFn({ multiple: true, defaultValue: [25, 75] }).rangeProps as MultipleRangeProps).value).toEqual([25, 75]);
      });
    });

    describe('data attributes >', () => {
      it('returns an empty object if no data attributes are found', () => {
        expect(procressFn().dataProps).toEqual({});
      });
      it('returns an object with all data atttributes', () => {
        expect(procressFn({
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
        expect(procressFn().otherProps).toEqual({});
      });
      it('returns an object with all other props', () => {
        const func = () => undefined;
        expect(procressFn({
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
});
