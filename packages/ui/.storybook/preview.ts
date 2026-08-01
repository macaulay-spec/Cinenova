import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'CineNova void',
      values: [{ name: 'CineNova void', value: '#05070b' }],
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
