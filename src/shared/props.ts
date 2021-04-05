export interface BaseRangeProps {
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

export interface SingleRangeProps extends BaseRangeProps {
  value?: number;
  defaultValue?: number;
}

export interface MultipleRangeProps extends BaseRangeProps {
  value?: number[];
  defaultValue?: number[];
  independentKnobs?: boolean;
  totalKnobs?: number;
}

export type RangeProps = SingleRangeProps | MultipleRangeProps;

export const defaultRangeProps = {
  multiple: false,
  value: 50,
  min: 0,
  max: 100,
  step: 1,
  readOnly: false,
  independentKnobs: false,
  totalKnobs: 1,
};
