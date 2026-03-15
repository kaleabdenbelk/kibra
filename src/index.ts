#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { confirm, select } from '@inquirer/prompts';

const program = new Command();

async function runNativeWindSetup(projectPath: string, packageManager?: string, iconLibrary: string = 'expo-symbols') {
  console.log(chalk.blue(`\n Setting up NativeWind and Icons in: ${chalk.bold(projectPath)}`));

  try {
    // 1. Install Dependencies (only if not handled by a consolidated pass)
    if (packageManager && packageManager !== 'none') {
      console.log(chalk.cyan(`\n Installing dependencies using ${packageManager}...`));
      const installCmd = packageManager === 'npm' ? 'install' : (packageManager === 'yarn' || packageManager === 'bun' ? 'add' : 'add');
      
      const deps = ['nativewind@latest', 'tailwindcss@3.4.1', 'react-native-reanimated', 'react-native-safe-area-context'];
      if (iconLibrary === 'lucide') {
        deps.push('lucide-react-native', 'react-native-svg');
      } else {
        deps.push('expo-symbols');
      }

      await execa(packageManager, [installCmd, ...deps], { 
        cwd: projectPath,
        stdio: 'inherit' 
      });
      await execa(packageManager, [installCmd, '-D', 'babel-preset-expo'], { 
        cwd: projectPath,
        stdio: 'inherit' 
      });
    }

    // 2. Create tailwind.config.js
    console.log(chalk.cyan('\n Creating tailwind.config.js...'));
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#084baf",
      },
    },
  },
  plugins: [],
};`;
    await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);

    // 3. Create global.css
    console.log(chalk.cyan('\n Creating global.css...'));
    const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    await fs.writeFile(path.join(projectPath, 'global.css'), globalCss);

    // 4. Update or Create babel.config.js
    console.log(chalk.cyan('\n🔧 Updating/Creating babel.config.js...'));
    const babelConfigPath = path.join(projectPath, 'babel.config.js');
    if (await fs.pathExists(babelConfigPath)) {
      let content = await fs.readFile(babelConfigPath, 'utf8');
      if (!content.includes('nativewind/babel')) {
        if (content.includes('plugins: [')) {
          content = content.replace(
            /plugins: \[(.*)\]/,
            (match, p1) => `plugins: [${p1 ? p1 + (p1.trim().endsWith(',') ? ' ' : ', ') : ''}"nativewind/babel"]`
          );
        } else if (content.includes('return {')) {
          content = content.replace(
            /return \{/,
            'return {\n    plugins: ["nativewind/babel"],'
          );
        }
        await fs.writeFile(babelConfigPath, content);
      }
    } else {
      const babelConfigContent = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};`;
      await fs.writeFile(babelConfigPath, babelConfigContent);
    }

    // 5. Update metro.config.js
    console.log(chalk.cyan('\n Updating metro.config.js...'));
    const metroConfigPath = path.join(projectPath, 'metro.config.js');
    const metroConfigContent = `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });`;
    await fs.writeFile(metroConfigPath, metroConfigContent);

    // 6. Fresh Start: Empty Folders
    console.log(chalk.cyan('\n Resetting components, constants, and app folders...'));
    await fs.emptyDir(path.join(projectPath, 'components'));
    await fs.emptyDir(path.join(projectPath, 'constants'));
    await fs.emptyDir(path.join(projectPath, 'app'));

    // 7. Inject Base Templates
    console.log(chalk.cyan('\n Injecting new base templates...'));
    const appPath = path.join(projectPath, 'app');

    // app/_layout.tsx
    const layoutContent = `import "../global.css";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
      </Stack>
    </ThemeProvider>
  );
}`;
    await fs.writeFile(path.join(appPath, '_layout.tsx'), layoutContent);

    // app/index.tsx
    const isLucide = iconLibrary === 'lucide';
    const indexContent = `import { Text, View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
${isLucide ? 'import { Sun, Moon } from "lucide-react-native";' : 'import { SymbolView } from "expo-symbols";'}

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-2xl font-bold text-primary dark:text-white mb-8">
        Welcome to Compo
      </Text>
      
      <Pressable 
        onPress={toggleColorScheme}
        className="w-16 h-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
      >
        ${isLucide 
          ? `{colorScheme === "dark" 
            ? <Sun size={32} color="#eab308" /> 
            : <Moon size={32} color="#084baf" />}`
          : `<SymbolView 
          name={colorScheme === "dark" ? "sun.max.fill" : "moon.fill"} 
          size={32}
          tintColor={colorScheme === "dark" ? "#eab308" : "#084baf"}
        />`
        }
      </Pressable>
      
      <Text className="mt-4 text-slate-500 dark:text-slate-400">
        Toggle {colorScheme === "dark" ? "Light" : "Dark"} Mode
      </Text>
    </View>
  );
}`;
    await fs.writeFile(path.join(appPath, 'index.tsx'), indexContent);

    // app/+html.tsx
    const htmlContent = `import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = \`
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}\`;`;
    await fs.writeFile(path.join(appPath, '+html.tsx'), htmlContent);

    // app/+not-found.tsx
    const notFoundContent = `import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-primary">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}`;
    await fs.writeFile(path.join(appPath, '+not-found.tsx'), notFoundContent);

    console.log(chalk.green('\n Reset and NativeWind setup complete!'));
  } catch (error: any) {
    console.error(chalk.red('\n❌ Error during setup:'));
    console.error(error.message);
  }
}

