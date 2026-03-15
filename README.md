# Compo

A CLI tool to setup Expo projects with NativeWind, Icons, and Theming.

## Commands

### `create <project-name>`

Create a new Expo project from scratch.

**Actions performed:**
1.  **Git Initialization**: Runs `git init <project-name>`.
2.  **Expo App Creation**: Runs `pnpx create-expo-app <project-name> --template tabs`.
3.  **Automatic Setup**: Prompts to automatically run `setup-nativewind`.

---

### `setup-nativewind`

Configure NativeWind (Tailwind CSS) in an existing Expo project.

#### 📦 Dependencies Installed
- `nativewind@latest`
- `tailwindcss@3.4.1`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `expo-symbols`
- `babel-preset-expo` (Dev Dependency)

#### 🧹 Fresh Start (Folders Cleared)
Before setup, the CLI **empties** the following directories to remove default Expo template boilerplate:
- `components/`
- `constants/`
- `app/`

#### 📄 Created Files
- `tailwind.config.js`: Configured with `nativewind/preset` and custom `primary` color.
- `global.css`: Initialized with `@tailwind` directives.
- `metro.config.js`: Configured using `withNativeWind`.
- `app/_layout.tsx`: Root layout with `ThemeProvider` and Dark Mode support.
- `app/index.tsx`: Home screen with a Dark Mode toggle (using `expo-symbols`).
- `app/+html.tsx`: Web-specific root configuration.
- `app/+not-found.tsx`: Clean 404 page.

#### 🔧 Edited Files
- `babel.config.js`: Injects `nativewind/babel` plugin.


## Usage

```bash
# Run via pnpm
pnpm run dev create my-new-app

# Or setup in current directory
pnpm run dev setup-nativewind
```
