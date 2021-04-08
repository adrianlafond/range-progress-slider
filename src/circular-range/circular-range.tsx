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

export type CircularRangeProps = RangeProps;

export const CircularRange: React.FC<CircularRangeProps> = React.memo((props: CircularRangeProps) => {
  const [focussed, setFocussed] = React.useState(false);
  const [focussedKnob, setFocussedKnob] = React.useState<0 | 1>(0);

  const { multiple, rangeProps, dataProps, otherProps } = processProps(props, focussedKnob);
  const singleRangeProps: Required<SingleRangeProps> | null = multiple ? null : rangeProps as Required<SingleRangeProps>;
  const multipleRangeProps: Required<MultipleRangeProps> | null = multiple ? rangeProps as Required<MultipleRangeProps> : null;

  function onInputRef(el: HTMLInputElement) {
    //
  }

  function onInternalChange(event: React.ChangeEvent<HTMLInputElement>) {
    //
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
    //
  }

  function onInternalKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    //
  }

  return (
    <div
      {...dataProps}
      className={classnames('circular-range', rangeProps.className)}
      style={rangeProps.style}
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
        />
      </svg>
      <input
        {...otherProps}
        name={multiple ? undefined : rangeProps.name}
        min={rangeProps.min}
        max={rangeProps.max}
        step={rangeProps.step}
        disabled={rangeProps.disabled}
        type="range"
        ref={onInputRef}
        className="circular-range__input"
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
