import fs from 'node:fs/promises';
import path from 'node:path';
import {args,requireArgs,loadPackage,writeNew,handleCliErrors} from './runtime.mjs';

handleCliErrors();
const o=args();
if(o.help){console.log('inspect_deck.mjs --deck deck.pptx --out new-inspection-folder [--slides 1,3,5] [--scale 1]');process.exit(0);}
requireArgs(o,['deck','out']);
const dir=path.resolve(o.out);
try{await fs.access(dir);throw new Error(`Inspection folder already exists: ${dir}`);}catch(e){if(e.code!=='ENOENT')throw e;}
const {FileBlob,PresentationFile}=await loadPackage('@oai/artifact-tool');
const p=await PresentationFile.importPptx(await FileBlob.load(path.resolve(o.deck)));
const selected=o.slides?String(o.slides).split(',').map(v=>Number(v)-1):p.slides.items.map((_,i)=>i);
if(selected.some(i=>!Number.isInteger(i)||!p.slides.items[i]))throw new Error('Invalid 1-based --slides list.');
const scale=Number(o.scale??1);
if(!Number.isFinite(scale)||scale<=0||scale>4)throw new Error('Scale must be >0 and <=4.');
await fs.mkdir(dir,{recursive:true});
await writeNew(path.join(dir,'presentation.proto.json'),JSON.stringify(p.toProto(),null,2));
const inspection=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style']});
await writeNew(path.join(dir,'inspection.ndjson'),inspection.ndjson);
const notes=p.slides.items.map((s,i)=>({slide:i+1,hidden:s.hidden,notes:s.speakerNotes.text}));
await writeNew(path.join(dir,'notes.json'),JSON.stringify(notes,null,2));
const {createCanvas,loadImage}=await loadPackage('@napi-rs/canvas');
const thumbs=[];
for(const i of selected){
  const slide=p.slides.items[i], stem=`slide-${String(i+1).padStart(2,'0')}`;
  const png=new Uint8Array(await(await p.export({slide,format:'png',scale})).arrayBuffer());
  await writeNew(path.join(dir,`${stem}.png`),png);
  await writeNew(path.join(dir,`${stem}.layout.json`),await(await slide.export({format:'layout'})).text());
  thumbs.push({i,img:await loadImage(Buffer.from(png))});
}
const cols=Math.min(3,thumbs.length),tw=400,th=Math.round(tw*p.slides.items[0].frame.height/p.slides.items[0].frame.width),g=20,label=28;
const canvas=createCanvas(cols*(tw+g)+g,Math.ceil(thumbs.length/cols)*(th+label+g)+g),ctx=canvas.getContext('2d');
ctx.fillStyle='#e9edf3';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='18px sans-serif';
for(const[k,t]of thumbs.entries()){const x=g+(k%cols)*(tw+g),y=g+Math.floor(k/cols)*(th+label+g);ctx.fillStyle='#21376A';ctx.fillText(`${t.i+1}${p.slides.items[t.i].hidden?' (hidden)':''}`,x,y+20);ctx.drawImage(t.img,x,y+label,tw,th);}
await writeNew(path.join(dir,'contact-sheet.png'),canvas.toBuffer('image/png'));
console.log(JSON.stringify({folder:dir,rendered:selected.length,total:p.slides.items.length}));
