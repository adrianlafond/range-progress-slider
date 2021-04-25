import React from 'react';
import './demo.scss';
import { CircularRange } from '../circular-range';
import { HorizontalRange, MultipleRangeProps, RangeMultipleChangeEvent } from '../horizontal-range';

export const Demo = () => {
  const [value, setValue] = React.useState(25);

  const [multiValues, setMultiValues] = React.useState<MultipleRangeProps['value']>([25, 75]);

  function onMultiChange(event: RangeMultipleChangeEvent<HTMLInputElement>) {
    const newValues = [...event.value];
    setMultiValues(newValues as MultipleRangeProps['value']);
  }

  return (
    <div className="demo">
      <h1>range-progress-slider</h1>

      <h2>Circular Range</h2>
      <div>
        <label style={{ marginRight: '1rem' }}>Uncontrolled</label>
        <CircularRange step={5} defaultValue={25} minDegrees={0} maxDegrees={350} />
        <CircularRange step={5} defaultValue={25} minDegrees={90} maxDegrees={0} />
        <CircularRange step={5} defaultValue={25} minDegrees={180} maxDegrees={90} />
        <CircularRange step={5} defaultValue={25} minDegrees={270} maxDegrees={90} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Counter-clockwise</label>
        <CircularRange step={5} defaultValue={25} counterClockwise zeroAtDegrees={0} />
        <CircularRange step={5} defaultValue={25} counterClockwise zeroAtDegrees={90} />
        <CircularRange step={5} defaultValue={25} counterClockwise zeroAtDegrees={180} />
        <CircularRange step={5} defaultValue={25} counterClockwise zeroAtDegrees={270} />
      </div>

      <div>
        <label style={{ marginRight: '1rem' }}>Multiple</label>
        <CircularRange multiple defaultValue={[25, 75]} zeroAtDegrees={0} />
        <CircularRange multiple defaultValue={[25, 75]} zeroAtDegrees={90} />
        <CircularRange multiple defaultValue={[25, 75]} zeroAtDegrees={180} />
        <CircularRange multiple defaultValue={[25, 75]} zeroAtDegrees={270} />
      </div>

      <div>
        <label style={{ marginRight: '1rem' }}>Multiple</label>
        <CircularRange multiple counterClockwise defaultValue={[25, 75]} zeroAtDegrees={0} />
        <CircularRange multiple counterClockwise defaultValue={[25, 75]} zeroAtDegrees={90} />
        <CircularRange multiple counterClockwise defaultValue={[25, 75]} zeroAtDegrees={180} />
        <CircularRange multiple counterClockwise defaultValue={[25, 75]} zeroAtDegrees={270} />
      </div>

      <h2>Horizontal Range</h2>
      <div>
        <label style={{ marginRight: '1rem' }}>Uncontrolled</label>
        <HorizontalRange data-foo="bar" step={5} defaultValue={25} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled</label>
        <HorizontalRange value={value} step={5} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(+event.target.value)} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Controlled (no change)</label>
        <HorizontalRange value={50} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>Uncontrolled multiple</label>
        <HorizontalRange data-foo="bar" step={5} defaultValue={[25, 75]} multiple />
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