program
  .name('expo-setup')
  .description('A CLI to setup Expo projects with NativeWind, Icons, and Theming')
  .version('1.0.0');

program
  .command('create <project-name>')
  .description('Create a new Expo project')
  .action(async (projectName) => {
    const projectPath = path.resolve(process.cwd(), projectName);

    const setupNativeWind = await confirm({
      message: 'Do you want to setup NativeWind (Tailwind CSS) automatically?',
      default: true
    });

    const iconLibrary = await select({
      message: 'Which icon library do you want to use?',
      choices: [
        { value: 'expo-symbols', name: 'Expo Symbols (Best for native iOS feel)' },
        { value: 'lucide', name: 'Lucide Icons (Best for cross-platform)' }
      ],
      default: 'expo-symbols'
    });

    const packageManager = await select({
      message: 'Which package manager do you want to use?',
      choices: [
        { value: 'pnpm', name: 'pnpm' },
        { value: 'npm', name: 'npm' },
        { value: 'yarn', name: 'yarn' },
        { value: 'bun', name: 'bun' },
        { value: 'none', name: 'None (Skip Installation)' }
      ],
      default: 'pnpm'
    });

    console.log(chalk.blue(`\n Creating a new Expo project in: ${chalk.bold(projectPath)}`));

    try {
      // 1. Git Initialization
      console.log(chalk.cyan('\nInitializing Git repository...'));
      await execa('git', ['init', projectName], { stdio: 'inherit' });
      console.log(chalk.green('✔ Git repository initialized.'));

      // 2. Expo App Creation (No Install)
      console.log(chalk.cyan(`\n Creating Expo app using ${packageManager} (no-install)...`));
      
      const effectivePM = packageManager === 'none' ? 'npm' : packageManager;
      const createCmd = effectivePM === 'pnpm' ? 'pnpx' : (effectivePM === 'bun' ? 'bunx' : 'npx');
      
      await execa(createCmd, ['create-expo-app', projectName, '--template', 'tabs', '--no-install'], { 
        stdio: 'inherit',
        env: { ...process.env, NPM_CONFIG_YES: 'true' } 
      });

      // 3. Optional NativeWind Setup
      if (setupNativeWind) {
        await runNativeWindSetup(projectPath, 'none', iconLibrary); // Don't run install here
      }

      // 4. Update package.json with extra dependencies
      console.log(chalk.cyan('\n Injecting extra dependencies into package.json...'));
      const pkgPath = path.join(projectPath, 'package.json');
      const pkg = await fs.readJson(pkgPath);
      
      const extraDeps: Record<string, string> = {
        "nativewind": "latest",
        "tailwindcss": "3.4.1",
        "react-native-reanimated": "^3.16.1",
        "react-native-safe-area-context": "4.12.0"
      };

      if (iconLibrary === 'lucide') {
        extraDeps["lucide-react-native"] = "latest";
        extraDeps["react-native-svg"] = "latest";
      } else {
        extraDeps["expo-symbols"] = "latest";
      }

      pkg.dependencies = {
        ...pkg.dependencies,
        ...extraDeps
      };
      
      pkg.devDependencies = {
        ...pkg.devDependencies,
        "babel-preset-expo": "^12.0.0"
      };

      await fs.writeJson(pkgPath, pkg, { spaces: 2 });

      // 5. Final Consolidated Installation
      if (packageManager !== 'none') {
        console.log(chalk.cyan(`\n Running final installation with ${packageManager}...`));
        await execa(packageManager, ['install'], { 
          cwd: projectPath,
          stdio: 'inherit' 
        });
        
        console.log(chalk.green(`\n Project ${chalk.bold(projectName)} created successfully.`));
        console.log(chalk.yellow('\nNext steps:'));
        console.log(`  cd ${projectName}`);
        console.log(`  ${packageManager} run start -c`);
      } else {
        console.log(chalk.green(`\n Project ${chalk.bold(projectName)} setup complete (skipping installation).`));
        console.log(chalk.yellow('\nNext steps:'));
        console.log(`  cd ${projectName}`);
        console.log('  [Install dependencies manually]');
        console.log('  npm run start -c');
      }

    } catch (error: any) {
      console.error(chalk.red('\n Error during project creation:'));
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command('setup-nativewind')
  .description('Setup NativeWind in the current Expo project')
  .action(async () => {
    const iconLibrary = await select({
      message: 'Which icon library do you want to use?',
      choices: [
        { value: 'expo-symbols', name: 'Expo Symbols' },
        { value: 'lucide', name: 'Lucide Icons' }
      ],
      default: 'expo-symbols'
    });

    const packageManager = await select({
      message: 'Which package manager do you want to use for installation?',
      choices: [
        { value: 'pnpm', name: 'pnpm' },
        { value: 'npm', name: 'npm' },
        { value: 'yarn', name: 'yarn' },
        { value: 'bun', name: 'bun' },
        { value: 'none', name: 'None (Skip Installation)' }
      ],
      default: 'pnpm'
    });
    await runNativeWindSetup(process.cwd(), packageManager, iconLibrary);
  });

program.parse(process.argv);
