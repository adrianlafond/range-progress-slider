import { BaseRangeProps, RangeProps, defaultRangeProps, SingleRangeProps, MultipleRangeProps } from './props';

interface ProcessedProps {
  multiple: boolean;
  rangeProps: Required<RangeProps>;
  dataProps: { [key: string]: string };
  otherProps: { [key: string]: any };
}

/**
 * Takes raw props where virtually all properties are optional and returns an
 * object ready for use by a component with default values supplied.
 */
export function processProps(props: { [key: string]: any } = {}, focussedKnob: 0 | 1 = 0): ProcessedProps {
  const multiple = getValueMultiple(props.multiple);
  const baseProps = getBaseProps(props);
  const rangeProps = getRangeProps(props, baseProps, focussedKnob);
  const dataProps = getDataProps(props);
  const otherProps = getOtherProps(props, rangeProps);
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
    readOnly: getValidBoolean(props.readOnly, defaultRangeProps.readOnly),
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
    const value: MultipleRangeProps['value'] = [getValidValue(valueArray[0], min, max), getValidValue(valueArray[1], min, max)];
    const defaultValue: MultipleRangeProps['defaultValue'] = [getValidValue(defaultValueArray[0], min, max), getValidValue(defaultValueArray[1], min, max)];
    if (focussedKnob === 0) {
      value[1] = Math.max(value[0], value[1]);
      defaultValue[1] = Math.max(defaultValue[0], defaultValue[1]);
    } else {
      value[0] = Math.min(value[0], value[1]);
      defaultValue[0] = Math.min(defaultValue[0], defaultValue[1]);
    }
    multipleRangeProps.value = value;
    multipleRangeProps.defaultValue = defaultValue;
    multipleRangeProps.name2 = props.name2 || '';
    multipleRangeProps.multiple = true;
    return multipleRangeProps as Required<RangeProps>;
  }
  return {
    ...rangeProps,
    multiple: false,
    value: getValidValue(props.value, min, max),
    defaultValue: getValidValue(props.defaultValue, min, max),
  } as Required<RangeProps>;
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
 * SingleRangeProps, or MultipleRangeProps.
 */
function getOtherProps(props: RangeProps, componentProps: { [key: string]: any }) {
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