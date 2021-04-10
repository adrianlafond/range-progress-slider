import React from "react";

export interface BaseRangeProps {
  name?: string;
  // multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface SingleRangeProps extends BaseRangeProps {
  value?: number;
  defaultValue?: number;

  multiple?: false;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface MultipleRangeProps extends BaseRangeProps {
  /**
   * When "multiple" is true, "name2" will be applied as the "name" attribute to
   * the input that stores the second knob's value. Useful for form submission.
   */
  name2?: string;
  value?: [number, number];
  defaultValue?: [number, number];

  multiple?: true;
  onChange?: (event: RangeMultipleChangeEvent<HTMLInputElement>) => void;
}

export type RangeProps = (SingleRangeProps | MultipleRangeProps) & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>;

export interface RangeMultipleChangeEvent<T = HTMLInputElement> extends React.ChangeEvent<T> {
  knob: 0 | 1;
  value: [number, number];
}

export const defaultRangeProps = {
  multiple: false,
  value: 50,
  defaultValue: 50,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  onChange: () => undefined,
};
