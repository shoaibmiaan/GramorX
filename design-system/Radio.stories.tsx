import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'DS/Radio',
  component: Radio,
  args: { label: 'Option' },
};
export default meta;

type Story = StoryObj<typeof Radio>;
export const Basic: Story = {};
