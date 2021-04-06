import React from 'react';
import classnames from 'classnames';
import {
  processProps,
  RangeProps,
  COMPONENT,
} from '../shared';
import './horizontal-range.scss';

type HorizontalRangeProps = RangeProps & React.InputHTMLAttributes<HTMLInputElement>;

export const HorizontalRange: React.FC<HorizontalRangeProps> = React.memo((props: HorizontalRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);

  const { multiple, baseProps, singleProps, multipleProps, dataProps, otherProps } = processProps(props);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const knobRef2 = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>();

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (singleProps && trackRef.current && knobRef.current && progressRef.current) {
      // offsetWidth should be fine for everything, but the style.width number
      // is used to allow for a width in JsDom unit testing.
      const trackWidth = props.style && typeof props.style.width === 'number' ? props.style.width as number : trackRef.current.offsetWidth;
      const knobWidth = knobRef.current.offsetWidth;
      const maxWidth = trackWidth - knobWidth;
      const percent = (value - singleProps.min) / (singleProps.max - singleProps.min);
      progressRef.current.style.width = `${maxWidth * percent + 1}px`;
      knobRef.current.style.left = `${maxWidth * percent}px`;
    }
  }, [singleProps, props.style]);

  function onInputRef(el: HTMLInputElement) {
    if (!inputRef.current) {
      inputRef.current = el;
      el.value = `${singleProps?.value}`;
      updateSingleKnobPosition(+el.value);
    }
  }

  React.useEffect(() => {
    if (singleProps?.value != null && isControlled()) {
      inputRef.current!.value = `${singleProps?.value}`;
      updateSingleKnobPosition(+inputRef.current!.value);
    }
  }, [singleProps?.value, updateSingleKnobPosition, isControlled]);

  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (props.onChange) {
      props.onChange(event);
    }
    if (singleProps && inputRef.current) {
      inputRef.current.value = isControlled() ? `${singleProps.value}` : event.target.value;
      updateSingleKnobPosition(+inputRef.current.value);
    }
  }

  function onInternalFocus(event: React.FocusEvent<HTMLInputElement>) {
    setFocussed(true);
    if (props.onFocus) {
      props.onFocus(event);
    }
  }

  function onInternalBlur(event: React.FocusEvent<HTMLInputElement>) {
    setFocussed(false);
    if (props.onBlur) {
      props.onBlur(event);
    }
  }

  return (
    <div
      {...dataProps}
      className={classnames('horizontal-range', baseProps.className)}
      style={baseProps.style}
      >
      <div
        ref={trackRef}
        className={classnames('horizontal-range__track', { 'horizontal-range__track--focus': focussed })}
        data-testid={`${COMPONENT}__track`}
       >
        <div
          ref={progressRef}
          className={classnames('horizontal-range__track-progress', { 'horizontal-range__track-progress--focus': focussed })}
          data-testid={`${COMPONENT}__track-progress`}
        />
      </div>
      <div
        ref={knobRef}
        className={classnames('horizontal-range__knob', { 'horizontal-range__knob--focus': focussed })}
        data-range-item="knob"
        data-testid={`${COMPONENT}__knob`}
      />
      {multipleProps && (
        <>
          <div
            ref={knobRef2}
            className={classnames('horizontal-range__knob', { 'horizontal-range__knob--focus': focussed })}
            data-testid={`${COMPONENT}__knob2`}
          />
          <input type="hidden" value={multipleProps.value[0]} />
          <input type="hidden" value={multipleProps.value[1]} />
        </>
      )}
      <input
        {...otherProps}
        min={baseProps.min}
        max={baseProps.max}
        step={baseProps.step}
        type="range"
        ref={onInputRef}
        className="horizontal-range__input"
        onChange={onInternalChange}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        data-testid={`${COMPONENT}__input`}
      />
    </div>
  );
});

