import React from 'react';
import './demo.scss';
import { HorizontalRange, MultipleRangeProps, RangeMultipleChangeEvent } from '../horizontal-range';

export const Demo = () => {
  const [value, setValue] = React.useState(25);

  const [multiValues, setMultiValues] = React.useState<MultipleRangeProps['value']>([25, 75]);

  function onMultiChange(event: RangeMultipleChangeEvent) {
    const newValues = multiValues?.slice() || [];
    newValues[event.knob] = +event.target.value;
    setMultiValues(newValues as MultipleRangeProps['value']);
  }

  return (
    <div className="demo">
      <h1>range-progress-slider</h1>

      <div>
        <label style={{ marginRight: '1rem' }}>Uncontrolled</label>
        <HorizontalRange data-foo="bar" step={5} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled</label>
        <HorizontalRange value={value} onChange={event => setValue(parseFloat(event.target.value))} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled (no change)</label>
        <HorizontalRange value={50} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Uncontrolled multiple</label>
        <HorizontalRange data-foo="bar" step={5} multiple />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled multiple</label>
        <HorizontalRange value={multiValues} step={5} multiple onChange={onMultiChange} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled multiple (no change)</label>
        <HorizontalRange value={[25, 75]} multiple />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>HTML/native</label>
        <input type="range" />
      </div>
    </div>
  );
};
