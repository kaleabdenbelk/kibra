# 🫐 Kibra

[![CI](https://github.com/user/kibra/actions/workflows/ci.yml/badge.svg)](https://github.com/user/kibra/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Showroom](https://img.shields.io/badge/View-Showroom-blueviolet)](https://user.github.io/kibra)

**The fastest way to build native-first Expo apps.** Kibra provides pre-styled, customizable components and automated setup for NativeWind (Tailwind CSS) in Expo.

## Features

- 🏎️ **Instant Setup**: Initialize a production-ready Expo project with NativeWind in seconds.
- 🧩 **Component Registry**: Add high-quality components (Button, Card, Input) with a single command.
- 🛂 **Absolute Aliases**: Automatically handles `@/components/ui` and `@/lib/utils` aliasing.
- 🌓 **Dark Mode Ready**: All templates and components support native dark mode out of the box.
- 🏗️ **Extensible**: Build and use your own component registries.

## Installation

```bash
# Initialize a new project
npx create-kibra-app@latest my-new-app
```

## CLI Commands

### `kibra create <project-name>`
Creates a new Expo project with NativeWind, Icons, and basic structure pre-configured.
- **Flags**: 
  - `--latest`: Use the latest versions of dependencies instead of pinned stable versions.

### `kibra add <component>`
Adds a component from the registry to your project.
- **Example**: `kibra add button`
- **Options**:
  - `-r, --registry <url>`: Specify a custom registry URL or local path.

### `kibra init`
Initializes a `kibra.json` configuration file in an existing project to customize alias locations and registries.

### `kibra list`
Lists all available components in the configured registries.

## Configuration (`kibra.json`)

```json
{
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils"
  },
  "registries": {
    "default": "https://ui.kibra.dev/registry"
  }
}
```

## Why Kibra?

Building with Expo is great, but setting up NativeWind, reanimated, and a consistent UI library takes time. Kibra automates the "boring stuff" and provides a CLI-first workflow inspired by shadcn/ui but built specifically for React Native.

---
Built with 🫐 by the Kibra Team.
