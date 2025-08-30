import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  framework: { name: '@storybook/react', options: {} },
  stories: [
    '../design-system/**/*.stories.@(ts|tsx|mdx)',
    '../components/**/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-viewport',
    '@storybook/addon-actions',
    '@storybook/addon-backgrounds',
    '@storybook/addon-toolbars',
  ],
  docs: { autodocs: 'tag' },
};

export default config;
