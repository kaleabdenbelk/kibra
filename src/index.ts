#!/usr/bin/env node
import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { runNativeWindSetup } from './commands/setup.js';
import { addComponent } from './commands/add.js';
import { prompts } from './utils/prompts.js';

const program = new Command();

program
  .name('kibra')
  .description('The fastest way to build native-first Expo apps with NativeWind, Icons, and Kibra Theming')
  .version('1.0.0');

program
  .command('create <project-name>', { isDefault: true })
  .alias('init')
  .description('Create a new Expo project')
  .action(createProject);

program
  .command('setup-nativewind')
  .description('Setup NativeWind in the current Expo project')
  .action(async () => {
    const iconLibrary = await prompts.select({
      message: 'Which icon library do you want to use?',
      choices: [
        { value: 'expo-symbols', name: 'Expo Symbols' },
        { value: 'lucide', name: 'Lucide Icons' }
      ],
      default: 'expo-symbols'
    });

    const packageManager = await prompts.select({
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

program
  .command('add <component>')
  .description('Add a new component to your project')
  .action(addComponent);

program.parse(process.argv);
