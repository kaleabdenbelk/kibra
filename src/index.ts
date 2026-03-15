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
    console.log(chalk.cyan('\n📦 Installing NativeWind and Tailwind CSS...'));
    await execa('pnpm', ['add', 'nativewind@latest', 'tailwindcss@3.4.1', 'react-native-reanimated', 'react-native-safe-area-context'], { 
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
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
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
        } else {
          console.log(chalk.yellow('⚠️ Could not find plugins array in babel.config.js, skipping auto-injection.'));
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

    // 6. Update app/_layout.tsx
    console.log(chalk.cyan('\n🔧 Updating app/_layout.tsx...'));
    const layoutPath = path.join(projectPath, 'app', '_layout.tsx');
    if (await fs.pathExists(layoutPath)) {
      let content = await fs.readFile(layoutPath, 'utf8');
      if (!content.includes('../global.css')) {
        content = `import "../global.css";\n` + content;
        await fs.writeFile(layoutPath, content);
      }
    }

    // 7. Fix Themed Components (for Tabs template)
    console.log(chalk.cyan('\n🔧 Patching components/Themed.tsx for NativeWind...'));
    const themedPath = path.join(projectPath, 'components', 'Themed.tsx');
    if (await fs.pathExists(themedPath)) {
      let content = await fs.readFile(themedPath, 'utf8');
      if (!content.includes('nativewind')) {
        content = `import { cssInterop } from "nativewind";\n` + content;
        const lastImportIndex = content.lastIndexOf('import');
        const endOfImportLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfImportLine + 1) + 
                  `\ncssInterop(DefaultText, { className: "style" });\ncssInterop(DefaultView, { className: "style" });\n` + 
                  content.slice(endOfImportLine + 1);
        await fs.writeFile(themedPath, content);
      }
    }

    // 8. Cleanup duplicate .js files
    console.log(chalk.cyan('\n🧹 Cleaning up duplicate .js files...'));
    const appDir = path.join(projectPath, 'app');
    if (await fs.pathExists(appDir)) {
      const files = await fs.readdir(appDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const tsxFile = file.replace('.js', '.tsx');
          if (files.includes(tsxFile)) {
            await fs.remove(path.join(appDir, file));
          }
        }
      }
    }

    console.log(chalk.green('\n✨ NativeWind setup complete!'));
  } catch (error: any) {
    console.error(chalk.red('\n❌ Error during NativeWind setup:'));
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
      await execa('pnpx', ['create-expo-app', projectName, '--template', 'tabs'], { 
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
