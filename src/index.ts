#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('expo-setup')
  .description('A CLI to setup Expo projects with NativeWind, Icons, and Theming')
  .version('1.0.0');

program
  .command('create <project-name>')
  .description('Create a new Expo project')
  .action(async (projectName) => {
    const projectPath = path.resolve(process.cwd(), projectName);

    console.log(chalk.blue(`\n🚀 Creating a new Expo project in: ${chalk.bold(projectPath)}`));

    try {
      // 1. Git Initialization
      console.log(chalk.cyan('\n📦 Initializing Git repository...'));
      await execa('git', ['init', projectName], { stdio: 'inherit' });
      console.log(chalk.green('✔ Git repository initialized.'));

      // 2. Expo App Creation
      console.log(chalk.cyan('\n📱 Creating Expo app using pnpm...'));
      // User wants 'tabs' template instead of 'blank'
      await execa('pnpx', ['create-expo-app', projectName, '--template', 'tabs'], { 
        stdio: 'inherit',
        env: { ...process.env, NPM_CONFIG_YES: 'true' } 
      });
      
      console.log(chalk.green(`\n✨ Phase 1 complete! Project ${chalk.bold(projectName)} created successfully.`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log(`  npx compo setup-nativewind (Coming in Phase 2)`);

    } catch (error: any) {
      console.error(chalk.red('\n❌ Error during project creation:'));
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
