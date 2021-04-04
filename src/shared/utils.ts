import { RangeProps, defaultRangeProps } from './props';

/**
 * Returns either the input value as is if it is a number or else a default number value.
 */
export function getSingleValue(value: RangeProps['value']): number {
  let num = Array.isArray(value) ? value[0] : value;
  return num === undefined || num === null || isNaN(num) ? defaultRangeProps.value : num;
}

/**
 * Returns an array of numbers, replacing invalid non-number values in the array
 * with default number values.
 */
export function getMultipleValues(value: RangeProps['value']): number[] {
  let nums = Array.isArray(value) ? value : [value];
  return nums.map(n => getSingleValue(n));
}

/**
 * Returns an array of two numbers where the first number is the min, the second
 * is the max, and the min is guaranteed to be <= max.
 */
export function validateMinMax(min = defaultRangeProps.min, max = defaultRangeProps.max): [number, number] {
  return [min, max];
}