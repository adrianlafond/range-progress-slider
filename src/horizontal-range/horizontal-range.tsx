import React from 'react';
import classnames from 'classnames';
import {
  processProps,
  RangeProps,
  RangeMultipleChangeEvent,
  COMPONENT,
  // MultipleRangeProps,
  // SingleRangeProps,
} from '../shared';
import './horizontal-range.scss';

export type { SingleRangeProps, MultipleRangeProps, RangeMultipleChangeEvent } from '../shared';
export type HorizontalRangeProps = RangeProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>;

export const HorizontalRange: React.FC<HorizontalRangeProps> = React.memo((props: HorizontalRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);
  const [focussedKnob, setFocussedKnob] = React.useState<0 | 1>(0);

  const { multiple, rangeProps, dataProps, otherProps } = processProps(props, focussedKnob);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const knobRef2 = React.useRef<HTMLDivElement>(null);
  const multipleInputRef1 = React.useRef<HTMLInputElement>(null);
  const multipleInputRef2= React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>();

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (rangeProps && trackRef.current && knobRef.current && progressRef.current) {
      // offsetWidth should be fine for everything, but the style.width number
      // is used to allow for a width in JsDom unit testing.
      const trackWidth = props.style && typeof props.style.width === 'number' ? props.style.width as number : trackRef.current.offsetWidth;
      const knobWidth = knobRef.current.offsetWidth;
      const maxWidth = Math.max(0, trackWidth - knobWidth);
      const percent = (value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      knobRef.current.style.left = `${maxWidth * percent}px`;
      progressRef.current.style.width = `${maxWidth * percent + 1}px`;
    }
  }, [rangeProps, props.style]);

  const updateMultipleKnobPositions = React.useCallback((value: number, paramFocussedKnob = focussedKnob) => {
    if (rangeProps && knobRef.current && knobRef2.current && multipleInputRef1.current && multipleInputRef2.current && progressRef.current) {
      const trackWidth = trackRef.current?.offsetWidth || 0;
      const knob1Width = knobRef.current.offsetWidth;
      const knob2Width = knobRef2.current.offsetWidth;
      const maxWidth = Math.max(0, trackWidth - knob1Width - knob2Width);

      const perc1 = (+multipleInputRef1.current.value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const px1 = maxWidth * perc1;
      knobRef.current.style.left = `${px1}px`;

      const perc2 = (+multipleInputRef2.current.value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const px2 = maxWidth * perc2 + knob1Width;
      knobRef2.current.style.left = `${px2}px`;

      progressRef.current.style.left = `${px1 + knob1Width - 1}px`
      progressRef.current.style.width = `${px2 - px1 - knob1Width + 2}px`;
    }
  }, [rangeProps, focussedKnob]);

  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const targetValue = event.target.value;

    if (props.onChange) {
      if (multiple) {
        const multipleEvent = event as RangeMultipleChangeEvent;
        multipleEvent.knob = focussedKnob;
        multipleEvent.value = [
          focussedKnob === 0 ? +targetValue : +(multipleInputRef1.current?.value || 0),
          focussedKnob === 1 ? +targetValue : +(multipleInputRef2.current?.value || 0),
        ];
      }
      props.onChange(event);
    }

    if (multiple) {
      if (!isControlled()) {
        updateMultipleInputs();
        updateMultipleKnobPositions(+targetValue);
      }
    } else {
      if (!isControlled()) {
        updateSingleKnobPosition(+targetValue);
      }
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

  function onInternalMouseDown(event: React.MouseEvent<HTMLInputElement>) {
    if (trackRef.current && knobRef.current && knobRef2.current) {
      const trackRect = trackRef.current.getBoundingClientRect();
      const clientX = event.clientX - trackRect.left;
      const delta1 = Math.abs(clientX - knobRef.current.offsetLeft);
      const delta2 = Math.abs(clientX - knobRef2.current.offsetLeft);
      const nextFocussedKnob = delta1 < delta2 ? 0 : 1;
      updateInput(nextFocussedKnob === 0 ? +multipleInputRef2.current!.value : +multipleInputRef1.current!.value);
      setFocussedKnob(nextFocussedKnob);
    }
  }

  function onInternalKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (multiple && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      updateInput(focussedKnob === 0 ? +multipleInputRef2.current!.value : +multipleInputRef1.current!.value);
      setFocussedKnob(focussedKnob === 0 ? 1 : 0);
    }
    if (props.onKeyDown) {
      props.onKeyDown(event);
    }
  }

  function onInputRef(el: HTMLInputElement) {
    if (!inputRef.current) {
      inputRef.current = el;
      if (multiple) {
        updateInput(rangeProps.value[focussedKnob]);
        if (multipleInputRef1.current) {
          multipleInputRef1.current.value = `${rangeProps.value[0]}`;
        }
        if (multipleInputRef2.current) {
          multipleInputRef2.current.value = `${rangeProps.value[1]}`;
        }
        updateMultipleKnobPositions(rangeProps.value[focussedKnob]);
      } else {
        updateInput(rangeProps.value[0]);
        updateSingleKnobPosition(rangeProps.value[0]);
      }
    }
  }

  function updateInput(value: number) {
    if (inputRef.current) {
      inputRef.current.value = `${value}`;
    }
  }

  function syncInputs() {
    if (inputRef.current) {
      const targetValue = inputRef.current.value;
      if (multiple) {
        updateInput(isControlled() ? rangeProps.value[focussedKnob] : +targetValue);
        updateMultipleInputs();
        updateMultipleKnobPositions(isControlled() ? rangeProps.value[focussedKnob] : +targetValue);
      } else {
        updateInput(isControlled() ? rangeProps.value[0] : +targetValue);
        updateSingleKnobPosition(isControlled() ? rangeProps.value[0] : +targetValue);
      }
    }
  }

  function updateMultipleInputs() {
    if (inputRef.current) {
      const targetValue = inputRef.current.value;
      if (multipleInputRef1.current && multipleInputRef2.current) {
        multipleInputRef1.current.value = focussedKnob === 0 ? targetValue : `${Math.min(+multipleInputRef1.current.value, +targetValue)}`;
        multipleInputRef2.current.value = focussedKnob === 1 ? targetValue : `${Math.max(+multipleInputRef2.current.value, +targetValue)}`;
      }
    }
  }

  syncInputs();

  return (
    <div
      {...dataProps}
      className={classnames('horizontal-range', rangeProps.className)}
      style={rangeProps.style}
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
      {multiple && (
        <>
          <div
            ref={knobRef2}
            className={classnames('horizontal-range__knob', { 'horizontal-range__knob--focus': focussed && focussedKnob === 1 })}
            data-testid={`${COMPONENT}__knob2`}
          />
          <input type="hidden" name={rangeProps.name || undefined} ref={multipleInputRef1} />
          <input type="hidden" name={rangeProps.name2 || undefined} ref={multipleInputRef2} />
        </>
      )}
      <input
        {...otherProps}
        name={multiple ? undefined : rangeProps.name}
        min={rangeProps.min}
        max={rangeProps.max}
        step={rangeProps.step}
        type="range"
        ref={onInputRef}
        className="horizontal-range__input"
        onChange={onInternalChange}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        onMouseDown={multiple ? onInternalMouseDown : undefined}
        onKeyDown={onInternalKeyDown}
        data-testid={`${COMPONENT}__input`}
      />
    </div>
  );
});

