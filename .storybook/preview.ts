import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
    viewport: { defaultViewport: 'responsive' },
    backgrounds: { default: 'light' },
  },
};
export default preview;
