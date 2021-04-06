import React from 'react';
import './demo.scss';
import { HorizontalRange } from '../horizontal-range';

export const Demo = () => {
  const [value, setValue] = React.useState(25);

  return (
    <div className="demo">
      <h1>range-progress-slider</h1>

      <div>
        <label style={{ marginRight: '1rem' }}>Uncontrolled</label>
        <HorizontalRange data-foo="bar" />
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
        <label style={{ marginRight: '1rem' }}>HTML/native</label>
        <input type="range" />
      </div>
    </div>
  );
};
