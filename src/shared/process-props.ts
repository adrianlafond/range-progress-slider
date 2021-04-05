import { RangeProps, defaultRangeProps } from './props';

/**
 * Given an object of type RangeProps, returns a new object of Required<RangeProps>
 * where all properties are defined.
 */
export function processProps(props: RangeProps = {}): Required<RangeProps> {
  const [min, max] = getValidMinMax(props.min, props.max);
  return {
    min,
    max,
    step: getNumber(props.step, defaultRangeProps.step),
    value: getValidValue(props.value, min, max),
    defaultValue: getValidValue(props.defaultValue, min, max),
    multiple: getValidBoolean(props.multiple, defaultRangeProps.multiple),
    readOnly: getValidBoolean(props.readOnly, defaultRangeProps.readOnly),
    totalKnobs: defaultRangeProps.totalKnobs,
    independentKnobs: defaultRangeProps.independentKnobs,
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