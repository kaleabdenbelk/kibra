import { execa } from 'execa';

export async function runCommand(command: string, args: string[], options = {}) {
  return execa(command, args, { 
    stdio: 'inherit',
    ...options
  });
}
