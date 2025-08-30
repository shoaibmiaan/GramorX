import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  stories: ['../design-system/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react', options: {} },
  docs: { autodocs: 'tag' },
};
export default config;
