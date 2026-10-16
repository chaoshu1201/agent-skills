import fs from 'node:fs/promises';
import path from 'node:path';
import {skillRoot, readJson} from './runtime.mjs';

export const profile = await readJson(path.join(skillRoot,'assets/style-profile.json'));
const primitives = await readJson(path.join(skillRoot,'assets/native-shapes.json'));
export const ptToPx = pt => pt*4/3;
export const pxToEmu = px => Math.round(px*9525);
const shortWords = new Set('a an the and or but nor for so yet as at by in of on to up via with from into onto over per than vs off out'.split(' '));
const known = ['GenAI','AI','LLM','LLMs','CoT','Q&A','API','PDF','PPTX','GSM8K'];
export function titleCase(text, {everyWord=false, preserve=[]}={}) {
  const spellings=new Map([...known,...preserve].map(v=>[v.toLowerCase(),v]));
  let first=true, afterColon=false;
  return text.replace(/[A-Za-z][A-Za-z0-9]*(?:[’'][A-Za-z]+)?|:/g, word=>{
    if(word===':'){afterColon=true;return word;}
    const lower=word.toLowerCase();
    const value=spellings.get(lower) ?? (/^[A-Z0-9]{2,}$/.test(word) && word.length<=6 ? word : (!everyWord&&!first&&!afterColon&&shortWords.has(lower)?lower:word[0].toUpperCase()+word.slice(1).toLowerCase()));
    first=false;afterColon=false;return value;
  });
}

/** Geometry uses reference-canvas pixels; point sizes remain physical points. */
export function createKit(presentation, overrides={}) {
  const P=structuredClone(profile);
  for(const [key,value]of Object.entries(overrides))P[key]=value&&typeof value==='object'&&!Array.isArray(value)?{...P[key],...value}:value;
  const C=P.colours, B=P.bullet, G=P.geometry, O=P.opacity, Q=P.points;
  const frame=presentation.slides.items[0]?.frame;
  if(!frame) throw new Error('The presentation needs a slide before creating a kit.');
  const sx=frame.width/1280, sy=frame.height/720;
  const patches=new Map();
  const position=(x,y,w,h)=>({left:x*sx,top:y*sy,width:w*sx,height:h*sy});
  function text(slide,content,x,y,w,h,{name='text',size=P.points.primary,font=P.fonts.body,color=C.black,bold=false,align='left',vAlign='top',...extra}={}) {
    const s=slide.shapes.add({geometry:'textbox',name,position:position(x,y,w,h),fill:'none',line:{fill:'none',width:0}});
    s.text.style={typeface:font,fontSize:ptToPx(size),color,bold,alignment:align,verticalAlignment:vAlign,insets:0,autoFit:'none',wrap:'square',...extra};
    s.text=content; return s;
  }
  function native(slide,key,name,x,y,w,h) {
    const s=slide.shapes.add({geometry:'rect',name,position:position(x,y,w,h),fill:'none',line:{fill:'none',width:0}});
    patches.set(`${slide.id}/${s.id}`,structuredClone(primitives[key].shape));
    return s;
  }
  function bulletParagraphs(items,{size=P.points.support,character=P.bullet.character,spaceAfterPt=8}={}) {
    return items.map(item=>{
      const q=typeof item==='string'?{text:item}:item;
      const level=q.level??0;
      const itemSize=q.size??(level?Q.compact:size);
      const style={typeface:P.fonts.body,fontSize:`${itemSize}pt`,color:C.black,bold:false};
      const runs=q.runs??(q.label?[{run:q.label,style:{...style,bold:true,color:C.navy}},{run:q.text?` ${q.text}`:'',style}]:[{run:q.text??'',style}]);
      return {runs,bulletCharacter:q.character??character,marginLeft:Math.round((B.marginLeftPt+(B.nestedMarginLeftPt-B.marginLeftPt)*level)*12700),indent:-Math.round(B.hangingPt*12700),spaceAfter:Math.round((q.spaceAfterPt??spaceAfterPt)*100)};
    });
  }
  function bullets(slide,items,x,y,w,h,options={}) {
    return text(slide,bulletParagraphs(items,options),x,y,w,h,{name:options.name??'native-list',size:options.size??P.points.support});
  }
  function heading(slide,title,{x=G.titleLeft,y=G.titleTop,w=G.titleWidth,h=G.titleHeight,size=Q.title,preserve=[],...extra}={}) {
    return text(slide,titleCase(title,{preserve}),x,y,w,h,{name:'slide-title',font:P.fonts.title,size,bold:true,color:C.navy,...extra});
  }
  function resultsHeader(slide,subtitle,{title=P.resultsTitle}={}) {
    heading(slide,title);
    const bar=slide.shapes.add({geometry:'rect',name:'results-subtitle-bar',position:position(G.titleLeft,98,G.resultsBarWidthCm/2.54*96,G.resultsBarHeightCm/2.54*96),fill:C.navy,line:{fill:'none',width:0}});
    text(slide,titleCase(subtitle),G.resultsSubtitleX,G.resultsSubtitleY,1280-G.resultsSubtitleX-G.titleLeft,48,{name:'results-subtitle',size:Q.primary,bold:true,color:C.navy});
    return bar;
  }
  function card(slide,{name='card',title,body,items,x,y,w,h,headerH=70,bodyGap=14}) {
    if(h<headerH+50) throw new Error('Card needs space beneath its header.');
    const base=native(slide,'cardBody',`${name}-body`,x,y+headerH/2,w,h-headerH/2);
    native(slide,'cardHeader',`${name}-header`,x,y,w,headerH);
    // Colour overrides also update the extracted native geometry.
    patches.get(`${slide.id}/${base.id}`).fill.color.value=C.cardBody.slice(1);
    const header=slide.shapes.items.at(-1);
    patches.get(`${slide.id}/${header.id}`).fill.color.value=C.navy.slice(1);
    text(slide,titleCase(title,{everyWord:true}),x+12,y,w-24,headerH,{name:`${name}-heading`,size:Q.cardHeading,bold:true,color:C.white,align:'center',vAlign:'middle'});
    const top=y+headerH+bodyGap;
    const pad=G.cardPadding;
    if(items) bullets(slide,items,x+pad,top,w-pad*2,h-headerH-bodyGap-10,{name:`${name}-description`,size:Q.compact,spaceAfterPt:4});
    else text(slide,body??'',x+pad,top,w-pad*2,h-headerH-bodyGap-10,{name:`${name}-description`,size:Q.compact});
    return base;
  }
  function stat(slide,{name='stat',value,label,x,y,w=280,h=110,size=Q.statCompact,ruleWidth=Math.min(G.statRuleWidthPx,w),valueH=54,labelSize=Q.compact}) {
    text(slide,value,x,y,w,valueH,{name:`${name}-value`,size,bold:true,color:C.navy,align:'center',vAlign:'bottom'});
    slide.shapes.add({geometry:'line',name:`${name}-rule`,position:position(x+(w-ruleWidth)/2,y+valueH+8,ruleWidth,0),fill:'none',line:{fill:C.gold,width:G.statRuleStrokePx}});
    text(slide,label,x,y+valueH+20,w,h-valueH-20,{name:`${name}-label`,size:labelSize,color:C.navy,align:'center'});
  }
  function diagramBox(slide,{name='diagram-box',title,body,x,y,w,h,colour,role='support',opacity}) {
    colour??=(role==='central'||role==='optional'?C.orange:C.blue);
    const fillOpacity=opacity??(O[role]??O.support);
    const box=slide.shapes.add({geometry:'roundRect',name,position:position(x,y,w,h),fill:`${colour}/${fillOpacity}`,line:role==='central'?{fill:colour,width:2}:role==='optional'||role==='light'?{fill:`${colour}/${O.lightOutline}`,width:1.5}:{fill:'none',width:0}});
    text(slide,titleCase(title,{everyWord:true}),x+12,y+8,w-24,body?60:h-16,{name:`${name}-heading`,size:role==='central'?Q.primary:Q.support,bold:true,color:C.navy,align:'center',vAlign:'middle'});
    if(body)text(slide,body,x+16,y+70,w-32,h-80,{name:`${name}-description`,size:Q.compact});
    return box;
  }
  function connect(slide,from,to,{fromSide='right',toSide='left',arrow=true,dashed=false,kind='straight'}={}) {
    return slide.shapes.connect(from,to,{kind,fromSide,toSide,line:{fill:C.black,width:G.connectorWidthPx,style:dashed?'dashed':'solid'},...(arrow?{tail:{type:'triangle',width:'lg',length:'lg'}}:{})});
  }
  function contribution(slide,{name='contribution',heading:supportTitle,items,x=56,y,w=1152,h=154}) {
    const parts=['check1','check2'];
    const bounds=primitives.checkBounds;
    for(const key of parts){
      const b=primitives[key].bbox;
      const icon=native(slide,key,`${name}-${key}`,x+(b.x-bounds.x),y+(h-36)/2+(b.y-bounds.y),b.w,b.h);
      patches.get(`${slide.id}/${icon.id}`).line.fill.color.value=C.navy.slice(1);
    }
    slide.shapes.add({geometry:'line',name:`${name}-divider`,position:position(x+56,y,0,h),line:{fill:C.navy,width:4}});
    const titleRuns=[{run:supportTitle,style:{typeface:P.fonts.body,fontSize:`${Q.primary}pt`,color:C.navy,bold:true}}];
    bullets(slide,[{runs:titleRuns,character:'•'}],x+88,y+8,w-100,54,{name:`${name}-main`,size:Q.primary,spaceAfterPt:0});
    bullets(slide,items.map(q=>({...typeof q==='string'?{text:q}:q,character:'○',size:Q.support})),x+112,y+70,w-124,h-70,{name:`${name}-support`,size:Q.support,spaceAfterPt:4});
  }
  async function picture(slide,{file,x,y,w,h,name='paper-figure',alt=name}) {
    const data=await fs.readFile(file);
    const contentType={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file).toLowerCase()];
    if(!contentType)throw new Error(`Unsupported picture format ${file}; render PDF artwork with prepare_sources.py first.`);
    return slide.images.add({blob:data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),contentType,position:position(x,y,w,h),fit:'contain',name,alt});
  }
  function closing(slide,{email,acknowledgment}={}) {
    text(slide,'THANK YOU\nQ & A',100,180,1080,220,{name:'closing-thanks',size:Q.closing,color:C.closing,align:'center'});
    if(email)text(slide,email,120,410,1040,52,{name:'closing-email',font:P.fonts.title,size:Q.email,align:'center'});
    if(acknowledgment)text(slide,acknowledgment,88,620,1000,64,{name:'closing-acknowledgment',size:Q.compact});
  }
  function notes(slide,{seconds,delivery='',transition='',preparation='',sources=[]}={}, {slidesApproved=false}={}) {
    const asText=value=>Array.isArray(value)?value.join('\n'):value;
    if((delivery||transition||asText(preparation))&&!slidesApproved)throw new Error('Write speaking notes only after the user approves the finished slides. Source citations alone may be recorded earlier.');
    const blocks=[];
    if(slidesApproved){
      if(delivery)blocks.push(`Delivery Script${seconds===undefined?'':` — ${seconds} seconds`}\n${delivery}`);
      if(transition)blocks.push(`Transition\n${transition}`);
      if(asText(preparation))blocks.push(`Preparation and Q&A only\n${asText(preparation)}`);
    }
    if(asText(sources))blocks.push(`Sources\n${asText(sources)}`);
    slide.speakerNotes.text=blocks.join('\n\n');
  }
  function pageNumber(slide,number,{x=48,y=680,w=42,h=28,size=14,color='#666666'}={}) {
    return text(slide,String(number),x,y,w,h,{name:'slide-number',size,color});
  }
  function materialize(Presentation) {
    const proto=presentation.toProto();
    for(const slide of proto.slides)for(const e of slide.elements){const shape=patches.get(`${slide.id}/${e.id}`);if(shape)e.shape=shape;}
    return Presentation.load(proto);
  }
  return {text,heading,resultsHeader,bullets,bulletParagraphs,card,stat,diagramBox,connect,contribution,picture,closing,notes,pageNumber,materialize,position,profile:P};
}
