// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/design-system/Button'

const meta = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'outline', 'soft', 'ghost', 'link'],
    },
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['pill', 'rounded', 'square'],
    },
    href: { control: 'text' },
    external: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    animated: { control: 'boolean' },
    elevateOnHover: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
  },
  args: {
    children: 'Get Started',
    variant: 'primary',
    size: 'md',
    shape: 'pill',
    animated: true,
    elevateOnHover: true,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof Button>

/** Simple inline icons (no external deps) */
const Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M13.2 4l6.8 8-6.8 8h-2.4l6.1-7.2H4v-1.6h12.9L10.8 4h2.4z" />
  </svg>
)
const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z" />
  </svg>
)

/* ---------- Basic Variants ---------- */
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Accent: Story = { args: { variant: 'accent' } }
export const Outline: Story = { args: { variant: 'outline', tone: 'primary' } }
export const Soft: Story = { args: { variant: 'soft', tone: 'primary' } }
export const Ghost: Story = { args: { variant: 'ghost', tone: 'primary' } }
export const LinkBtn: Story = { args: { variant: 'link', tone: 'primary', children: 'Learn more' } }

/* ---------- States ---------- */
export const WithIcons: Story = {
  args: {
    variant: 'primary',
    leadingIcon: <Check />,
    trailingIcon: <Icon />,
    children: 'Continue',
  },
}
export const Loading: Story = { args: { loading: true, loadingText: 'Processing…' } }
export const Disabled: Story = { args: { disabled: true } }
export const FullWidth: Story = { args: { fullWidth: true } }

/* ---------- Sizes & Shapes ---------- */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex gap-3 items-center">
      <Button {...args} size="xs">XS</Button>
      <Button {...args} size="sm">SM</Button>
      <Button {...args} size="md">MD</Button>
      <Button {...args} size="lg">LG</Button>
      <Button {...args} size="xl">XL</Button>
    </div>
  ),
  args: { variant: 'primary' },
}
export const Shapes: Story = {
  render: (args) => (
    <div className="flex gap-3 items-center">
      <Button {...args} shape="pill">Pill</Button>
      <Button {...args} shape="rounded">Rounded</Button>
      <Button {...args} iconOnly shape="square" aria-label="Settings">
        <Icon />
      </Button>
    </div>
  ),
  args: { variant: 'secondary' },
}

/* ---------- Links ---------- */
export const InternalLink: Story = {
  args: { href: '/pricing', children: 'Go to Pricing' },
}
export const ExternalLink: Story = {
  args: { href: 'https://example.com', external: true, children: 'Open Docs' },
}

/* ---------- Tone Matrix (quick visual QA) ---------- */
const variants: Array<React.ComponentProps<typeof Button>['variant']> =
  ['primary', 'secondary', 'accent', 'outline', 'soft', 'ghost', 'link']
const tones: Array<React.ComponentProps<typeof Button>['tone']> =
  ['primary', 'secondary', 'accent', 'success', 'warning', 'danger']

export const Matrix: Story = {
  render: () => (
    <div className="space-y-5">
      {variants.map((v) => (
        <div key={v} className="space-y-2">
          <div className="text-sm opacity-70">variant: {v}</div>
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <Button key={`${v}-${t}`} variant={v} tone={t}>
                {v === 'link' ? `Link • ${t}` : `${t}`}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  args: {},
}

/* ---------- Dark Mode Preview (optional) ---------- */
export const DarkModePreview: Story = {
  render: (args) => (
    <div className="dark bg-dark text-white p-6 rounded-ds-2xl">
      <div className="mb-3 text-sm opacity-70">Dark mode container</div>
      <div className="flex gap-3 flex-wrap">
        <Button {...args} variant="primary">Primary</Button>
        <Button {...args} variant="accent">Accent</Button>
        <Button {...args} variant="outline" tone="neonGreen" />
      </div>
    </div>
  ),
  args: { children: 'Button' },
}
