import chalk from 'chalk';
import path from 'path';
import { fsUtils } from '../utils/fs.js';
import { runCommand } from '../utils/exec.js';
import { prompts } from '../utils/prompts.js';
import { runNativeWindSetup } from './setup.js';

export async function createProject(projectName: string) {
  const projectPath = fsUtils.resolve(process.cwd(), projectName);

  const setupNativeWind = await prompts.confirm({
    message: 'Do you want to setup NativeWind (Tailwind CSS) automatically?',
    default: true
  });

  const iconLibrary = await prompts.select({
    message: 'Which icon library do you want to use?',
    choices: [
      { value: 'expo-symbols', name: 'Expo Symbols (Best for native iOS feel)' },
      { value: 'lucide', name: 'Lucide Icons (Best for cross-platform)' }
    ],
    default: 'expo-symbols'
  });

  const packageManager = await prompts.select({
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
    console.log(chalk.cyan('\n Initializing Git repository...'));
    await runCommand('git', ['init', projectName]);

    // 2. Expo App Creation
    console.log(chalk.cyan(`\n Creating Expo app using ${packageManager} (no-install)...`));
    const effectivePM = packageManager === 'none' ? 'npm' : packageManager;
    const createCmd = effectivePM === 'pnpm' ? 'pnpx' : (effectivePM === 'bun' ? 'bunx' : 'npx');
    
    await runCommand(createCmd, ['create-expo-app', projectName, '--template', 'tabs', '--no-install'], {
      env: { ...process.env, NPM_CONFIG_YES: 'true' }
    });

    // 3. Optional NativeWind Setup
    if (setupNativeWind) {
      await runNativeWindSetup(projectPath, 'none', iconLibrary);
    }

    // 4. Inject Dependencies
    console.log(chalk.cyan('\n Injecting dependencies into package.json...'));
    const pkgPath = fsUtils.join(projectPath, 'package.json');
    const pkg = await fsUtils.readJson(pkgPath);
    
    const extraDeps: Record<string, string> = {
      "nativewind": "latest",
      "tailwindcss": "3.4.1",
      "react-native-reanimated": "^3.16.1",
      "react-native-safe-area-context": "^5.4.0",
      "react-native-screens": "~4.24.0",
      "react-native-gesture-handler": "~2.21.2"
    };

    if (iconLibrary === 'lucide') {
      extraDeps["lucide-react-native"] = "latest";
      extraDeps["react-native-svg"] = "latest";
    } else {
      extraDeps["expo-symbols"] = "latest";
    }

    pkg.dependencies = { ...pkg.dependencies, ...extraDeps };
    pkg.devDependencies = { ...pkg.devDependencies, "babel-preset-expo": "^12.0.0" };

    await fsUtils.writeJson(pkgPath, pkg, { spaces: 2 });

    // 5. Final Installation
    if (packageManager !== 'none') {
      console.log(chalk.cyan(`\n Running final installation with ${packageManager}...`));
      await runCommand(packageManager, ['install'], { cwd: projectPath });
      
      console.log(chalk.green(`\n Project ${chalk.bold(projectName)} created successfully.`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log(`  ${packageManager} run start -c`);
      console.log(chalk.cyan('\nTo add components later:'));
      console.log(`  npx kibra add button`);
      console.log(chalk.dim(' (Note: Link first with "npm link" in the CLI directory for the best experience)'));
    } else {
      console.log(chalk.green(`\n Project ${chalk.bold(projectName)} setup complete (skipping installation).`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log('  [Install dependencies manually]');
      console.log('  npm run start -c');
    }
  } catch (error: any) {
    console.error(chalk.red(`\n Error during project creation: ${error.message}`));
    process.exit(1);
  }
}
