import path from 'node:path';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {args,requireArgs,readJson,handleCliErrors} from './runtime.mjs';

handleCliErrors();
const o=args();
if(o.help){console.log('finalize_deck.mjs --config finalization.json (see references/production-workflow.md)');process.exit(0);}
requireArgs(o,['config']);
const filename=path.resolve(o.config),base=path.dirname(filename),q=await readJson(filename);
for(const key of ['workspaceDir','candidatePath','finalPath','pythonExecutable','presentationSkillDir','receiptPath']){
  if(typeof q[key]!=='string')throw new Error(`Missing config field: ${key}`);
  q[key]=path.resolve(base,q[key]);
}
if(typeof q.expectedSlideSizeEmu!=='string'||!/^\d+,\d+$/.test(q.expectedSlideSizeEmu))throw new Error('Provide expectedSlideSizeEmu from the inspected template, e.g. "12192000,6858000".');
const {finalizePresentation}=await import(pathToFileURL(path.join(q.presentationSkillDir,'container_tools/artifact_tool_utils.mjs')).href);
const {presentationSkillDir,expectedSlideSizeEmu,...config}=q;
await fs.mkdir(path.dirname(q.finalPath),{recursive:true});
await fs.mkdir(path.dirname(q.receiptPath),{recursive:true});
const result=await finalizePresentation({...config,
  integrityValidatorPath:path.join(presentationSkillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(presentationSkillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu',expectedSlideSizeEmu,'--validate-bullet-geometry','--validate-heading-fit',...(q.layoutArgs??[])],
  requiredNativeTableOwnerSlides:q.requiredNativeTableOwnerSlides??[],
  requiredNativeChartOwnerSlides:q.requiredNativeChartOwnerSlides??[],
  verifyArtifactToolImport:true});
console.log(JSON.stringify(result));
