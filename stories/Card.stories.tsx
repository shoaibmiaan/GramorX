import type { Meta, StoryObj } from '@storybook/react'
import { Card } from '@/components/design-system/Card'
import { Button } from '@/components/design-system/Button'

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: { layout: 'centered' },
  args: { variant: 'surface', padding: 'md', rounded: 'ds-2xl' },
  argTypes: {
    variant: { control: 'select', options: ['surface', 'glass', 'ghost'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    rounded: { control: 'select', options: ['ds', 'ds-2xl', 'xl', 'full'] },
    elevation: { control: 'select', options: ['none', 'glow', 'glowLg'] },
    hoverable: { control: 'boolean' },
    divided: { control: 'boolean' },
    compact: { control: 'boolean' },
    focusable: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof Card>

export const Surface: Story = {
  render: (args) => (
    <Card {...args}>
      <Card.Header actions={<Button size="sm">Action</Button>}>Card title</Card.Header>
      <Card.Body>
        <p className="opacity-80">Body content with semantic tokens.</p>
      </Card.Body>
      <Card.Footer>
        <div className="text-sm opacity-70">Footer area</div>
      </Card.Footer>
    </Card>
  ),
}

export const Glass: Story = { args: { variant: 'glass', elevation: 'glow' } }
export const Ghost: Story = { args: { variant: 'ghost', divided: true } }

export const WithMedia: Story = {
  render: (args) => (
    <Card {...args}>
      <Card.Media padding={args.padding}>
        <img
          src="https://picsum.photos/1200/400"
          alt="" className="w-full h-48 object-cover"
          loading="lazy"
        />
      </Card.Media>
      <Card.Header>With media</Card.Header>
      <Card.Body>
        <p>Media bleeds edge-to-edge based on padding.</p>
      </Card.Body>
    </Card>
  ),
  args: { variant: 'surface', padding: 'lg' },
}

export const HoverableFocusable: Story = {
  args: { hoverable: true, focusable: true, elevation: 'none' },
}

export const CompactDense: Story = {
  args: { compact: true, padding: 'sm', divided: true },
}
