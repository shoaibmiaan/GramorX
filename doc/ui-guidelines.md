# UI Guidelines

This project uses design tokens to ensure visual consistency across all components.

## Color and typography utilities
- **Avoid raw Tailwind color classes** (e.g. `text-gray-600`, `text-red-600`).
- Use tokenized utilities instead:
  - `text-body` for default copy
  - `text-mutedText` for subdued text
  - `text-primary`, `text-secondary`, etc. for brand colors
  - `text-error` for error states
- Background and border colors follow the same pattern (`bg-primary`, `border-lightBorder`, ...).

## Tokens outside Tailwind
Color variables are exported in [`styles/tokens.css`](../styles/tokens.css). Import this file or its
variables in non‑Tailwind contexts to access the same palette.

```html
<link rel="stylesheet" href="/styles/tokens.css" />
```

These CSS variables power both the Tailwind utilities and any external stylesheets.
