# 👋 Getting Started with Kibra

Welcome! We're so excited to help you build your next Expo masterpiece. Kibra is designed to be the fastest, most reliable way to ship high-quality UI in React Native.

## 🚀 Quick Start (60 Seconds)

If you have an existing Expo project, run:

```bash
npx kibra init
npx kibra add button
```

If you're starting from scratch:

```bash
npx kibra create my-new-app
```

---

## 🛠️ Requirements

Before you begin, ensure you have the following installed:
- **Node.js 20+**
- **Expo SDK 50+**
- **NativeWind v4** (Kibra handles this automatically in `create` mode!)

---

## 📖 Step-by-Step Tutorial

### 1. Initialize your project
Kibra needs a `kibra.json` file to know where to place your components and how to map your aliases.

```bash
npx kibra init
```
This will create a default configuration:
- `components`: mapped to `@/components/ui`
- `utils`: mapped to `@/lib/utils`

### 2. Browse the Showroom
Visit the [Kibra Showroom](https://user.github.io/kibra) to see all available components.

### 3. Add your first component
Let's add a Button:

```bash
npx kibra add button
```
**What happens behind the scenes?**
1. Kibra fetches the component metadata from our registry.
2. It detects required NPM dependencies (like `class-variance-authority`).
3. It installs them using your preferred package manager.
4. It writes the component file to your project, automatically updating imports to match your project's aliases.

### 4. Start building
Import your new component and start building your UI:

```tsx
import { Button } from "@/components/ui/button";

export default function HomeScreen() {
  return (
    <Button label="Hello Kibra!" onPress={() => console.log("Pressed!")} />
  );
}
```

---

## 💡 Pro Tips
- **Dry Run**: Curious what `add` will do? Use `npx kibra add button --dry-run`.
- **Minimal Mode**: Use `npx kibra create --template minimal` for a bare-bones setup.

Next Up: Check out the [Command Reference](./commands.md) for a deep dive into every flag!
