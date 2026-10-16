import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL, fileURLToPath} from 'node:url';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function loadPackage(name) {
  if (process.env.RUNTIME_NODE_MODULES) {
    const require = createRequire(path.join(path.resolve(process.env.RUNTIME_NODE_MODULES), '.conference-runtime.cjs'));
    return import(pathToFileURL(require.resolve(name)).href);
  }
  try { return await import(name); }
  catch (cause) { throw new Error(`Cannot load ${name}. Set RUNTIME_NODE_MODULES to the package directory returned by load_workspace_dependencies.`, {cause}); }
}
export const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
export async function writeNew(p, data) {
  await fs.mkdir(path.dirname(path.resolve(p)), {recursive:true});
  await fs.writeFile(p, data, {flag:'wx'});
}
export function args(argv = process.argv.slice(2)) {
  const out = {};
  for (let i=0;i<argv.length;i++) {
    if (!argv[i].startsWith('--')) throw new Error(`Expected --option, got ${argv[i]}`);
    const key=argv[i].slice(2);
    if (out[key] !== undefined) throw new Error(`Repeated option --${key}`);
    out[key]=argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}
export function requireArgs(options, names) {
  for (const name of names) if (typeof options[name] !== 'string') throw new Error(`Missing --${name}`);
}
export const isMain = url => process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === url;
export function handleCliErrors() {
  process.on('uncaughtException',error=>{console.error(error.stack??String(error));process.exitCode=1;});
  process.on('unhandledRejection',error=>{console.error(error?.stack??String(error));process.exitCode=1;});
}
