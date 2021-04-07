import React from "react";

export interface BaseRangeProps {
  name?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface SingleRangeProps extends BaseRangeProps {
  value?: number;
  defaultValue?: number;
}

export interface MultipleRangeProps extends BaseRangeProps {
  name2?: string;
  value?: [number, number];
  defaultValue?: [number, number];
}

export interface InteractiveRangeProps {
  style?: React.CSSProperties;
  className?: string;
}

export type RangeProps = (SingleRangeProps | MultipleRangeProps) & InteractiveRangeProps;

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
  readOnly: false,
};
