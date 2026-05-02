# 🤝 Contributing to Kibra

First off, thank you for considering contributing to Kibra! It's people like you that make the open-source community such a wonderful place to build.

## 🚀 How to Help

There are many ways to contribute:
- **Bug Reports**: If you find a bug, please open an issue. Be as detailed as possible and include steps to reproduce.
- **Feature Requests**: Have an idea for a killer feature? Let's hear it!
- **Code**: Submit a PR to fix a bug or add a component to the registry.
- **Documentation**: Spot a typo or have a better way to explain something? Documentation PRs are highly valued!

---

## 🛠️ Development Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/user/kibra.git
   cd kibra
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Link CLI for testing**:
   ```bash
   npm link
   ```
   Now you can run the `kibra` command anywhere on your system to test your local changes.

4. **Build the Registry**:
   ```bash
   npm run build-registry
   ```

---

## 🏗️ Pull Request Process

1. **Branching**: Create a new branch for your feature or fix.
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Linting & Formatting**: We use Biome. Ensure your code passes:
   ```bash
   npm run lint
   npm run format
   ```
3. **Testing**: Add or update tests as needed. Ensure existing tests pass:
   ```bash
   npm test
   ```
4. **Committing**: Use clear, descriptive commit messages.

---

## 📖 Code Style
- **TypeScript**: Use it everywhere. No `any` unless absolutely necessary.
- **Dumb Components**: UI components should be mostly stateless and focus on presentation.
- **A11y**: Never skip accessibility props.

---

## 📜 Code of Conduct
We follow the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

Thank you for building the future of Expo with us! 🫐
