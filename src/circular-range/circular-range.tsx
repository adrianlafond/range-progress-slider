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
import {
  normalizeDegrees,
  getCenterCoordinates,
  getPercentForValue,
  getRadiansForPercent,
  getKnobTransform,
  getValueFromPointer,
  MouseTouchEvent
} from './utils';
import './circular-range.scss';
import classNames from 'classnames';

export type { CircularRangeProps, SingleRangeProps, MultipleRangeProps, RangeMultipleChangeEvent } from '../shared';

// TODO: clean up:
// mouse -> getValueFromMouse() -> calc knob positions -> useState
// input keyboard               -> calc knob positions -> useState
// prop value                   -> calc knob positions -> useState

// TODO: use arc instead of circle for track

const IS_TOUCH = 'undefined' !== typeof window && 'ontouchstart' in window;

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

  // Ensures zeroAtDegrees is a value between 0 and 360.
  const { degrees: zeroAtDegrees, radians: zeroAtRadians } = React.useMemo(() => {
    return normalizeDegrees(rangeProps.zeroAtDegrees);
  }, [rangeProps.zeroAtDegrees]);

  const { radians: minRadians } = React.useMemo(() => normalizeDegrees(rangeProps.minDegrees), [rangeProps.minDegrees]);
  const { radians: maxRadians } = React.useMemo(() => normalizeDegrees(rangeProps.maxDegrees), [rangeProps.maxDegrees]);

  const [state, setState] = React.useState((() => {
    const value = singleRangeProps ? [singleRangeProps.value, 0]
      : multipleRangeProps ? multipleRangeProps.value : [0, 0];
    const percent1 = getPercentForValue(value[0], rangeProps);
    const radians1 =
      getRadiansForPercent({ percent: percent1, counterClockwise: props.counterClockwise, minRadians, maxRadians });
    const percent2 = multiple ? getPercentForValue(value[1], rangeProps) : 0;
    const radians2 = multiple ?
      getRadiansForPercent({ percent: percent2, counterClockwise: props.counterClockwise, minRadians, maxRadians }) : 0;
    return {
      value,
      knobTransform: getKnobTransform({ center: trackCenter, radius: trackRadius, radians: radians1 }),
      knob2Transform: multiple ? getKnobTransform({ center: trackCenter, radius: trackRadius, radians: radians2 }) : '',
      progressArc: '',
    };
  })());

  const rootRef = React.useRef<HTMLDivElement>();
  const knobRef = React.useRef<SVGEllipseElement>(null);
  const knobRef2 = React.useRef<SVGEllipseElement>(null);
  const multipleInputRef1 = React.useRef<HTMLInputElement>(null);
  const multipleInputRef2 = React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = React.useCallback(() => props.value != null, [props.value]);

  const centerCoords = React.useRef<[number, number]>();

  // When mouse is pressed down, updates the input value and knob positions on
  // each mouse move.
  // TODO: fire an onChange event because the default mousedown event is
  // default prevented!
  function onPointerMove(event: MouseEvent | TouchEvent) {
    const value = getValueFromPointer(getValueFromPointerParams(event));
    if (isControlled()) {
      //
    } else {
      updateKnobPositions([value, state.value[1]]);
    }
  }

  function registerForPointerMove(add = true) {
    const fn = add ? window.addEventListener : window.removeEventListener;
    if (IS_TOUCH) {
      fn('touchmove', onPointerMove);
      fn('touchend', stopListeningForPointerMove);
      fn('touchcancel', stopListeningForPointerMove);
    } else {
      fn('mousemove', onPointerMove);
      fn('mouseup', stopListeningForPointerMove);
    }
  }

  function stopListeningForPointerMove() {
    registerForPointerMove(false);
  }

  React.useEffect(stopListeningForPointerMove);

  const trackArc = React.useMemo(() => {
    const pt1x = trackCenter + Math.cos(minRadians) * trackRadius;
    const pt1y = trackCenter + Math.sin(minRadians) * trackRadius;

    const pt2x = trackCenter + Math.cos(maxRadians) * trackRadius;
    const pt2y = trackCenter + Math.sin(maxRadians) * trackRadius;

    const largeArc = 1;
    const sweep = 1;

    return `M ${pt1x} ${pt1y} ` +
      `A ${trackRadius} ${trackRadius} 0 ${largeArc} ${sweep} ` +
      `${pt2x} ${pt2y}`;
  }, [trackCenter, trackRadius, minRadians, maxRadians]);

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (rangeProps && inputRef.current && knobRef.current) {
      const percent = (value - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const radians = getRadiansForPercent({
        percent,
        minRadians,
        maxRadians,
        counterClockwise: props.counterClockwise,
      });

      // Calculate x,y where the range starts (min or, usually, zero).
      const pt1x = trackCenter + Math.cos(minRadians) * trackRadius;
      const pt1y = trackCenter + Math.sin(minRadians) * trackRadius;

      // Calculate x,y for the knob (or where the range extends to).
      const knobX = trackCenter + Math.cos(radians) * trackRadius;
      const knobY = trackCenter + Math.sin(radians) * trackRadius;
      const knobTransform = getKnobTransform({
        center: trackCenter,
        radius: trackRadius,
        radians,
      });

      // Calculate large arc and sweep values to draw the arc.
      const radiansOffset = radians - minRadians;
      const largeArc = props.counterClockwise
        ? (radiansOffset < Math.PI ? 1 : 0)
        : (radiansOffset < Math.PI ? 0 : 1);
      const sweep = props.counterClockwise ? 0 : 1;

      // Update the "d" attribute of the path to draw the arc.
      const progressArc = `M ${pt1x} ${pt1y} ` +
        `A ${trackRadius} ${trackRadius} 0 ${largeArc} ${sweep} ` +
        `${knobX} ${knobY}`;

      return {
        ...state,
        knobTransform,
        progressArc,
        complete: percent >= 1,
        value: [value, state.value[1]],
      };
    }
  }, [rangeProps, minRadians, maxRadians, props.counterClockwise, trackCenter, state]);

  const updateMultipleKnobPositions = React.useCallback((value = [0, 0]) => {
    if (rangeProps && knobRef.current && knobRef2.current && multipleInputRef1.current && multipleInputRef2.current) {
      const perc1 = (value[0] - rangeProps.min) / (rangeProps.max - rangeProps.min);
      const perc2 = (value[1] - rangeProps.min) / (rangeProps.max - rangeProps.min);

      const counterClockwise = props.counterClockwise;
      const radians1 = getRadiansForPercent({ percent: perc1, counterClockwise, minRadians, maxRadians });
      const radians2 = getRadiansForPercent({ percent: perc2, counterClockwise, minRadians, maxRadians });

      // Calculate x,y for the first knob.
      const pt1x = trackCenter + Math.cos(radians1) * trackRadius;
      const pt1y = trackCenter + Math.sin(radians1) * trackRadius;
      const knobTransform = getKnobTransform({
        center: trackCenter,
        radius: trackRadius,
        radians: radians1,
      });

      // Calculate x,y for the first knob.
      const pt2x = trackCenter + Math.cos(radians2) * trackRadius;
      const pt2y = trackCenter + Math.sin(radians2) * trackRadius;
      const knob2Transform = getKnobTransform({
        center: trackCenter,
        radius: trackRadius,
        radians: radians2,
      });

      // Calculate large arc and sweep values to draw the arc.
      const radiansDelta = radians2 - radians1;
      // const largeArc = 1;
      const largeArc =  props.counterClockwise
        ? (radiansDelta > Math.PI ? 1 : 0)
        : (radiansDelta < -Math.PI ? 1 : 0);
      const sweep = props.counterClockwise ? 1 : 0;

      // Update the "d" attribute of the path to draw the arc.
      const progressArc = `M ${pt1x} ${pt1y} ` +
        `A ${trackRadius} ${trackRadius} 0 ${largeArc} ${sweep} ` +
        `${pt2x} ${pt2y}`;

      return {
        ...state,
        knobTransform,
        knob2Transform,
        progressArc,
        value: [
          focussedKnob === 0 ? value : value[0],
          focussedKnob === 1 ? value : value[1],
        ],
      };
    }
  }, [focussedKnob, rangeProps, trackCenter, props.counterClockwise, zeroAtRadians, state]);

  const updateKnobPositions = React.useCallback((value = [0, 0]) => {
    const nextState = multiple
      ? updateMultipleKnobPositions(value)
      : updateSingleKnobPosition(value[0]);
    if (nextState) {
      setState(nextState);
    }
  }, [multiple, updateSingleKnobPosition, updateMultipleKnobPositions]);

  // Captures changes events from the primary input and updates knobs in response.
  // Only called in response to keyboard input because on mousedown the event's
  // default is prevented.
  // TODO: ensure the event in props.onChange() has correct value(s).
  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const targetValue = event.target.value;
    const value = [...state.value] as [number, number];

    if (singleRangeProps) {
      value[0] = +targetValue;
      singleRangeProps.onChange(event);
    } else if (multipleRangeProps) {
      const multipleEvent = event as RangeMultipleChangeEvent;
      value[0] = focussedKnob === 0 ? +targetValue : value[0];
      value[1] = focussedKnob === 1 ? +targetValue : value[1];
      multipleEvent.knob = focussedKnob;
      multipleEvent.value = value;
      multipleRangeProps.onChange(multipleEvent);
    }

    updateKnobPositions(value);
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
    onPointerDown(event);
    if (props.onMouseDown) {
      props.onMouseDown(event);
    }
  }

  function onInternalTouchStart(event: React.TouchEvent<HTMLInputElement>) {
    onPointerDown(event);
    if (props.onTouchStart) {
      props.onTouchStart(event);
    }
  }

  function onPointerDown(event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) {
    // preventDefault because the value comes from the angle between the mouse
    // and the center; the input is updated to reflect this calculated value.
    event.preventDefault();

    // Because the default is prevented, the input must be focussed manually.
    (event.target as HTMLInputElement).focus();

    const value = [...state.value] as [number, number];
    const pointerValue = getValueFromPointer(getValueFromPointerParams(event.nativeEvent));

    if (singleRangeProps) {
      value[0] = pointerValue;
    } else if (multipleRangeProps) {
      value[0] = focussedKnob === 0 ? pointerValue : value[0];
      value[1] = focussedKnob === 1 ? pointerValue : value[1];

      // TODO: find the closest knob and focus it.
      const nextFocussedKnob = 0;
      setFocussedKnob(nextFocussedKnob);
    }

    updateKnobPositions(value);
    registerForPointerMove();
  }

  // For multiple mode, captures keydown on arrow up and down keys to switch
  // between active knobs. This leaves arrow left and right keys to move the
  // value up and down.
  function onInternalKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (multiple && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      // updateInputs(focussedKnob === 0 ? +multipleInputRef2.current!.value : +multipleInputRef1.current!.value);
      setFocussedKnob(focussedKnob === 0 ? 1 : 0);
    }
    if (props.onKeyDown) {
      props.onKeyDown(event);
    }
  }

  // As soon as the root element is rendered, updates the hidden
  // inputs (for multiple) and the knob positions.
  function onRootRef(el: HTMLDivElement) {
    centerCoords.current = getCenterCoordinates(el);
    if (!rootRef.current) {
      rootRef.current = el;
      updateKnobPositions();
    }
  }

  function getValueFromPointerParams(event: MouseTouchEvent) {
    return {
      event,
      centerCoords: centerCoords.current,
      min: rangeProps.min,
      max: rangeProps.max,
      counterClockwise: !!props.counterClockwise,
      minRadians,
      maxRadians,
      currentValue: inputRef.current ? +inputRef.current.value : 0 / 0,
    };
  }

  return (
    <div
      {...dataProps}
      className={classnames('circular-range', rangeProps.className)}
      style={rangeProps.style}
      ref={onRootRef}
    >
      <svg className="circular-range__grfx">
        <path
          className={classNames(
            'circular-range__track', {
              'circular-range__track--focus': focussed,
              'circular-range__track--disabled': rangeProps.disabled,
            },
          )}
          d={trackArc}
        />
        <path
          className={classnames(
            'circular-range__track-progress', {
              'circular-range__track-progress--focus': focussed,
              'circular-range__track-progress--disabled': rangeProps.disabled,
            },
          )}
          d={state.progressArc}
        />
        <ellipse
          cx={multiple ? (props.counterClockwise ? -4 : 4) : 0}
          cy={0}
          rx={4}
          ry={8}
          className={classnames(
            'circular-range__knob',
            'circular-range__knob--0', {
            'circular-range__knob--focus': focussed && focussedKnob === 0,
            'circular-range__knob--disabled': rangeProps.disabled,
          }
          )}
          style={{ transform: state.knobTransform }}
          ref={knobRef}
        />
      {multiple && (
        <ellipse
          cx={props.counterClockwise ? 4 : -4}
          cy={0}
          rx={4}
          ry={8}
          className={classnames(
            'circular-range__knob',
            'circular-range__knob--1', {
              'circular-range__knob--focus': focussed && focussedKnob === 1,
              'circular-range__knob--disabled': rangeProps.disabled,
            }
          )}
          style={{ transform: state.knob2Transform }}
          ref={knobRef2}
        />
      )}
      </svg>
      {multiple && (
        <>
          <input
            type="hidden"
            name={rangeProps.name || undefined}
            value={state.value[0]}
            ref={multipleInputRef1}
           />
          <input
            type="hidden"
            name={(rangeProps as MultipleRangeProps).name2 || undefined}
            value={state.value[1]}
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
        value={multiple ? state.value[focussedKnob] : state.value[0]}
        onChange={onInternalChange}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        onMouseDown={!IS_TOUCH ? onInternalMouseDown : undefined}
        onTouchStart={IS_TOUCH ? onInternalTouchStart : undefined}
        onKeyDown={onInternalKeyDown}
        data-testid={`${COMPONENT}__input`}
      />
    </div>
  );
});
