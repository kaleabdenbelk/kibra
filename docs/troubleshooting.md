# 🩹 Troubleshooting

Running into a snag? Don't worry, we've got you covered. Here are the most common issues and how to fix them.

---

## 🏗️ Configuration Issues

### "kibra.json not found"
**Symptoms:** Commands like `add` or `list` fail with a configuration error.
**Fix:** Run `npx kibra init` in your project root to create your configuration file.

### Alias Conflicts
**Symptoms:** Imports in added components look like `@/lib/utils` but your project uses a different path.
**Fix:** Update your `kibra.json` with the correct aliases:
```json
{
  "aliases": {
    "utils": "src/lib/utils",
    "components": "src/components/ui"
  }
}
```

---

## 💅 Styling Issues

### Tailwind styles aren't applying
**Symptoms:** Components appear without styling or with basic defaults.
**Fix:** 
1. Ensure `nativewind` and `tailwindcss` are installed.
2. Check your `tailwind.config.js` to ensure Kibra's component paths are included in the `content` array:
```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  // ...
};
```

---

## 📦 Dependency Issues

### "Module not found" after installation
**Symptoms:** You ran `kibra add`, but the app crashes saying a module (e.g. `react-native-reanimated`) is missing.
**Fix:** Sometimes package managers need a kick. Try:
- **npm**: `npm install`
- **pnpm**: `pnpm install`
- **expo**: `npx expo install --fix`

---

## 🛠️ CLI Crashes

### Permission Denied
**Symptoms:** CLI fails to write files to your project.
**Fix:** Ensure you have write permissions to the directory. Avoid running with `sudo` as it can corrupt your `node_modules` permissions.

### Update Notice won't go away
**Symptoms:** CLI keeps telling you to update even after you have.
**Fix:** Kibra caches update checks for 24 hours. You can force a fresh check by clearing your global npm cache, or simply wait for the cache to expire.

---

## 🆘 Still Need Help?
- **GitHub Issues**: Report bugs or request features at [github.com/user/kibra/issues](https://github.com/user/kibra/issues).
- **Discord**: Join our community for real-time support.
