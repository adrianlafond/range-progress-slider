import React from 'react';
import {
  getValueMultiple,
  processSingleProps,
  processMultipleProps,
  RangeProps,
  InteractiveRangeProps,
  MultipleRangeProps,
  SingleRangeProps,
  COMPONENT,
} from '../shared';
import './horizontal-range.scss';

export const HorizontalRange: React.FC<RangeProps> = (props: RangeProps & InteractiveRangeProps) => {
  const multiple = getValueMultiple(props.multiple);
  const singleProps = !multiple ? processSingleProps(props) : null;
  const multiProps = multiple ? processMultipleProps(props) : null;

  const rootRef = React.useRef<HTMLDivElement>();
  const trackRef = React.useRef<HTMLDivElement>();
  const knobRef = React.useRef<HTMLDivElement>();

  function updateSingleKnobPosition(value?: number) {
    if (singleProps && trackRef.current && knobRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const knobWidth = knobRef.current.offsetWidth;
      const min = 0;
      const max = trackWidth - knobWidth;
      const percent = (value != null ? value : singleProps.value) / 100;
      knobRef.current.style.left = `${min + (max - min) * percent}px`;
    }
  }

  function onRootElement(el: HTMLDivElement) {
    rootRef.current = el;
    const track = rootRef.current.querySelector(`[data-range-item=track]`);
    const knob = rootRef.current.querySelector(`[data-range-item=knob]`);
    if (track && knob) {
      trackRef.current = track as HTMLDivElement;
      knobRef.current = knob as HTMLDivElement;
      updateSingleKnobPosition();
    }
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateSingleKnobPosition(+event.target.value);
    if (props.onChange) {
      props.onChange(event);
    }
  }

  if (singleProps) {
    updateSingleKnobPosition();
  }


  return (
    <div className="horizontal-range" ref={onRootElement}>
      <div className="horizontal-range__track" data-range-item="track" data-testid={`${COMPONENT}__track`} />
      {multiple
        ? <MultipleRange {...multiProps as Required<MultipleRangeProps>} onChange={onChange} />
        : <SingleRange {...singleProps as Required<SingleRangeProps>} onChange={onChange} />
      }
    </div>
  );
};

const SingleRange: React.FC<Required<SingleRangeProps> & SingleInternalRangeProps> = ({
  value,
  onChange,
}) => (
  <>
    <div className="horizontal-range__knob" data-range-item="knob" data-testid={`${COMPONENT}__knob`} />
    <div className="horizontal-range__guide" />
    <input
      type="range"
      className="horizontal-range__input"
      value={value}
      onChange={onChange}
      data-testid={`${COMPONENT}__input`}
    />
  </>
);

const MultipleRange: React.FC<Required<MultipleRangeProps> & InternalRangeProps> = ({
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

interface InternalRangeProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SingleInternalRangeProps extends InternalRangeProps {
  //
}
