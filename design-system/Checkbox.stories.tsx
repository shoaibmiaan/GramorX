import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'DS/Checkbox',
  component: Checkbox,
  args: { label: 'Accept terms' },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;
export const Basic: Story = {};
