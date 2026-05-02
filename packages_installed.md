# Packages Installed by Kibra CLI

This document lists all packages installed when you create a new project using `kibra create`.

## 📦 Base Expo Template (Tabs)
The following packages are part of the standard Expo `tabs` template:

| Package | Purpose |
| :--- | :--- |
| `expo` | Core Expo framework |
| `expo-router` | File-based routing system |
| `react-native` | The underlying framework |
| `@react-navigation/native` | Navigation primitives |
| `expo-constants` | Access to system constants |
| `expo-font` | Custom font support |
| `expo-linking` | Deep linking support |
| `expo-splash-screen` | Control over the app splash screen |
| `expo-status-bar` | Control over the device status bar |
| `expo-web-browser` | Open web pages in-app |
| `react` / `react-dom` | React core libraries |
| `react-native-web` | Support for web platform |

## 🚀 Kibra Injections
These packages are added by Kibra to enable NativeWind, high-performance animations, and icons:

| Package | Purpose | Source |
| :--- | :--- | :--- |
| `nativewind` | Tailwind CSS for React Native | Kibra |
| `tailwindcss` | Build-time styling utility | Kibra |
| `react-native-reanimated` | **Required** engine for NativeWind 4 animations | Kibra |
| `react-native-worklets` | Required by Reanimated 4 (latest) | Kibra |
| `react-native-safe-area-context` | Essential for layout and NativeWind | Both* |
| `react-native-screens` | Essential for navigation performance | Both* |
| `expo-symbols` | Premium SF Symbols wrapper (if selected) | Kibra |
| `lucide-react-native` | Cross-platform icon library (if selected) | Kibra |

*\* These packages may already exist in the Expo template but are explicitly updated/ensured by Kibra to match NativeWind 4 requirements.*

## 🔍 Discovery
You can explore available components using the `list` command:
```bash
kibra list
```
To list from a custom registry:
```bash
kibra list --registry ./my-registry
```

## 🧹 Minimalist Approach
Kibra aims to keep the project as lean as possible. We have recently removed:
- `react-native-gesture-handler`: Removed from default injection to keep the initialization minimal. It can be added later if needed.

## 🛡️ Long-term Stability
To avoid future dependency conflicts (e.g. from `latest` versions):
1. **Expo SDK Alignment**: The CLI uses `npx expo install` where possible to ensure packages match your current Expo SDK version.
2. **Registry Constraints**: Components fetched via `kibra add` include dependency requirements defined in the registry, allowing for version pinning independent of the CLI code.

