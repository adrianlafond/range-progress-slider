import React from 'react';
import { Story, Meta } from '@storybook/react';

import { HorizontalRange, HorizontalRangeProps } from '../horizontal-range';

export default {
  title: 'Example/HorizontalRange',
  component: HorizontalRange,
} as Meta;

const Template: Story<HorizontalRangeProps> = (args) => <HorizontalRange {...args} />;

export const Single = Template.bind({});
Single.args = {
  multiple: false,
};

export const Multiple = Template.bind({});
Multiple.args = {
  multiple: true,
};
