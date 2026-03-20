# Kibra

The fastest way to build native-first Expo apps with NativeWind, Icons, and Kibra Theming.

## Commands

### `create <project-name>` (alias: `init`)

Create a new Expo project from scratch. You can also run it without the `create` keyword: `npx create-kibra-app my-new-app`.

**Actions performed:**
1.  **Git Initialization**: Runs `git init <project-name>`.
2.  **Package Manager Selection**: Prompts to choose between `pnpm`, `npm`, `yarn`, or `bun`.
3.  **Expo App Creation**: Runs `create-expo-app` with `--no-install` to save time.
4.  **Automatic Setup**: Prompts to automatically run `setup-nativewind`.
5.  **Consolidated Installation**: Performs a single installation pass at the end, including all NativeWind and icon dependencies.

---

### `setup-nativewind`

Configure NativeWind (Tailwind CSS) in an existing Expo project.

---

### `add <component>`

Add a pre-styled component to your project. Available components: `button`, `card`, `input`.

**Actions performed:**
1.  **Ensure Directories**: Creates `components/` and `lib/` if they don't exist.
2.  **Add Utility**: Creates `lib/utils.ts` and installs `clsx`, `tailwind-merge`, and `class-variance-authority` if they are missing.
3.  **Inject Component**: Injects the component file into your `components/` folder.

---

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
# Initialize a new project (shorthand)
npx create-kibra-app my-new-app

# Or explicitly create it
npx create-kibra-app create my-new-app

# Add a component (Button, Card, Input)
npx kibra add button
npx kibra add card

# Configure NativeWind in an existing project
npx kibra setup-nativewind
```
