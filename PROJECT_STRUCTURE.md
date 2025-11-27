# BatesTading Vision - Project Structure

## Architecture Hiérarchique

```
swingtrade-pro/
├── 📁 electron/
│   ├── main.js              # Electron main process (ESM)
│   └── preload.cjs          # Secure IPC bridge
│
├── 📁 src/                  # React application source
│   ├── 📁 styles/           # CSS modules (centralized styling)
│   │   ├── dark-neocore.css       # Core theme (liquid glass, typography)
│   │   └── dashboard-insane.css   # Advanced dashboard effects
│   │
│   ├── 📁 assets/           # Images, icons, static files
│   ├── App.jsx              # Root component with all views
│   ├── main.jsx             # React DOM entry point
│   └── index.css            # Base Tailwind + globals
│
├── 📁 public/               # Static public assets
├── 📄 package.json          # Dependencies & scripts
├── 📄 vite.config.js        # Vite build configuration
├── 📄 tailwind.config.js    # Tailwind CSS config
├── 📄 postcss.config.js     # PostCSS configuration
└── 📄 eslint.config.js      # ESLint configuration
```

## Module System
- **Main Process**: ESM (ECMAScript Modules)
- **Renderer**: React with Vite + ESM
- **Package.json**: `"type": "module"`

## Components & Views

### Dashboard Section (Right Side)
- `<Dashboard />` - Main stats & metrics
- `<Trading />` - Journal (table/gallery view)
- `<Analysis />` - Performance & setup analysis
- `<MacroEdge />` - Economic calendar & indicators
- `<Psychology />` - Discipline & emotion tracking
- `<TradingPlan />` - Daily routine & rules

### Navigation (Left Sidebar)
- Dynamic nav-item styling with hover states
- Active state management
- Icon + label display

## Key Design Patterns

### Styling Architecture
1. **CSS Variables** (dark-neocore.css)
   - Color palette
   - Typography settings
   - Glass effect parameters
   - Shadows & glows

2. **Liquid Glass System** (.u-card class)
   - Backdrop blur with saturation
   - Subtle inset shadows
   - Gradient overlays
   - Hover animations

3. **Dashboard Effects** (dashboard-insane.css)
   - Radial gradient backgrounds
   - Accent lines
   - Shimmer effects
   - Glow pulse animations

### Class Naming Convention
- `.u-card` - Universal glass card
- `.dashboard-section` - Main content area
- `.stat-card` - Individual stat display
- `.chart-container` - Chart wrapper
- `.section-title` - Section headers
- `.nav-item` - Navigation items

## Performance Optimizations
- CSS backdrop-filter for GPU acceleration
- Minimal JavaScript animations
- Responsive grid layouts
- Optimized border/shadow rendering

## Future Improvements
- Extract components (Dashboard.jsx, Trading.jsx, etc.)
- Create hooks for state management (useTrading, useMacroEvents, etc.)
- Implement context API for global state
- Add unit tests
- Create utility functions module
- Implement error boundaries
- Add PWA support
