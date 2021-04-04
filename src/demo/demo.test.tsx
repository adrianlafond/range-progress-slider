import React from 'react';
import { render, screen } from '@testing-library/react';
import { Demo } from './demo';

test('renders header with "range-progress-slider"', () => {
  render(<Demo />);
  const headerElement = screen.getByText(/range-progress-slider/i);
  expect(headerElement).toBeInTheDocument();
});
