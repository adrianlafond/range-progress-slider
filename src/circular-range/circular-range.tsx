import React from 'react';
import classnames from 'classnames';
import {
  processCircularRangeProps,
  SingleRangeProps,
  MultipleRangeProps,
  CircularRangeProps,
  RangeMultipleChangeEvent,
  COMPONENT,
} from '../shared';
import './circular-range.scss';

export type { CircularRangeProps, SingleRangeProps, MultipleRangeProps, RangeMultipleChangeEvent } from '../shared';

export const CircularRange: React.FC<CircularRangeProps> = React.memo((props: CircularRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);
  const [focussedKnob, setFocussedKnob] = React.useState<0 | 1>(0);

  const { multiple, rangeProps, dataProps, otherProps } = processCircularRangeProps(props, focussedKnob);

  // TODO: make props:
  const trackRadius = 54;
  const trackMargin = 10;
  const trackCenter = React.useMemo(() => trackRadius + trackMargin, [trackRadius, trackMargin]);

  const singleRangeProps: Required<SingleRangeProps> | null = multiple ? null : rangeProps as Required<SingleRangeProps>;
  const multipleRangeProps: Required<MultipleRangeProps> | null = multiple ? rangeProps as Required<MultipleRangeProps> : null;

  const rootRef = React.useRef<HTMLDivElement>();
  const trackRef = React.useRef<SVGCircleElement>(null);
  const progressRef = React.useRef<SVGPathElement>(null);
  const knobRef = React.useRef<SVGCircleElement>(null);
  const knobRef2 = React.useRef<SVGCircleElement>(null);
  const multipleInputRef1 = React.useRef<HTMLInputElement>(null);
  const multipleInputRef2 = React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  // Ensures zeroAtDegrees is a value between 0 and 360.
  const { zeroAtDegrees, zeroAtRadians } = React.useMemo(() => {
    const zeroProp = props.zeroAtDegrees != null ? props.zeroAtDegrees : 0;
    const modulo360 = zeroProp % 360;
    const degrees: number = modulo360 < 0 ? modulo360 + 360 : modulo360;

    // Convert to radians while keeping 0 at 12:00.
    const radians: number = degrees / 180 * Math.PI - Math.PI * 0.5;

    return { zeroAtDegrees: degrees, zeroAtRadians: radians };
  }, [props.zeroAtDegrees]);

  // Get the origin/center of the circular track in order to measure angles
  // against it for the mouse and knobs.
  function getOrigin() {
    if (rootRef.current) {
      const rootRect = rootRef.current.getBoundingClientRect();
      return [rootRect.width / 2 + rootRect.x, rootRect.height / 2 + rootRect.y];
    }
    return null;
  }

  // Converts the angle of the mouse from the center into a value between the
  // input's min and max.
  function getValueFromMouse(event: MouseEvent | React.MouseEvent<HTMLInputElement>) {
    const origin = getOrigin();
    if (origin) {
      const { min, max } = rangeProps;

      // Get radians between mouse and center of track:
      let radians = Math.atan2(event.clientY - origin[1], event.clientX - origin[0]);

      // Set radians back to 0 or 12:00:
      radians += Math.PI * 0.5;

      if (radians < 0) {
        // Ensure 0 <= radians <= 6.28:
        radians += Math.PI * 2;
      }

      if (props.counterClockwise) {
        // "Flip" the radians to get counter-clockwise values:
        radians = Math.PI * 2 - radians;
      }

      // Convert the radians to a percent:
      let percent = radians / (Math.PI * 2);

      // Account for prop zeroAtDegrees:
      percent -= (props.counterClockwise ? -1 : 1) * (zeroAtDegrees / 360);
      percent %= 1;
      if (percent < 0) {
        percent += 1;
      }

      return min + percent * (max - min);
    }
    return 0;
  }

  // When mouse is pressed down, updates the input value and knob positions on
  // each mouse move.
  // TODO: fire an onChange event because the default mousedown event is
  // default prevented!
  function onMouseMove(event: MouseEvent) {
    const value = getValueFromMouse(event);
    updateInput(value);
    if (multiple) {
      updateMultipleInputs();
      updateMultipleKnobPositions();
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

  const getRadiansForPercent = React.useCallback((percent: number) => {
    // Convert percent to radians and offset by zeroAtRadians.
    let radians = percent * (Math.PI * 2);
    if (props.counterClockwise) {
      radians = Math.PI * 2 - radians;
    }
    radians += zeroAtRadians;
    return radians;
  }, [props.counterClockwise, zeroAtRadians]);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (rangeProps && trackRef.current && progressRef.current && knobRef.current) {
      const percent = (value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const radians = getRadiansForPercent(percent);

      // Calculate x,y where the range starts (min or, usually, zero).
      const pt1x = trackCenter + Math.cos(zeroAtRadians) * trackRadius;
      const pt1y = trackCenter + Math.sin(zeroAtRadians) * trackRadius;

      // Calculate x,y for the knob (or where the range extends to).
      const knobX = trackCenter + Math.cos(radians) * trackRadius;
      const knobY = trackCenter + Math.sin(radians) * trackRadius;
      knobRef.current.style.transform = `translate(
        ${knobX}px,
        ${knobY}px
      )`;

      // Calculate large arc and sweep values to draw the arc.
      const radiansOffset = radians - zeroAtRadians;
      const largeArc = props.counterClockwise
        ? (radiansOffset < Math.PI ? 1 : 0)
        : (radiansOffset < Math.PI ? 0 : 1);
      const sweep = props.counterClockwise ? 0 : 1;

      // Update the "d" attribute of the path to draw the arc.
      const d = `M ${pt1x} ${pt1y} ` +
        `A ${trackRadius} ${trackRadius} 0 ${largeArc} ${sweep} ` +
        `${knobX} ${knobY}`;
      progressRef.current.setAttribute('d', d);
    }
  }, [getRadiansForPercent, rangeProps, zeroAtRadians, props.counterClockwise, trackCenter]);

  const updateMultipleKnobPositions = React.useCallback(() => {
    if (rangeProps && knobRef.current && knobRef2.current && multipleInputRef1.current && multipleInputRef2.current && progressRef.current) {
      const perc1 = (+multipleInputRef1.current.value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const perc2 = (+multipleInputRef2.current.value - rangeProps.min) / (rangeProps.max - rangeProps.min);

      const radians1 = getRadiansForPercent(perc1);
      const radians2 = getRadiansForPercent(perc2);

      // Calculate x,y for the first knob.
      const pt1x = trackCenter + Math.cos(radians1) * trackRadius;
      const pt1y = trackCenter + Math.sin(radians1) * trackRadius;
      knobRef.current.style.transform = `translate(
        ${pt1x}px,
        ${pt1y}px
      )`;

      // Calculate x,y for the first knob.
      const pt2x = trackCenter + Math.cos(radians2) * trackRadius;
      const pt2y = trackCenter + Math.sin(radians2) * trackRadius;
      knobRef2.current.style.transform = `translate(
        ${pt2x}px,
        ${pt2y}px
      )`;

      // Calculate large arc and sweep values to draw the arc.
      const largeArc = props.counterClockwise
        ? (radians1 < Math.PI ? 1 : 0)
        : (radians1 < Math.PI ? 0 : 1);
      const sweep = props.counterClockwise ? 0 : 1;

      // Update the "d" attribute of the path to draw the arc.
      const d = `M ${pt1x} ${pt1y} ` +
        `A ${trackRadius} ${trackRadius} 0 ${largeArc} ${sweep} ` +
        `${pt2x} ${pt2y}`;
      progressRef.current.setAttribute('d', d);
    }
  }, [getRadiansForPercent, rangeProps, trackCenter, props.counterClockwise]);

  // Captures changes events from the primary input and updates knobs in response.
  // Only called in response to keyboard input because on mousedown the event's
  // default is prevented.
  // TODO: ensure the event in props.onChange() has correct value(s).
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
        updateMultipleKnobPositions();
      }
    } else {
      if (!isControlled()) {
        updateSingleKnobPosition(+targetValue);
      }
    }
  }

  // When the primary input is focussed or blurred, sets the focussed state for
  // the component so the visible UI can rendered as focussed.
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

    // Because the default is prevented, the input must be focussed manually.
    (event.target as HTMLInputElement).focus();

    if (multiple) {
      // TODO: find the closest knob and focus it.
      const nextFocussedKnob = 0;
      updateInput(nextFocussedKnob === 0 ? +multipleInputRef2.current!.value : +multipleInputRef1.current!.value);
      setFocussedKnob(nextFocussedKnob);
      updateMultipleKnobPositions();
    } else {
      updateSingleKnobPosition(value);
    }
    if (props.onMouseDown) {
      props.onMouseDown(event);
    }
  }

  // For multiple mode, captures keydown on arrow up and down keys to switch
  // between active knobs. This leaves arrow left and right keys to move the
  // value up and down.
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
        updateMultipleKnobPositions();
      } else if (singleRangeProps) {
        updateInput(singleRangeProps.value);
        updateSingleKnobPosition(singleRangeProps.value);
      }
    }
  }

  // Syncs the primary `<input>`'s value to the component's value.
  function updateInput(value: number) {
    if (inputRef.current) {
      inputRef.current.value = `${value}`;
    }
  }

  // Syncs the values of hidden inputs and positions of the knobs to the
  // primary `<input>`'s value.
  function syncInputs() {
    if (inputRef.current) {
      const targetValue = inputRef.current.value;
      if (multipleRangeProps) {
        updateInput(isControlled() ? multipleRangeProps.value[focussedKnob] : +targetValue);
        updateMultipleInputs();
        updateMultipleKnobPositions();
      } else if (singleRangeProps) {
        updateInput(isControlled() ? singleRangeProps.value : +targetValue);
        updateSingleKnobPosition(isControlled() ? singleRangeProps.value : +targetValue);
      }
    }
  }

  // For form data, two hidden inputs represent the two values of multiple mode.
  // Here the input that represents the active value is sync with the primary
  // input's value.
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
      className={classnames('circular-range', rangeProps.className)}
      style={rangeProps.style}
      ref={onRootRef}
    >
      <svg className="circular-range__grfx">
        <circle
          cx={64}
          cy={64}
          r={trackRadius}
          className={classnames(
            'circular-range__track', {
              'circular-range__track--focus': focussed,
              'circular-range__track--disabled': rangeProps.disabled,
            },
          )}
          ref={trackRef}
        />
        <path
          className={classnames(
            'circular-range__track-progress', {
              'circular-range__track-progress--focus': focussed,
              'circular-range__track-progress--disabled': rangeProps.disabled,
            },
          )}
          d=""
          ref={progressRef}
        />
        <circle
          cx={0}
          cy={0}
          r={8}
          className={classnames(
            'circular-range__knob', {
              'circular-range__knob--focus': focussed && focussedKnob === 0,
              'circular-range__knob--disabled': rangeProps.disabled,
            }
          )}
          ref={knobRef}
        />
      {multiple && (
        <circle
          cx={0}
          cy={0}
          r={8}
          className={classnames(
            'circular-range__knob', {
              'circular-range__knob--focus': focussed && focussedKnob === 1,
              'circular-range__knob--disabled': rangeProps.disabled,
            }
          )}
          ref={knobRef2}
        />
      )}
      </svg>
      {multiple && (
        <>
          <input
            type="hidden"
            name={rangeProps.name || undefined}
            ref={multipleInputRef1}
           />
          <input
            type="hidden"
            name={(rangeProps as MultipleRangeProps).name2 || undefined}
            ref={multipleInputRef2}
           />
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
