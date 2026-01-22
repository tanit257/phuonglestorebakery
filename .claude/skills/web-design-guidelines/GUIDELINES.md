# Web Interface Guidelines - Complete Rules

## Core Rules

### Accessibility
- Icon-only buttons: `aria-label` required
- Form controls: `<label>` or `aria-label` mandatory
- Interactive elements: keyboard handlers (`onKeyDown`/`onKeyUp`)
- Semantic HTML: `<button>` for actions, `<a>`/`<Link>` for navigation
- Images: `alt` text (or `alt=""` if decorative)
- Decorative icons: `aria-hidden="true"`
- Async updates: `aria-live="polite"`
- Headings: hierarchical `<h1>`–`<h6>` with skip links
- Anchor headings: `scroll-margin-top`

### Focus States
- Visible focus required: `focus-visible:ring-*`
- Never `outline-none` without focus replacement
- Prefer `:focus-visible` over `:focus`
- Group focus with `:focus-within`

### Forms
- Inputs: `autocomplete` and meaningful `name`
- Correct input `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- No paste blocking
- Clickable labels via `htmlFor` or wrapping
- Disable spellcheck on emails/codes/usernames
- Checkboxes/radios: single hit target
- Submit button enabled until request; spinner during
- Inline errors; focus first error on submit
- Placeholders end with `…`
- `autocomplete="off"` on non-auth fields
- Warn before unsaved navigation

### Animation
- Honor `prefers-reduced-motion`
- Animate `transform`/`opacity` only
- Never `transition: all`
- Correct `transform-origin`
- SVG: `transform-box: fill-box; transform-origin: center`
- Interruptible animations

### Typography
- Ellipsis: `…` not `...`
- Curly quotes: `"` `"` not straight
- Non-breaking spaces for measurements/brand names
- Loading states: `"Loading…"`
- `font-variant-numeric: tabular-nums` for numbers
- `text-wrap: balance` or `text-pretty` on headings

### Content Handling
- Text containers: `truncate`, `line-clamp-*`, `break-words`
- Flex children: `min-w-0` for text truncation
- Handle empty states
- Anticipate short/average/very long inputs

### Images
- `<img>`: explicit `width` and `height`
- Below-fold: `loading="lazy"`
- Above-fold critical: `priority` or `fetchpriority="high"`

### Performance
- Large lists (>50): virtualize
- No layout reads in render
- Batch DOM reads/writes
- Prefer uncontrolled inputs
- `<link rel="preconnect">` for CDNs
- Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

### Navigation & State
- URL reflects state (filters, tabs, pagination, panels)
- Links use `<a>`/`<Link>` for multi-click support
- Deep-link stateful UI
- Destructive actions need confirmation

### Touch & Interaction
- `touch-action: manipulation`
- `-webkit-tap-highlight-color` intentional
- `overscroll-behavior: contain` in modals/drawers
- Disable text selection during drag
- Minimal `autoFocus`

### Safe Areas & Layout
- Full-bleed: `env(safe-area-inset-*)`
- Manage scrollbars via `overflow-x-hidden`
- Flex/grid over JS measurement

### Dark Mode & Theming
- `color-scheme: dark` on `<html>`
- `<meta name="theme-color">` matches background
- Native `<select>`: explicit colors

### Locale & i18n
- Dates/times: `Intl.DateTimeFormat`
- Numbers/currency: `Intl.NumberFormat`
- Language detection via `Accept-Language`/`navigator.languages`

### Hydration Safety
- `value` inputs need `onChange`
- Guard date/time rendering mismatches
- Minimal `suppressHydrationWarning`

### Hover & States
- Buttons/links: `hover:` states
- Interactive states increase contrast

### Content & Copy
- Active voice
- Title Case for headings/buttons
- Numerals for counts
- Specific button labels
- Error messages with fixes
- Second person
- `&` over "and" when space-constrained

## Anti-patterns to Flag
- `user-scalable=no` or `maximum-scale=1`
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without replacement
- Inline `onClick` navigation
- `<div>`/`<span>` with click handlers
- Images without dimensions
- Large unvirtualized arrays
- Unlabeled form inputs
- Icon buttons without `aria-label`
- Hardcoded formats
- Unjustified `autoFocus`

## Output Format
Group by file using `file:line` format. Terse, signal-focused findings.
