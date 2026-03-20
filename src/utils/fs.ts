import fs from 'fs-extra';
import path from 'path';

export const fsUtils = {
  writeFile: fs.writeFile,
  readFile: fs.readFile,
  readJson: fs.readJson,
  writeJson: fs.writeJson,
  ensureDir: fs.ensureDir,
  emptyDir: fs.emptyDir,
  pathExists: fs.pathExists,
  resolve: path.resolve,
  join: path.join
};
