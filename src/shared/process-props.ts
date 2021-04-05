import { BaseRangeProps, RangeProps, defaultRangeProps, SingleRangeProps, MultipleRangeProps } from './props';

/**
 * Returns a valid value for the "multiple" property.
 */
export function getValueMultiple(value?: RangeProps['multiple']) {
  return getValidBoolean(value, defaultRangeProps.multiple);
}

export function processSingleProps(props: RangeProps = { multiple: false }): Required<SingleRangeProps> {
  const commonProps = processCommonProps(props);
  const {min, max} = commonProps;
  return {
    ...commonProps,
    multiple: false,
    value: getValidValue(props.value, min, max),
    defaultValue: getValidValue(props.defaultValue, min, max)
  }
}

export function processMultipleProps(props: RangeProps = { multiple: true }): Required<MultipleRangeProps> {
  const commonProps = processCommonProps(props);
  const { min, max } = commonProps;
  return {
    ...commonProps,
    multiple: true,
    value: [getValidValue(props.value, min, max)],
    defaultValue: [getValidValue(props.defaultValue, min, max)],
    totalKnobs: defaultRangeProps.totalKnobs,
    independentKnobs: defaultRangeProps.independentKnobs,
  }
}

/**
 * Given an object of type RangeProps, returns a new object of Required<RangeProps>
 * where all properties are defined.
 */
function processCommonProps(props: RangeProps = { multiple: false }): Required<BaseRangeProps> {
  const [min, max] = getValidMinMax(props.min, props.max);
  return {
    min,
    max,
    step: getNumber(props.step, defaultRangeProps.step),
    readOnly: getValidBoolean(props.readOnly, defaultRangeProps.readOnly),
  };
}

function getValidValue(value: any, min: number, max: number): number {
  return getNumber(value, min + (max - min) / 2);
}

function getValidBoolean(value: any, defaultValue: boolean) {
  return value === true || value === false ? value : defaultValue;
}

function getValidMinMax(min?: RangeProps['min'], max?: RangeProps['max']): [number, number] {
  min = getNumber(min, defaultRangeProps.min);
  max = getNumber(max, defaultRangeProps.max);
  min = Math.min(max, min);
  return [min, max];
}

function getNumber(value: any, defaultValue: number): number {
  return (value === undefined || value === null || isNaN(value)) ? defaultValue : value;
}