import React from 'react';
import classnames from 'classnames';
import {
  getValueMultiple,
  processSingleProps,
  processMultipleProps,
  RangeProps,
  MultipleRangeProps,
  InteractiveRangeProps,
  COMPONENT,
} from '../shared';
import './horizontal-range.scss';

type HorizontalRangeProps = RangeProps & React.InputHTMLAttributes<HTMLInputElement>;

export const HorizontalRange: React.FC<HorizontalRangeProps> = React.memo((props: HorizontalRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);

  const multiple = getValueMultiple(props.multiple);
  const singleProps = !multiple ? processSingleProps(props) : null;
  const multiProps = multiple ? processMultipleProps(props) : null;

  const dataProps = Object.keys(props)
    .filter(propName => propName.startsWith('data-'))
    .reduce((obj: { [key: string]: any }, key: string) => {
      obj[key] = (props as { [key: string]: any })[key];
      return obj;
    }, {});;
  const hostKeys = [...Object.keys(singleProps || multiProps || {}), 'style', 'className'];
  const otherProps = Object.keys(props)
    .filter(propName => !propName.startsWith('data-') && hostKeys.indexOf(propName) === -1)
    .reduce((obj: { [key: string]: any }, key: string) => {
      obj[key] = (props as { [key: string]: any })[key];
      return obj;
    }, {});

  const trackRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>();

  const updateSingleKnobPosition = React.useCallback((value: number) => {
    if (singleProps && trackRef.current && knobRef.current) {
      // offsetWidth should be fine for everything, but the style.width number
      // is used to allow for a width in JsDom unit testing.
      const trackWidth = props.style && typeof props.style.width === 'number' ? props.style.width as number : trackRef.current.offsetWidth;
      const knobWidth = knobRef.current.offsetWidth;
      const maxWidth = trackWidth - knobWidth;
      const percent = (value - singleProps.min) / (singleProps.max - singleProps.min);
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

  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (props.onChange) {
      props.onChange(event);
    }
    if (singleProps && inputRef.current) {
      if (isControlled()) {
        inputRef.current.value = `${singleProps.value}`;
      }
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

  function isControlled() {
    return props.value != null;
  }

  return (
    <div
      {...dataProps}
      className={classnames('horizontal-range', props.className, {
        'horizontal-range--focus': focussed,
      })}
      style={props.style}
      >
      <div ref={trackRef} className="horizontal-range__track" data-range-item="track" data-testid={`${COMPONENT}__track`} />
      {!multiple && <div ref={knobRef} className="horizontal-range__knob" data-range-item="knob" data-testid={`${COMPONENT}__knob`} />}
      {multiple && <MultipleRange {...multiProps as Required<MultipleRangeProps>} />}
      <input
        {...otherProps}
        min={singleProps?.min}
        max={singleProps?.max}
        step={singleProps?.step}
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

const MultipleRange: React.FC<Required<MultipleRangeProps> & InteractiveRangeProps> = () => (
  <input
    type="range"
    className="horizontal-range__input"
  />
);
