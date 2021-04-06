import React from 'react';
import './demo.scss';
import { HorizontalRange } from '../horizontal-range';

export const Demo = () => {
  const [value, setValue] = React.useState(25);

  return (
    <div className="demo">
      <h1>range-progress-slider</h1>

      <div>
        <label>Uncontrolled</label>
        <HorizontalRange data-foo="bar" onKeyDown={event => console.log(event.key)} onChange={event => console.log((event.target as HTMLInputElement).value)} />
      </div>

      <div>
        <label>Controlled</label>
        <HorizontalRange value={value} onChange={event => {
          const target = event.target as HTMLInputElement;
          setValue(parseFloat(target.value));
          }} />
      </div>

      <div>
        <label>Controlled (no change)</label>
        <HorizontalRange value={50} />
      </div>
    </div>
  );
};
