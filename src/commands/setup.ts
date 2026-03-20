import chalk from 'chalk';
import { fsUtils } from '../utils/fs.js';
import { runCommand } from '../utils/exec.js';
import { BASE_TEMPLATES } from '../templates/bases.js';

export async function runNativeWindSetup(projectPath: string, packageManager?: string, iconLibrary: string = 'expo-symbols') {
  console.log(chalk.blue(`\n Setting up NativeWind and Icons in: ${chalk.bold(projectPath)}`));

  try {
    // 1. Install Dependencies
    if (packageManager && packageManager !== 'none') {
      console.log(chalk.cyan(`\n Installing dependencies using ${packageManager}...`));
      const installCmd = packageManager === 'npm' ? 'install' : 'add';
      
      const deps = [
        'nativewind@latest', 
        'tailwindcss@3.4.1', 
        'react-native-reanimated', 
        'react-native-safe-area-context',
        'react-native-screens',
        'react-native-gesture-handler'
      ];
      if (iconLibrary === 'lucide') {
        deps.push('lucide-react-native', 'react-native-svg');
      } else {
        deps.push('expo-symbols');
      }

      await runCommand(packageManager, [installCmd, ...deps], { cwd: projectPath });
      await runCommand(packageManager, [installCmd, '-D', 'babel-preset-expo'], { cwd: projectPath });
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
    await fsUtils.writeFile(fsUtils.join(projectPath, 'tailwind.config.js'), tailwindConfig);

    // 3. Create global.css
    console.log(chalk.cyan('\n Creating global.css...'));
    const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    await fsUtils.writeFile(fsUtils.join(projectPath, 'global.css'), globalCss);

    // 4. Babel Config
    console.log(chalk.cyan('\n🔧 Updating/Creating babel.config.js...'));
    const babelConfigPath = fsUtils.join(projectPath, 'babel.config.js');
    if (await fsUtils.pathExists(babelConfigPath)) {
      let content = await fsUtils.readFile(babelConfigPath, 'utf8');
      if (!content.includes('nativewind/babel')) {
        if (content.includes('plugins: [')) {
          content = content.replace(/plugins: \[(.*)\]/, (match, p1) => `plugins: [${p1 ? p1 + (p1.trim().endsWith(',') ? ' ' : ', ') : ''}"nativewind/babel"]`);
        } else if (content.includes('return {')) {
          content = content.replace(/return \{/, 'return {\n    plugins: ["nativewind/babel"],');
        }
        await fsUtils.writeFile(babelConfigPath, content);
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
      await fsUtils.writeFile(babelConfigPath, babelConfigContent);
    }

    // 5. Metro Config
    console.log(chalk.cyan('\n Updating metro.config.js...'));
    const metroConfigPath = fsUtils.join(projectPath, 'metro.config.js');
    const metroConfigContent = `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });`;
    await fsUtils.writeFile(metroConfigPath, metroConfigContent);

    // 6. Project Structure
    console.log(chalk.cyan('\n Resetting folders and creating structure...'));
    const folders = ['components', 'constants', 'app', 'hooks', 'lib', 'types'];
    for (const folder of folders) {
      const folderPath = fsUtils.join(projectPath, folder);
      await fsUtils.emptyDir(folderPath);
    }

    // 7. Base Templates
    console.log(chalk.cyan('\n Injecting premium base templates...'));
    const appPath = fsUtils.join(projectPath, 'app');
    const isLucide = iconLibrary === 'lucide';

    await fsUtils.writeFile(fsUtils.join(appPath, '_layout.tsx'), BASE_TEMPLATES.layout('colorScheme'));
    await fsUtils.writeFile(fsUtils.join(appPath, 'index.tsx'), BASE_TEMPLATES.index(isLucide));
    await fsUtils.writeFile(fsUtils.join(appPath, '+html.tsx'), BASE_TEMPLATES.html);
    await fsUtils.writeFile(fsUtils.join(appPath, '+not-found.tsx'), BASE_TEMPLATES.notFound);

    console.log(chalk.green('\n Reset and NativeWind setup complete!'));
  } catch (error: any) {
    console.error(chalk.red(`\n Error during setup: ${error.message}`));
  }
}
