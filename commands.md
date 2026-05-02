# 🛠️ Command Reference

Master the Kibra CLI with this comprehensive guide to every command, flag, and option.

---

## `kibra create <name>`
The primary entry point for new projects.

| Flag | Alpha | Description |
| :--- | :---: | :--- |
| `-t, --template` | `minimal` \| `full` | Choose a project starter template. |
| `-c, --clean` | Boolean | Skip pre-installing baseline components (`button`, `utils`). |
| `-n, --no-icons` | Boolean | Skip icon library installation entirely. |

**Example:**
```bash
npx kibra create awesome-app --template full --clean
```

---

## `kibra add <component>`
Adds a component from the registry to your local project.

| Flag | Type | Description |
| :--- | :---: | :--- |
| `-r, --registry` | URL \| Path | Use a custom registry URL or local folder. |
| `-d, --dry-run` | Boolean | Preview file changes and dependency installs without writing. |

**Component Aliases:**
You can target specific registries using the `alias/name` syntax:
```bash
npx kibra add my-custom-reg/special-card
```

---

## `kibra init`
Generates a `kibra.json` configuration file in your current directory. Use this to retrofit Kibra into an existing Expo project.

---

## `kibra list`
Fetches and displays all available components in the registry.

| Flag | Type | Description |
| :--- | :---: | :--- |
| `-r, --registry` | URL \| Path | List components from a specific registry. |

---

## `kibra setup-nativewind`
An interactive guide to setting up NativeWind v4, Tailwind CSS, and your preferred icon library in any Expo project. Use this if you already have a project but want the Kibra styling engine.

---

## `kibra build`
*(Developer Only)* Used to build the JSON registry metadata from a directory of source files.

| Flag | Type | Description |
| :--- | :---: | :--- |
| `-i, --input` | Path | Directory containing component source files. |
| `-o, --output` | Path | Directory to output the JSON artifacts. |

---

## Global Options
- `-V, --version`: Output the current version of Kibra.
- `-h, --help`: Display help for any command.
