import type { Preview } from '@storybook/react';
import '../styles/globals.css';
import '../styles/themes/index.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
};
export default preview;
