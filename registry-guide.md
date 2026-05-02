## 🚀 Quick Start: Your First Registry

Let's build a registry from scratch. 

### 1. Structure your components
Create a folder named `my-ui` and add a button:
```bash
mkdir -p my-ui/ui
# Create a component in my-ui/ui/my-btn.tsx
```

### 2. Run the Kibra Builder
You don't need to install a separate tool. The builder is part of the `kibra` CLI:

```bash
npx kibra build --input ./my-ui --output ./dist-registry
```

**Check the result:**
Look inside `./dist-registry/my-btn.json`. You'll see that Kibra has automatically:
- Detected all your `import` statements.
- Listed your NPM dependencies.
- Packaged your source code into a JSON string.

### 3. Go Live
Upload that `./dist-registry` folder to **GitHub Pages**, **Vercel**, or even a **shared Dropbox folder**. 

**Your users can now do this:**
```bash
npx kibra add my-btn --registry https://your-hosted-url.com
```

---

## 🏗️ How it Works (The Protocol)
Kibra uses a standardized folder structure to detect component types:

```
/my-collection
  /ui       # Standard UI components (Button, Card, etc.)
  /lib      # Shared logic and utilities
  /hooks    # Custom React hooks
```

### Important: Use Alias Tokens
To ensure your components work in *any* user project, use our **Alias Tokens** in your source code:

- `{{UTILS_ALIAS}}`: Resolves to the user's local utilities path.
- `{{COMPONENTS_ALIAS}}`: Resolves to the user's local components path.

**Example:**
```tsx
import { cn } from "{{UTILS_ALIAS}}";
import { Button } from "{{COMPONENTS_ALIAS}}/button";
```

---

## 2. Generating the Registry
Once your components are ready, use the Kibra CLI to build the metadata. 

**Example Build Command:**
```bash
npx kibra build --input ./my-collection --output ./public-registry
```

**What this does:**
- Scans all files recursively.
- Uses **AST Analysis** to detect NPM dependencies automatically.
- Generates an `index.json` and individual `[component].json` files.

---

## 3. Hosting & Distribution
Upload the contents of your `./public-registry` folder to any static host. 

### How users install from you:
Provide your registry URL to your users. They can install your components in two ways:

#### A. Direct Flag
```bash
npx kibra add button --registry https://ui.your-brand.com
```

#### B. Permanent Configuration
Users can add your registry to their `kibra.json`:
```json
{
  "registries": {
    "mine": "https://ui.your-brand.com"
  }
}
```
Then they can use your alias: `npx kibra add mine/button`.

---

## 📋 Registry Checklist
- [ ] **NativeWind Ready**: Components use `cn` and Tailwind classes.
- [ ] **A11y Compliant**: Includes `accessibilityRole` and `accessibilityLabel`.
- [ ] **Tokenized Imports**: All internal imports use `{{UTILS_ALIAS}}` or `{{COMPONENTS_ALIAS}}`.
- [ ] **Standalone**: Components don't rely on hidden global providers.
