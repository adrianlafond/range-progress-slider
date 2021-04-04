export interface BaseRangeProps {
  multiple?: boolean;
  min?: number;
  max?: number;
}

export interface SingleRangeProps extends BaseRangeProps {
  multiple?: false;
  value?: number;
}

export interface MultipleRangeProps extends BaseRangeProps {
  multiple?: true;
  value?: number[];
  independentKnobs?: boolean;
  totalKnobs?: number;
}

export type RangeProps = SingleRangeProps | MultipleRangeProps;

export const defaultRangeProps = {
  multiple: false,
  value: 50,
  min: 0,
  max: 100,
  independentKnobs: false,
  totalKnobs: 1,
};
