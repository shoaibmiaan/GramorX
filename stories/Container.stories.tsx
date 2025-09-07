import type { Meta, StoryObj } from '@storybook/react'
import Container from '@/components/design-system/Container'

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { width: 'xl', gutter: 'md', py: 'md', surface: 'none', center: true },
  argTypes: {
    width: { control: 'select', options: ['sm','md','lg','xl','2xl','3xl','full'] },
    gutter: { control: 'select', options: ['none','sm','md','lg','xl'] },
    py: { control: 'select', options: ['none','xs','sm','md','lg'] },
    surface: { control: 'select', options: ['none','card','muted','glass'] },
    rounded: { control: 'select', options: ['none','sm','md','lg','xl','2xl','ds','ds-xl','ds-2xl'] },
    elevation: { control: 'boolean' },
    center: { control: 'boolean' },
    sticky: { control: 'boolean' },
    divider: { control: 'select', options: ['top','bottom','both', undefined] },
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: (args) => (
    <Container {...args}>
      <div className="h-48 grid place-items-center text-sm opacity-80">Content</div>
    </Container>
  ),
}

export const CardSurface: Story = {
  args: { surface: 'card', rounded: 'ds-2xl', elevation: true },
}

export const GlassSurface: Story = {
  args: { surface: 'glass', rounded: 'ds-2xl' },
}

export const StickyHeaderDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <Container sticky className="bg-card text-card-foreground border-b border-border">
        <div className="h-14 flex items-center">Sticky Container (top:0)</div>
      </Container>
      <Container width="lg" surface="none" py="lg">
        <p className="opacity-80">
          Scroll to see the sticky container at the top. This is useful for page sections.
        </p>
      </Container>
    </div>
  ),
}
