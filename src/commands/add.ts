import chalk from 'chalk';
import { fsUtils } from '../utils/fs.js';
import { runCommand } from '../utils/exec.js';
import { prompts } from '../utils/prompts.js';
import { COMPONENT_TEMPLATES, UTILS_TEMPLATE } from '../templates.js';

export async function addComponent(componentName: string) {
  const template = COMPONENT_TEMPLATES[componentName.toLowerCase()];
  if (!template) {
    console.error(chalk.red(`\n Error: Component "${componentName}" not found.`));
    console.log(chalk.yellow('Available components:'), Object.keys(COMPONENT_TEMPLATES).join(', '));
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const componentsDir = fsUtils.join(projectRoot, 'components');
  const libDir = fsUtils.join(projectRoot, 'lib');

  try {
    // 1. Ensure components directory exists
    await fsUtils.ensureDir(componentsDir);

    // 2. Ensure lib/utils.ts exists
    const utilsPath = fsUtils.join(projectRoot, UTILS_TEMPLATE.filename);
    if (!(await fsUtils.pathExists(utilsPath))) {
      await fsUtils.ensureDir(libDir);
      await fsUtils.writeFile(utilsPath, UTILS_TEMPLATE.content);
      console.log(chalk.green(`\n ✔ Created ${UTILS_TEMPLATE.filename}`));

      const pkgPath = fsUtils.join(projectRoot, 'package.json');
      if (await fsUtils.pathExists(pkgPath)) {
        console.log(chalk.cyan('   Installing utility dependencies (clsx, tailwind-merge, class-variance-authority)...'));
        const pkg = await fsUtils.readJson(pkgPath);
        const pm = pkg.packageManager ? pkg.packageManager.split('@')[0] : 'npm';
        const installCmd = pm === 'npm' ? 'install' : 'add';
        
        await runCommand(pm, [installCmd, 'clsx', 'tailwind-merge', 'class-variance-authority'], { cwd: projectRoot });
      }
    }

    // 3. Write component file
    const componentPath = fsUtils.join(componentsDir, template.filename);
    if (await fsUtils.pathExists(componentPath)) {
      const overwrite = await prompts.confirm({
        message: `Component "${template.filename}" already exists. Overwrite?`,
        default: false
      });
      if (!overwrite) {
        console.log(chalk.yellow('\n Aborted.'));
        return;
      }
    }

    await fsUtils.writeFile(componentPath, template.content);
    console.log(chalk.green(`\n ✔ Added ${template.filename} to components/`));
  } catch (error: any) {
    console.error(chalk.red(`\n Error adding component: ${error.message}`));
  }
}
