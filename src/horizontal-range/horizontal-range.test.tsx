import React from 'react';
import { render, screen } from '@testing-library/react';
import { HorizontalRange } from './horizontal-range';
import { COMPONENT } from '../shared';

function tick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// First test I try, run up against crappy JsDom with no offsetWidth!!!! argh
describe('HorizontalRange', () => {
  describe('values', () => {
    const testValues = [
      { min: 0, max: 100, value: 50 },
      { min: 0, max: 100, value: 25 },
      { min: 0, max: 100, value: 75 },
      { min: -50, max: 50, value: 0 },
      { min: -50, max: 50, value: -25 },
      { min: -50, max: 50, value: 25 },
      { min: 0.5, max: 1.5, value: 1.0 },
      { min: 0.5, max: 1.5, value: 0.75 },
      { min: 0.5, max: 1.5, value: 1.25 },
    ];
    testValues.forEach(values => {
      test('positions the knob in correct position corresponding to value between min and max', async () => {
        const { min, max, value } = values;
        const offsetMin = min < 0 ? min - min : min;
        const offsetMax = min < 0 ? max - min : max;
        const offsetValue = min < 0 ? value - min : value;
        const maxWidth = 100;
        render(<HorizontalRange value={value} min={min} max={max} width={maxWidth} />);
        await tick();
        const knob = screen.getByTestId(`${COMPONENT}__knob`);
        const percent = (offsetValue - offsetMin) / (offsetMax - offsetMin);
        const left = parseFloat(window.getComputedStyle(knob).getPropertyValue('left'));
        const expected = maxWidth * percent;
        expect(left).toEqual(expected === -0 ? 0 : expected);
      });
    });
  });
});
