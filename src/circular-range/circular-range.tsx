import React from 'react';
import classnames from 'classnames';
import {
  processProps,
  RangeProps,
  SingleRangeProps,
  MultipleRangeProps,
  RangeMultipleChangeEvent,
  COMPONENT,
} from '../shared';
import './circular-range.scss';

export type { SingleRangeProps, MultipleRangeProps, RangeMultipleChangeEvent } from '../shared';

interface ExclusiveCircularRangeProps {
  zeroAtDegree?: number;
}

export type CircularRangeProps = RangeProps & ExclusiveCircularRangeProps;


export const CircularRange: React.FC<CircularRangeProps> = React.memo((props: CircularRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);
  const [focussedKnob, setFocussedKnob] = React.useState<0 | 1>(0);

  const { multiple, rangeProps, dataProps, otherProps } = processProps(props, focussedKnob);
  delete otherProps.zeroAtDegree;

  const singleRangeProps: Required<SingleRangeProps> | null = multiple ? null : rangeProps as Required<SingleRangeProps>;
  const multipleRangeProps: Required<MultipleRangeProps> | null = multiple ? rangeProps as Required<MultipleRangeProps> : null;

  const rootRef = React.useRef<HTMLDivElement>();
  const trackRef = React.useRef<SVGCircleElement>(null);
  const progressRef = React.useRef<SVGCircleElement>(null);
  const knobRef = React.useRef<SVGCircleElement>(null);
  const knobRef2 = React.useRef<SVGCircleElement>(null);
  const multipleInputRef1 = React.useRef<HTMLInputElement>(null);
  const multipleInputRef2 = React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  const zeroAtDegree = React.useMemo(() => {
    const zeroProp = props.zeroAtDegree != null ? props.zeroAtDegree : 0;
    const modulo360 = zeroProp % 360;
    return modulo360 < 0 ? modulo360 + 360 : modulo360;
  }, [props.zeroAtDegree]);

  function getOrigin() {
    if (rootRef.current) {
      const rootRect = rootRef.current.getBoundingClientRect();
      return [rootRect.width / 2 + rootRect.x, rootRect.height / 2 + rootRect.y];
    }
    return null;
  }

  function getValueFromMouse(event: MouseEvent | React.MouseEvent<HTMLInputElement>) {
    const origin = getOrigin();
    if (origin) {
      const { min, max } = rangeProps;
      const radians = Math.atan2(event.clientY - origin[1], event.clientX - origin[0]) + Math.PI;

      // 0 is at 9:00 by default:
      let percent = radians / (Math.PI * 2);

      const zero = Math.max(0, Math.min(360, zeroAtDegree));
      if (zero > 270) {
        percent -= (1 - (zero - 270) / 90) * 0.25;
      } else if (zero < 270) {
        percent -= (1 - (270 - zero) / 270) * 0.75 + 0.25;
      }
      if (percent < 0) {
        percent = 1 + percent;
      }

      return min + percent * (max - min);
    }
    return 0;
  }

  function onMouseMove(event: MouseEvent) {
    const value = getValueFromMouse(event);
    updateInput(value);
    if (multiple) {
      //
    } else {
      updateSingleKnobPosition(value);
    }
  }

  function listenForMouseMove() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopListeningForMouseMove);
  }

  function stopListeningForMouseMove() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopListeningForMouseMove);
  }

  React.useEffect(stopListeningForMouseMove);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (rangeProps && rootRef.current && knobRef.current) {
      const radius = Math.min(rootRef.current.offsetWidth, rootRef.current.offsetHeight) * 0.5 - 10;
      const percent = (value - rangeProps.min) / (rangeProps.max - rangeProps.min);

      const zeroOffset = zeroAtDegree <= 90
        ? (90 - zeroAtDegree) / 90 * Math.PI * 0.5
        : (1 - (zeroAtDegree - 90) / 270) * Math.PI * 1.5 + Math.PI * 0.5;

      const radians = percent * (Math.PI * 2) - zeroOffset;
      knobRef.current.style.transform = `translate(
        ${radius + 10 + Math.cos(radians) * radius}px,
        ${radius + 10 + Math.sin(radians) * radius}px
      )`;
    }
  }, [rangeProps]);

  const updateMultipleKnobPositions = React.useCallback((value: number, paramFocussedKnob = focussedKnob) => {
    if (rangeProps && knobRef.current && knobRef2.current && multipleInputRef1.current && multipleInputRef2.current && progressRef.current) {
      //
    }
  }, [rangeProps, focussedKnob]);

  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const targetValue = event.target.value;

    if (singleRangeProps) {
      singleRangeProps.onChange(event);
    } else if (multipleRangeProps) {
      const multipleEvent = event as RangeMultipleChangeEvent;
      multipleEvent.knob = focussedKnob;
      multipleEvent.value = [
        focussedKnob === 0 ? +targetValue : +(multipleInputRef1.current?.value || 0),
        focussedKnob === 1 ? +targetValue : +(multipleInputRef2.current?.value || 0),
      ];
      multipleRangeProps.onChange(multipleEvent);
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

  // For multiple, finds the closest knob to the mouse on mousedown in order to
  // focus that knob.
  // Begins listening to mouse movement to determine angle between the mouse and
  // the center/origin and thus the "dragging" value.
  function onInternalMouseDown(event: React.MouseEvent<HTMLInputElement>) {
    // preventDefault because the value comes from the angle between the mouse
    // and the center; the input is updated to reflect this calculated value.
    event.preventDefault();
    const value = getValueFromMouse(event);
    updateInput(value);
    listenForMouseMove();

    if (multiple) {
      // TODO: find the closest knob and focus it.
      const nextFocussedKnob = 0;
      updateInput(nextFocussedKnob === 0 ? +multipleInputRef2.current!.value : +multipleInputRef1.current!.value);
      setFocussedKnob(nextFocussedKnob);
    } else {
      updateSingleKnobPosition(value);
    }
    if (props.onMouseDown) {
      props.onMouseDown(event);
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

  // As soon as the root element is rendered, updates the hidden
  // inputs (for multiple) and the knob positions.
  function onRootRef(el: HTMLDivElement) {
    if (!rootRef.current) {
      rootRef.current = el;
      if (multipleRangeProps) {
        updateInput((rangeProps as MultipleRangeProps).value![focussedKnob]);
        if (multipleInputRef1.current) {
          multipleInputRef1.current.value = `${multipleRangeProps.value[0]}`;
        }
        if (multipleInputRef2.current) {
          multipleInputRef2.current.value = `${multipleRangeProps.value[1]}`;
        }
        updateMultipleKnobPositions(multipleRangeProps.value[focussedKnob]);
      } else if (singleRangeProps) {
        updateInput(singleRangeProps.value);
        updateSingleKnobPosition(singleRangeProps.value);
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
      if (multipleRangeProps) {
        updateInput(isControlled() ? multipleRangeProps.value[focussedKnob] : +targetValue);
        updateMultipleInputs();
        updateMultipleKnobPositions(isControlled() ? multipleRangeProps.value[focussedKnob] : +targetValue);
      } else if (singleRangeProps) {
        updateInput(isControlled() ? singleRangeProps.value : +targetValue);
        updateSingleKnobPosition(isControlled() ? singleRangeProps.value : +targetValue);
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

  const knobClassName = classnames(
    'circular-range__knob', {
      'circular-range__knob--focus': focussed,
      'circular-range__knob--disabled': rangeProps.disabled,
    }
  );

  return (
    <div
      {...dataProps}
      className={classnames('circular-range', rangeProps.className)}
      style={rangeProps.style}
      ref={onRootRef}
    >
      <svg className="circular-range__grfx">
        <circle
          cx={'50%'}
          cy={'50%'}
          r={'calc(50% - 0.5rem - 2px)'}
          className={classnames(
            'circular-range__track', {
              'circular-range__track--focus': focussed,
            },
          )}
          ref={trackRef}
        />
        <circle
          cx={0}
          cy={0}
          r={'0.5rem'}
          className={knobClassName}
          ref={knobRef}
        />
      {multiple && (
        <circle
          cx={0}
          cy={0}
          r={'0.5rem'}
          className={knobClassName}
        />
      )}
      </svg>
      {multiple && (
        <>
          <input type="hidden" name={rangeProps.name || undefined} ref={multipleInputRef1} />
          <input type="hidden" name={(rangeProps as MultipleRangeProps).name2 || undefined} ref={multipleInputRef2} />
        </>
      )}
      <input
        {...otherProps}
        name={multiple ? undefined : rangeProps.name}
        min={rangeProps.min}
        max={rangeProps.max}
        step={rangeProps.step}
        disabled={rangeProps.disabled}
        type="range"
        ref={inputRef}
        className="circular-range__input"
        onChange={onInternalChange}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        onMouseDown={onInternalMouseDown}
        onKeyDown={onInternalKeyDown}
        data-testid={`${COMPONENT}__input`}
      />
    </div>
  );
});
