import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'DS/Select',
  component: Select,
  args: {
    label: 'Choose',
    options: [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ]
  },
};
export default meta;

type Story = StoryObj<typeof Select>;
export const Basic: Story = {};
