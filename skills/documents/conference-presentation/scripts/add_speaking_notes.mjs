import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {args,requireArgs,loadPackage,readJson,handleCliErrors} from './runtime.mjs';
import {createKit} from './slide-kit.mjs';

handleCliErrors();
const o=args();
if(o.help){console.log('add_speaking_notes.mjs --deck approved.pptx --notes speaking-notes.json --out new-with-notes.pptx');process.exit(0);}
requireArgs(o,['deck','notes','out']);
const data=await readJson(path.resolve(o.notes));
if(data.slidesApproved!==true)throw new Error('Final slide approval must be recorded as slidesApproved: true before writing speaking notes.');
if(!Array.isArray(data.slides)||!data.slides.length)throw new Error('Provide a nonempty slides array with 1-based slide numbers and speaking notes.');
const out=path.resolve(o.out);
try{await fs.access(out);throw new Error(`Output already exists: ${out}`);}catch(e){if(e.code!=='ENOENT')throw e;}
const {FileBlob,PresentationFile}=await loadPackage('@oai/artifact-tool');
const p=await PresentationFile.importPptx(await FileBlob.load(path.resolve(o.deck)));
const seen=new Set();
for(const entry of data.slides){
  if(!Number.isInteger(entry.slide)||!p.slides.items[entry.slide-1]||seen.has(entry.slide))throw new Error(`Invalid or repeated 1-based slide number: ${entry.slide}`);
  seen.add(entry.slide);
}
function visualContent(proto){
  const copy=JSON.parse(JSON.stringify(proto));
  delete copy.id;
  for(const slide of copy.slides){delete slide.notes;delete slide.notesSlide;}
  function clean(value){
    if(!value||typeof value!=='object')return;
    delete value.creationId;delete value.relId;
    if(value.bulletCharacter==='')delete value.bulletCharacter;
    for(const child of Object.values(value))clean(child);
  }
  clean(copy);return copy;
}
const before=visualContent(p.toProto());
const expectedNotes=p.slides.items.map(slide=>slide.speakerNotes.text);
const kit=createKit(p);
for(const entry of data.slides){
  const slide=p.slides.items[entry.slide-1];
  const sources=entry.sources??slide.speakerNotes.text.match(/(?:^|\n\n)Sources\n([\s\S]*)$/)?.[1]??[];
  kit.notes(slide,{...entry,sources},{slidesApproved:true});
  expectedNotes[entry.slide-1]=slide.speakerNotes.text;
}
assert.deepEqual(visualContent(p.toProto()),before,'Adding notes must preserve the approved presentation content and design.');
await fs.mkdir(path.dirname(out),{recursive:true});
const staging=await fs.mkdtemp(path.join(path.dirname(out),'.speaking-notes-'));
const candidate=path.join(staging,'candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
const imported=await PresentationFile.importPptx(await FileBlob.load(candidate));
assert.deepEqual(visualContent(imported.toProto()),before,'PPTX export changed approved presentation content or design.');
assert.deepEqual(imported.slides.items.map(slide=>slide.speakerNotes.text),expectedNotes,'PPTX export changed the speaking notes.');
await fs.copyFile(candidate,out,fs.constants.COPYFILE_EXCL);
await fs.rm(staging,{recursive:true,force:true});
console.log(JSON.stringify({candidate:out,updatedSlides:[...seen],totalSlides:imported.slides.items.length,approvedSlideContentPreserved:true}));
