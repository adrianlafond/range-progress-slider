import React from 'react';
import classnames from 'classnames';
import {
  processProps,
  RangeProps,
  COMPONENT,
} from '../shared';
import './horizontal-range.scss';


export type { SingleRangeProps, MultipleRangeProps } from '../shared';
export type HorizontalRangeProps = RangeProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>;

export const HorizontalRange: React.FC<HorizontalRangeProps> = React.memo((props: HorizontalRangeProps) => {
  const [focussedKnob, setFocussedKnob] = React.useState(0);
  const [focussed, setFocussed] = React.useState(false);
  const { multiple, baseProps, singleProps, multipleProps, dataProps, otherProps } = processProps(props);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const knobRef2 = React.useRef<HTMLDivElement>(null);
  const multiInputRef1 = React.useRef<HTMLInputElement>(null);
  const multiInputRef2= React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>();

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (baseProps && trackRef.current && knobRef.current && progressRef.current) {
      // offsetWidth should be fine for everything, but the style.width number
      // is used to allow for a width in JsDom unit testing.
      const trackWidth = props.style && typeof props.style.width === 'number' ? props.style.width as number : trackRef.current.offsetWidth;
      const knobWidth = knobRef.current.offsetWidth;
      const maxWidth = Math.max(0, trackWidth - knobWidth);
      const percent = (value - baseProps.min) / (baseProps.max - baseProps.min);
      knobRef.current.style.left = `${maxWidth * percent}px`;
      progressRef.current.style.width = `${maxWidth * percent + 1}px`;
    }
  }, [baseProps, props.style]);

  const updateMultipleKnobPositions = React.useCallback((value: number) => {
    if (baseProps && knobRef.current && knobRef2.current && multiInputRef1.current && multiInputRef2.current) {
      const trackWidth = trackRef.current?.offsetWidth || 0;
      const knob1Width = knobRef.current.offsetWidth;
      const knob2Width = knobRef2.current.offsetWidth;
      const maxWidth = Math.max(0, trackWidth - knob1Width - knob2Width);
      const percent = (value - baseProps.min) / (baseProps.max - baseProps.min);
      const px = maxWidth * percent + knob1Width;

      if (focussedKnob === 0) {
        knobRef.current.style.left = `${px - knob1Width}px`;
        const percent2 = (Math.max(value, +multiInputRef2.current.value) - baseProps.min) / (baseProps.max - baseProps.min);
        const px2 = maxWidth * percent2 + knob1Width;
        knobRef2.current.style.left = `${px2}px`;
        multiInputRef1.current.value = `${(percent * (baseProps.max - baseProps.min))}`;
        multiInputRef2.current.value = `${(percent2 * (baseProps.max - baseProps.min))}`;
      } else {
        knobRef2.current.style.left = `${px}px`;
        const percent1 = (Math.min(value, +multiInputRef1.current.value) - baseProps.min) / (baseProps.max - baseProps.min);
        const px1 = maxWidth * percent1;
        knobRef.current.style.left = `${px1}px`;
        multiInputRef1.current.value = `${(percent1 * (baseProps.max - baseProps.min))}`;
        multiInputRef2.current.value = `${(percent * (baseProps.max - baseProps.min))}`;
      }
    }
  }, [baseProps, focussedKnob]);

  function onInputRef(el: HTMLInputElement) {
    if (!inputRef.current) {
      inputRef.current = el;
      if (multiple) {
        if (multiInputRef1.current) {
          multiInputRef1.current.value = `${multipleProps?.value[0]}`;
        }
        if (multiInputRef2.current) {
          multiInputRef2.current.value = `${multipleProps?.value[1]}`;
        }
        el.value = `${multipleProps?.value[focussedKnob]}`;
        updateMultipleKnobPositions(+el.value);
      } else {
        el.value = `${singleProps?.value}`;
        updateSingleKnobPosition(+el.value);
      }
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
    } else if (multipleProps && inputRef.current) {
      inputRef.current.value = isControlled() ? `${multipleProps.value[focussedKnob]}` : event.target.value;
      updateMultipleKnobPositions(+inputRef.current.value);
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

  function onInternalKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (multiple && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      if (inputRef.current) {
        if (focussedKnob === 0 && multiInputRef2.current) {
          inputRef.current.value = multiInputRef2.current.value;
        } else if (focussedKnob === 1 && multiInputRef1.current) {
          inputRef.current.value = multiInputRef1.current.value;
        }
      }
      setFocussedKnob(focussedKnob === 0 ? 1 : 0);
    }
    if (props.onKeyDown) {
      props.onKeyDown(event);
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
          className={classnames(
            'horizontal-range__track-progress', {
              'horizontal-range__track-progress--focus': focussed,
            }
          )}
          data-testid={`${COMPONENT}__track-progress`}
        />
      </div>
      <div
        ref={knobRef}
        className={classnames(
          'horizontal-range__knob', {
            'horizontal-range__knob--focus': focussed && (!multiple || (multiple && focussedKnob === 0)),
          }
        )}
        data-range-item="knob"
        data-testid={`${COMPONENT}__knob`}
      />
      {multipleProps && (
        <>
          <div
            ref={knobRef2}
            className={classnames('horizontal-range__knob', { 'horizontal-range__knob--focus': focussed && focussedKnob === 1 })}
            data-testid={`${COMPONENT}__knob2`}
          />
          <input type="hidden" ref={multiInputRef1} />
          <input type="hidden" ref={multiInputRef2} />
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
        onKeyDown={onInternalKeyDown}
        data-testid={`${COMPONENT}__input`}
      />
    </div>
  );
});

