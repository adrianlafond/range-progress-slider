import { BaseRangeProps, RangeProps, defaultRangeProps, MultipleRangeProps, CircularRangeProps } from './props';

interface ProcessedProps {
  multiple: boolean;
  rangeProps: Required<RangeProps>;
  dataProps: { [key: string]: string };
  otherProps: { [key: string]: any };
}

interface ProressedCircularRangeProps extends Omit<ProcessedProps, 'rangeProps'> {
  rangeProps: Required<CircularRangeProps>;
}

/**
 * Takes raw props where virtually all properties are optional and returns an
 * object ready for use by a horizontal range component with default values supplied.
 */
export function processHorizontalRangeProps(props: { [key: string]: any } = {}, focussedKnob: 0 | 1 = 0): ProcessedProps {
  return processProps(props, focussedKnob);
}

export function processVerticalRangeProps(props: { [key: string]: any } = {}, focussedKnob: 0 | 1 = 0): ProcessedProps {
  return processProps(props, focussedKnob);
}

export function processCircularRangeProps(props: { [key: string]: any } = {}, focussedKnob: 0 | 1 = 0): ProressedCircularRangeProps {
  const multiple = getValueMultiple(props.multiple);
  const baseProps = getBaseProps(props);
  const rangeProps = getCircularRangeProps(props, baseProps, focussedKnob);
  const dataProps = getDataProps(props);
  const otherProps = getOtherProps(props, rangeProps);
  return {
    multiple,
    rangeProps,
    dataProps,
    otherProps,
  };
}

function processProps(props: { [key: string]: any } = {}, focussedKnob: 0 | 1 = 0): ProcessedProps {
  const multiple = getValueMultiple(props.multiple);
  const baseProps = getBaseProps(props);
  const rangeProps = getRangeProps(props, baseProps, focussedKnob);
  const dataProps = getDataProps(props);
  const otherProps = getOtherProps<CircularRangeProps>(props, rangeProps);
  return {
    multiple,
    rangeProps,
    dataProps,
    otherProps,
  };
}

function getValueMultiple(value?: RangeProps['multiple']) {
  return getValidBoolean(value, defaultRangeProps.multiple);
}

function getBaseProps(props: RangeProps): Required<BaseRangeProps> {
  const [min, max] = getValidMinMax(props.min, props.max);
  return {
    name: props.name || '',
    // multiple: getValidBoolean(props.multiple, defaultRangeProps.multiple),
    min,
    max,
    step: getNumber(props.step, defaultRangeProps.step),
    disabled: getValidBoolean(props.disabled, defaultRangeProps.disabled),
    style: props.style || {},
    className: props.className || '',
  };
}

function getRangeProps(
  props: RangeProps,
  baseProps: Required<BaseRangeProps>,
  focussedKnob: 0 | 1
): Required<RangeProps> {
  const { min, max } = baseProps;
  const rangeProps: RangeProps = {
    ...baseProps,
    onChange: props.onChange || (() => { }),
  };
  if (props.multiple) {
    const multipleRangeProps: MultipleRangeProps = { ...rangeProps, multiple: true };
    const valueArray = Array.isArray(props.value) ? props.value : [props.value];
    const defaultValueArray = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
    const multipleDefaultValue: MultipleRangeProps['defaultValue'] = [
      getValidValue(defaultValueArray[0], min, max),
      getValidValue(defaultValueArray[1], min, max),
    ];
    const multipleValue: MultipleRangeProps['value'] = props.value === undefined && props.defaultValue != null
      ? multipleDefaultValue
      : [getValidValue(valueArray[0], min, max), getValidValue(valueArray[1], min, max)];


    if (focussedKnob === 0) {
      multipleValue[1] = Math.max(multipleValue[0], multipleValue[1]);
      multipleDefaultValue[1] = Math.max(multipleDefaultValue[0], multipleDefaultValue[1]);
    } else {
      multipleValue[0] = Math.min(multipleValue[0], multipleValue[1]);
      multipleDefaultValue[0] = Math.min(multipleDefaultValue[0], multipleDefaultValue[1]);
    }
    multipleRangeProps.value = multipleValue;
    multipleRangeProps.defaultValue = multipleDefaultValue;
    multipleRangeProps.name2 = props.name2 || '';
    multipleRangeProps.multiple = true;
    return multipleRangeProps as Required<RangeProps>;
  }
  const singleDefaultValue = getValidValue(props.defaultValue, min, max);
  const singleValue = props.value === undefined && props.defaultValue != null
    ? singleDefaultValue
    : getValidValue(props.value, min, max);
  return {
    ...rangeProps,
    multiple: false,
    value: singleValue,
    defaultValue: singleDefaultValue,
  } as Required<RangeProps>;
}

function getCircularRangeProps(
  props: CircularRangeProps,
  baseProps: Required<BaseRangeProps>,
  focussedKnob: 0 | 1
): Required<CircularRangeProps> {
  return {
    ...getRangeProps(props, baseProps, focussedKnob),
    zeroAtDegrees: getNumber(props.zeroAtDegrees, 0),
    counterClockwise: getValidBoolean(props.counterClockwise, false),
  };
}

/**
 * Returns an object filtered to property names that start with "data-".
 */
function getDataProps(props: RangeProps) {
  return Object.keys(props)
    .filter(propName => propName.startsWith('data-'))
    .reduce((obj: { [key: string]: any }, propName: string) => {
      obj[propName] = (props as { [key: string]: any })[propName];
      return obj;
    }, {});
}

/**
 * Returns an object with all other props; i.e., props that are not data attributes,
 * SingleRangeProps, or MultipleRangeProps. Other props will be applied to the
 * primary `<input>`.
 */
function getOtherProps<T = RangeProps>(props: T, componentProps: { [key: string]: any }) {
  const hostKeys = [...Object.keys(componentProps), 'style', 'className'];
  return Object.keys(props)
    .filter(propName => !propName.startsWith('data-') && hostKeys.indexOf(propName) === -1)
    .reduce((obj: { [key: string]: any }, propName: string) => {
      obj[propName] = (props as { [key: string]: any })[propName];
      return obj;
    }, {});
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