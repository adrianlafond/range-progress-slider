import React from 'react';
import { RangeProps, defaultRangeProps, getSingleValue, getMultipleValues } from '../shared';
import './horizontal-range.scss';

export const HorizontalRange: React.FC<RangeProps> = ({
  multiple = false,
  min = defaultRangeProps.value,
  max = defaultRangeProps.max,
  value = defaultRangeProps.value,
}) => {
  function onChange(event: React.ChangeEvent) {
    console.log(event);
  }

  return (
    <div className="horizontal-range">
      {multiple && getMultipleValues(value).map((v, i) => (
        <input
          key={`range-${i}`}
          type="range"
          className="horizontal-range__input"
          value={v}
          onChange={onChange}
        />
      ))}
      {!multiple && <input
        type="range"
        className="horizontal-range__input"
        value={getSingleValue(value)}
        onChange={onChange}
       />}
    </div>
  );
};
