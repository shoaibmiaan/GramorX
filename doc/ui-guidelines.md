# UI Guidelines

## Design tokens
- Use tokenized Tailwind utilities for color and typography (e.g., `text-primary`, `text-mutedText`, `bg-card`).
- Avoid raw color names like `text-gray-600` or `bg-white`; tokens ensure theme parity.

## Shared tokens for non-Tailwind usage
- CSS variables for tokens live in `styles/tokens.css`.
- Import this file in non-Tailwind contexts:
  ```css
  @import '../styles/tokens.css';
  ```
- Dark mode is toggled by adding the `.dark` class to the root element; variables update automatically.

## Components
- All design-system components rely on tokens. When extending components, prefer token utilities over raw colors.
- For background and border colors use utilities like `bg-card`, `bg-primary`, `border-border`.
