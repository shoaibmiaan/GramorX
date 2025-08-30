import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'DS/Toggle',
  component: Toggle,
  args: { label: 'Enable feature' },
};
export default meta;

type Story = StoryObj<typeof Toggle>;
export const Basic: Story = {
  args: { checked: false },
};
