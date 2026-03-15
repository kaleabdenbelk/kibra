#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

const program = new Command();

async function runNativeWindSetup(projectPath: string) {
  console.log(chalk.blue(`\n🎨 Setting up NativeWind in: ${chalk.bold(projectPath)}`));

  try {
    // 1. Install Dependencies
    console.log(chalk.cyan('\n📦 Installing NativeWind, Tailwind CSS, and Expo Symbols...'));
    await execa('pnpm', ['add', 'nativewind@latest', 'tailwindcss@3.4.1', 'react-native-reanimated', 'react-native-safe-area-context', 'expo-symbols'], { 
      cwd: projectPath,
      stdio: 'inherit' 
    });
    await execa('pnpm', ['add', '-D', 'babel-preset-expo'], { 
      cwd: projectPath,
      stdio: 'inherit' 
    });

    // 2. Create tailwind.config.js
    console.log(chalk.cyan('\n📄 Creating tailwind.config.js...'));
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
    console.log(chalk.cyan('\n📄 Creating global.css...'));
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
    console.log(chalk.cyan('\n🔧 Updating metro.config.js...'));
    const metroConfigPath = path.join(projectPath, 'metro.config.js');
    const metroConfigContent = `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });`;
    await fs.writeFile(metroConfigPath, metroConfigContent);

    // 6. Fresh Start: Empty Folders
    console.log(chalk.cyan('\n🧹 Resetting components, constants, and app folders...'));
    await fs.emptyDir(path.join(projectPath, 'components'));
    await fs.emptyDir(path.join(projectPath, 'constants'));
    await fs.emptyDir(path.join(projectPath, 'app'));

    // 7. Inject Base Templates
    console.log(chalk.cyan('\n📄 Injecting new base templates...'));
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
    const indexContent = `import { Text, View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { SymbolView } from "expo-symbols";

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
        <SymbolView 
          name={colorScheme === "dark" ? "sun.max.fill" : "moon.fill"} 
          size={32}
          tintColor={colorScheme === "dark" ? "#eab308" : "#084baf"}
        />
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

    console.log(chalk.green('\n✨ Reset and NativeWind setup complete!'));
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

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupNativeWind',
        message: 'Do you want to setup NativeWind (Tailwind CSS) automatically?',
        default: true
      }
    ]);

    console.log(chalk.blue(`\n🚀 Creating a new Expo project in: ${chalk.bold(projectPath)}`));

    try {
      // 1. Git Initialization
      console.log(chalk.cyan('\n📦 Initializing Git repository...'));
      await execa('git', ['init', projectName], { stdio: 'inherit' });
      console.log(chalk.green('✔ Git repository initialized.'));

      // 2. Expo App Creation
      console.log(chalk.cyan('\n📱 Creating Expo app using pnpm...'));
      await execa('pnpx', ['create-expo-app', projectName, '--template', 'tabs', '--no-install'], { 
        stdio: 'inherit',
        env: { ...process.env, NPM_CONFIG_YES: 'true' } 
      });

      // 3. Optional NativeWind Setup
      if (answers.setupNativeWind) {
        await runNativeWindSetup(projectPath);
      }
      
      console.log(chalk.green(`\n✨ Project ${chalk.bold(projectName)} created successfully.`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log(`  pnpm run start -c`);

    } catch (error: any) {
      console.error(chalk.red('\n❌ Error during project creation:'));
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command('setup-nativewind')
  .description('Setup NativeWind in the current Expo project')
  .action(async () => {
    await runNativeWindSetup(process.cwd());
  });

program.parse(process.argv);
