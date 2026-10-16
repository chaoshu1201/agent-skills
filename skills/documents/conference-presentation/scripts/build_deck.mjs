import fs from 'node:fs/promises';
import path from 'node:path';
import {args, requireArgs, loadPackage, readJson, handleCliErrors} from './runtime.mjs';
import {createKit} from './slide-kit.mjs';

handleCliErrors();
const o=args();
if(o.help){console.log('build_deck.mjs --spec project/deck-spec.json --out project/.build/candidate.pptx');process.exit(0);}
requireArgs(o,['spec','out']);
const specPath=path.resolve(o.spec), base=path.dirname(specPath);
const spec=await readJson(specPath);
if(!Array.isArray(spec.slides)||!spec.slides.length)throw new Error('spec.slides must be a nonempty array.');
const out=path.resolve(o.out);
try{await fs.access(out);throw new Error(`Output already exists: ${out}`);}catch(e){if(e.code!=='ENOENT')throw e;}
const {FileBlob,Presentation,PresentationFile}=await loadPackage('@oai/artifact-tool');
let p=await PresentationFile.importPptx(await FileBlob.load(path.resolve(base,spec.template)));
const source=[...p.slides.items], generated=[];
for(const q of spec.slides){
  const templateIndex=q.templateSlide??(q.role==='cover'?spec.coverTemplateSlide??1:spec.contentTemplateSlide??2);
  if(!Number.isInteger(templateIndex)||!source[templateIndex-1])throw new Error(`Invalid 1-based template slide ${templateIndex}`);
  const s=source[templateIndex-1].duplicate();
  s.moveTo(p.slides.items.length-1);
  generated.push(s);
  for(const name of q.removeTemplateElements??[]){
    const found=[...s.shapes.items,...s.images.items].filter(e=>e.name===name);
    if(!found.length)throw new Error(`Template element name not found: ${name}`);
    for(const e of found)e.delete();
  }
}
// Discard template samples only after duplication preserves layouts and images.
p.slides.keep(generated.map(s=>p.slides.items.findIndex(current=>current.id===s.id)));
const kit=createKit(p,spec.style??{});
for(const [index,q]of spec.slides.entries()){
  const slide=p.slides.items[index], named=new Map();
  slide.hidden=q.hidden??false;
  if(q.subtitle)kit.resultsHeader(slide,q.subtitle,{title:q.title});
  else if(q.title)kit.heading(slide,q.title,q.titleOptions);
  if(q.closing)kit.closing(slide,q.closing);
  if(q.pageNumber!==false&&(q.pageNumber!==undefined||spec.pageNumbers&&q.role!=='cover'))kit.pageNumber(slide,q.pageNumber??index+1,spec.pageNumberOptions);
  for(const [i,element]of(q.elements??[]).entries()){
    const e={name:`element-${i+1}`,...element};
    if(named.has(e.name))throw new Error(`Duplicate element name: ${e.name}`);
    let shape;
    switch(e.type){
      case 'text':shape=kit.text(slide,e.text,e.x,e.y,e.w,e.h,{...e.options,name:e.name});break;
      case 'bullets':shape=kit.bullets(slide,e.items,e.x,e.y,e.w,e.h,{...e.options,name:e.name});break;
      case 'card':shape=kit.card(slide,e);break;
      case 'stat':kit.stat(slide,e);break;
      case 'diagramBox':shape=kit.diagramBox(slide,e);break;
      case 'picture':shape=await kit.picture(slide,{...e,file:path.resolve(base,e.file)});break;
      case 'contribution':kit.contribution(slide,e);break;
      default:throw new Error(`Unknown element type: ${e.type}`);
    }
    if(shape)named.set(e.name,shape);
  }
  for(const c of q.connections??[]){
    if(!named.has(c.from)||!named.has(c.to))throw new Error(`Connector endpoint missing: ${c.from} -> ${c.to}`);
    kit.connect(slide,named.get(c.from),named.get(c.to),c);
  }
  kit.notes(slide,q.notes,{slidesApproved:spec.slidesApproved===true});
}
p=kit.materialize(Presentation);
await fs.mkdir(path.dirname(out),{recursive:true});
await(await PresentationFile.exportPptx(p)).save(out);
const imported=await PresentationFile.importPptx(await FileBlob.load(out));
if(imported.slides.items.length!==spec.slides.length)throw new Error('Exported slide count changed.');
for(const[i,q]of spec.slides.entries())if(imported.slides.items[i].hidden!==!!q.hidden)throw new Error(`Hidden flag changed on slide ${i+1}`);
console.log(JSON.stringify({candidate:out,slides:imported.slides.items.length,template:path.resolve(base,spec.template)}));
