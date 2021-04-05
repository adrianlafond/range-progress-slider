import React from 'react';
import {
  getValueMultiple,
  processSingleProps,
  processMultipleProps,
  RangeProps,
  MultipleRangeProps,
  SingleRangeProps,
} from '../shared';
import './horizontal-range.scss';

export const HorizontalRange: React.FC<RangeProps> = (props: RangeProps) => {
  const multiple = getValueMultiple(props.multiple);
  const singleProps = multiple && processSingleProps(props);
  const multiProps = multiple && processMultipleProps(props);

  function onChange(event: React.ChangeEvent) {
    console.log(event);
  }

  return (
    <div className="horizontal-range">
      {multiple
        ? <MultipleRange {...multiProps} onChange={onChange} />
        : <SingleRange {...singleProps} onChange={onChange} />
      }
    </div>
  );
};

const SingleRange: React.FC<Required<SingleRangeProps> & InternalRangeEvents> = ({
  value,
  onChange,
}) => (
  <>
    <div className="horizontal-range__track" />
    <div className="horizontal-range__knob" />
    <div className="horizontal-range__guide" />
    <input
      type="range"
      className="horizontal-range__input"
      value={value}
      onChange={onChange}
    />
  </>
);

const MultipleRange: React.FC<Required<MultipleRangeProps> & InternalRangeEvents> = ({
  value,
  onChange
}) => (
  <input
    type="range"
    className="horizontal-range__input"
    value={value[0]}
    onChange={onChange}
  />
);

interface InternalRangeEvents {
  onChange: (event: React.ChangeEvent) => void;
}
