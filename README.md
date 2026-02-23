# Xtension

A modern browser extension template built with WXT framework, React 19, and TypeScript. This extension provides a robust foundation for cross-browser development with modern tooling and best practices.

## Tech Stack

- **WXT Framework** - Modern web extension framework
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable UI components built with Radix UI
- **pnpm** - Fast, disk space efficient package manager
- **Lucide React** - Beautiful & consistent icon library

## Features

- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Modern React 19 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Background scripts and content scripts
- Popup interface
- Hot module replacement for development
- Built-in permissions management

## Prerequisites

- Node.js 16+ or 18+ recommended
- pnpm (recommended) or npm

## Setup Instructions

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd Xtension
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

    Or with npm:

    ```bash
    npm install
    ```

3. **Configure the extension**

    Edit `wxt.config.ts` to customize your extension:

    ```typescript
    manifest: {
      name: "Your Extension Name",
      description: "Your extension description",
      version: "1.0.0"
    }
    ```

## Development

### Start development server

```bash
# For Chrome/Chromium
pnpm dev

# For Firefox
pnpm dev:firefox
```

### Load extension in browser

**Chrome/Edge:**

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` directory

**Firefox:**

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` from `.output/firefox-mv2` directory

## Build for Production

```bash
# Build for Chrome/Chromium
pnpm build

# Build for Firefox
pnpm build:firefox

# Create distribution zip
pnpm zip
pnpm zip:firefox
```

## Project Structure

```
src/
├── entrypoints/          # Extension entry points
│   ├── background/       # Background scripts
│   ├── content/          # Content scripts
│   ├── popup/           # Extension popup
│   └── *.css            # Global styles
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## Scripts

- `pnpm dev` - Start development server (Chrome)
- `pnpm dev:firefox` - Start development server (Firefox)
- `pnpm build` - Build for production (Chrome)
- `pnpm build:firefox` - Build for production (Firefox)
- `pnpm zip` - Create distribution zip (Chrome)
- `pnpm zip:firefox` - Create distribution zip (Firefox)
- `pnpm compile` - Type check without emitting

## Extension Permissions

The extension includes the following permissions:

- `storage` - Local/sync storage access
- `scripting` - Script injection capabilities
- `tabs` - Tab information access
- `contextMenus` - Context menu integration
- `activeTab` - Active tab access

## Customization

### Adding Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

### Styling

Tailwind CSS is configured with custom design tokens. Global styles are in `src/entrypoints/global.css`.

### Adding New Entry Points

Create new entry points in `src/entrypoints/` following WXT conventions:

- Background scripts: `background/`
- Content scripts: `content/`
- Popup/Options pages: `popup/`, `options/`

## Browser Support

- Chrome 88+
- Firefox 109+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `pnpm compile`
5. Test in both Chrome and Firefox
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [WXT Documentation](https://wxt.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Web Extensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
