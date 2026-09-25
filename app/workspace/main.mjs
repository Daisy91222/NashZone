import './style.css';
import {validate,calculate} from '../../core/project.mjs';
import {example} from '../../core/example.mjs';
const $=id=>document.getElementById(id);
const storage='nashzone.workspace.v1';
let project=example(),result=null;
try {const saved=JSON.parse(localStorage.getItem(storage));if(saved&&!validate(saved).length)project=saved;}catch{}
const message=text=>{$('status').textContent=text;};
function invalidate(){result=null;$('result').textContent='No calculation';$('report').disabled=true;$('plan').replaceChildren();$('slice').textContent='';$('level').max=0;}
function sync(){ $('editor').value=JSON.stringify(project,null,2); }
function render(){
  $('calculate').disabled=false;
  $('save').disabled=false;$('export').disabled=false;
  invalidate();sync();$('rules').replaceChildren();$('sources').replaceChildren();$('limits').replaceChildren();
  for(const source of [...project.sources].sort((a,b)=>a.priority-b.priority)){const p=document.createElement('p');p.textContent=`${source.priority ?? '-'} / ${source.title} (${source.id})`; $('sources').append(p);}
  for(const rule of project.rules){const label=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=rule.status==='reviewed';checkbox.addEventListener('change',()=>{rule.status=checkbox.checked?'reviewed':'draft';invalidate();sync();});label.append(checkbox,document.createTextNode(`${rule.key}: ${rule.value} ${project.units} | ${rule.active?'selected':'inactive'} | ${rule.sourceId}: ${rule.reference}`));$('rules').append(label);}
  $('scenario').replaceChildren(...project.scenarios.map(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.id;return o;}));
  $('area').value=project.parameters?.minArea??10000;$('height').value=project.parameters?.floorHeight??10;
  for(const text of ['Conditional geometry, not approved development rights.',...(project.limitations??[])]){const li=document.createElement('li');li.textContent=text;$('limits').append(li);}
}
function guard(fn){return async event=>{try{await fn(event);}catch(e){message(e.message);}};}
function adopt(p){const errors=validate(p);if(errors.length)throw Error(errors.join('; '));project=p;render();}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function parameters(){return {minArea:Number($('area').value),floorHeight:Number($('height').value)};}
function draw(){
  if(!result)return;
  const level=result.levels[Number($('level').value)],points=project.parcel,xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y,pad=Math.max(w,h)*.05;
  $('plan').setAttribute('viewBox',`${x-pad} ${-y-h-pad} ${w+pad*2} ${h+pad*2}`);$('plan').replaceChildren();
  function path(rings,fill,stroke){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',rings.map(r=>r.map(([x,y],i)=>`${i?'L':'M'}${x},${-y}`).join(' ')+' Z').join(' '));p.setAttribute('fill',fill);p.setAttribute('stroke',stroke);p.setAttribute('fill-rule','evenodd');p.setAttribute('vector-effect','non-scaling-stroke');$('plan').append(p);}
  path([project.parcel],'#fff','#475950');for(const r of project.exclusions)path([r],'#d6c4b2','#937e68');for(const p of level.shape)path(p,'#79b8a5','#165e4b');
  $('slice').textContent=`Step ${level.step} | Height ${level.height.toFixed(2)} ${project.units} | Largest plate ${level.area.toFixed(2)} ${project.units}²`;
}
$('new').onclick=()=>{adopt(example());message('New synthetic study. Review assumptions before calculation.');};
$('apply').onclick=guard(()=>{const p=JSON.parse($('editor').value);for(const r of p.rules??[])r.status='draft';adopt(p);message('Applied. Review all rules again after editing project data.');});
$('import').onchange=guard(async e=>{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Project exceeds 2 MB');const p=JSON.parse(await file.text());for(const r of p.rules??[])r.status='draft';adopt(p);message('Imported. Rule review required.');e.target.value='';});
$('source').onchange=guard(async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1000000)throw Error('Text exceeds 1 MB');project.sources.push({id:crypto.randomUUID(),title:file.name,priority:project.sources.length+1,text:await file.text()});for(const r of project.rules)r.status='draft';render();message('Source added. Assign its ID and exact reference to applicable rules in project data.');e.target.value='';});
$('save').onclick=guard(()=>{project.parameters=parameters();localStorage.setItem(storage,JSON.stringify(project));sync();message('Saved in this browser. Export JSON for a portable backup.');});
$('export').onclick=()=>{project.parameters=parameters();download('nashzone-project.json',JSON.stringify(project,null,2),'application/json');};
$('calculate').onclick=guard(()=>{invalidate();project.parameters=parameters();result=calculate(project,project.scenarios.find(s=>s.id===$('scenario').value),project.parameters);sync();$('result').textContent=result.best?`Conditional height ${result.best.height.toFixed(2)} ${project.units} / ${result.best.step} added steps / ${result.best.area.toFixed(2)} ${project.units}² top plate`:'No feasible plate at the baseline';$('level').max=result.levels.length-1;$('level').value=result.best?.step??0;$('report').disabled=false;draw();message('Calculated. Bonus eligibility and other development constraints remain unevaluated.');});
for(const id of ['area','height','scenario'])$(id).addEventListener('input',invalidate);
$('editor').addEventListener('input',()=>{invalidate();$('calculate').disabled=true;$('save').disabled=true;$('export').disabled=true;message('Apply edited data before calculating or saving.');});
$('level').oninput=draw;
$('report').onclick=()=>download('review-memo.json',JSON.stringify({generatedAt:new Date().toISOString(),project,result,checklist:['Verify parcel geometry and road exclusions','Confirm frontage applicability and source currency','Review use permissions, other setbacks, FAR exemptions and bonus separately','Obtain planner confirmation before relying on development rights']},null,2),'application/json');
render();
