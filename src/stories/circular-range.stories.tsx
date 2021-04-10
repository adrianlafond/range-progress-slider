import React from 'react';
import { Story, Meta } from '@storybook/react';

import { CircularRange, CircularRangeProps } from '../circular-range';

export default {
  title: 'Example/CircularRange',
  component: CircularRange,
} as Meta;

const Template: Story<CircularRangeProps> = (args) => <CircularRange {...args} />;

export const Single = Template.bind({});
Single.args = {};

export const SingleCounterClockwise = Template.bind({});
SingleCounterClockwise.args = {
  counterClockwise: true
};

// export const Multiple = Template.bind({});
// Multiple.args = {
//   multiple: true,
// };
