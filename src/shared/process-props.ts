import { BaseRangeProps, RangeProps, defaultRangeProps, SingleRangeProps, MultipleRangeProps, InteractiveRangeProps } from './props';

interface ProcessedProps {
  multiple: boolean;
  baseProps: Required<BaseRangeProps & InteractiveRangeProps>;
  singleProps: Required<SingleRangeProps> | null;
  multipleProps: Required<MultipleRangeProps> | null;
  dataProps: { [key: string]: string };
  otherProps: { [key: string]: any };
}

/**
 * Takes raw props where virtually all properties are optional and returns an
 * object ready for use by a component with default values supplied.
 */
export function processProps(props: { [key: string]: any } = {}): ProcessedProps {
  const multiple = getValueMultiple(props.multiple);
  const baseProps = processBaseProps(props);
  const singleProps = !multiple ? processSingleProps(props, baseProps) : null;
  const multipleProps = multiple ? processMultipleProps(props, baseProps) : null;
  const dataProps = getDataProps(props);
  const otherProps = getOtherProps(props, singleProps || multipleProps || {});
  return {
    multiple,
    baseProps,
    singleProps,
    multipleProps,
    dataProps,
    otherProps,
  };
}

/**
 * Returns a valid value for the "multiple" property.
 */
function getValueMultiple(value?: RangeProps['multiple']) {
  return getValidBoolean(value, defaultRangeProps.multiple);
}

/**
 *
 */
function processBaseProps(props: RangeProps): Required<BaseRangeProps & InteractiveRangeProps> {
  const [min, max] = getValidMinMax(props.min, props.max);
  return {
    min,
    max,
    step: getNumber(props.step, defaultRangeProps.step),
    disabled: getValidBoolean(props.disabled, defaultRangeProps.disabled),
    readOnly: getValidBoolean(props.readOnly, defaultRangeProps.readOnly),
    style: props.style || {},
    className: props.className || '',
  };
}

/**
 * Returns a SingleRangeProps with all props defined.
 */
function processSingleProps(
  props: RangeProps = { multiple: false },
  baseProps: Required<BaseRangeProps & InteractiveRangeProps>
 ): Required<SingleRangeProps> {
  const { min, max } = baseProps;
  return {
    ...baseProps,
    multiple: false,
    value: getValidValue(props.value, min, max),
    defaultValue: getValidValue(props.defaultValue, min, max)
  }
}

/**
 * Returns a MultipleRangeProps with all props defined.
 */
function processMultipleProps(
  props: RangeProps = { multiple: true },
  baseProps: Required<BaseRangeProps & InteractiveRangeProps>
 ): Required<MultipleRangeProps> {
  const { min, max } = baseProps;
  const value = Array.isArray(props.value) ? props.value : [props.value];
  const defaultValue = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
  return {
    ...baseProps,
    multiple: true,
    value: [getValidValue(value[0], min, max), getValidValue(value[1], min, max)],
    defaultValue: [getValidValue(defaultValue[0], min, max), getValidValue(defaultValue[1], min, max)],
  }
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