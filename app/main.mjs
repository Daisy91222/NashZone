import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {SCENARIOS,solve,heightAt,difference} from './engine.mjs';
import {createIcons,Download,Calculator,ScanLine,RotateCcw,Map} from 'lucide';

const $=id=>document.getElementById(id);
const data=await (await fetch(new URL('./data/geometry.json',import.meta.url))).json();
const fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:0});
let results,active=0,mode='plane',section=0;
const scene=new THREE.Scene();scene.background=new THREE.Color('#eef2f0');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(800,410);
$('scene').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(38,1,1,20000);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.02;controls.minDistance=150;controls.maxDistance=4500;
scene.add(new THREE.HemisphereLight(0xffffff,0x788f81,2.5));
const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(200,1200,500);scene.add(light);
let content=new THREE.Group();scene.add(content);
const observer=new ResizeObserver(()=>{const w=$('scene').clientWidth,h=$('scene').clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe($('scene'));

function resetCamera(plan=false){
  const height=results?.[active].best?.height||48;
  controls.target.set(405,Math.min(height/2,180),-130);
  camera.up.set(0,1,0);
  if(plan){camera.position.set(405,1400,-129);camera.up.set(0,0,-1);}
  else camera.position.set(1150,Math.max(930,height+650),960);
  camera.lookAt(controls.target);controls.update();
}
function shapeObject(poly) {
  const shape=new THREE.Shape(poly[0].map(p=>new THREE.Vector2(...p)));
  for(const hole of poly.slice(1))shape.holes.push(new THREE.Path(hole.map(p=>new THREE.Vector2(...p))));
  return shape;
}
function surface(multi,height,color,opacity=1){
  for(const poly of multi){
    const g=new THREE.ShapeGeometry(shapeObject(poly));
    const pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setXYZ(i,x,typeof height==='function'?height([x,y]):height,-y);}
    g.computeVertexNormals();
    const mat=new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,transparent:opacity<1,opacity,roughness:.85,metalness:0,depthWrite:opacity===1});
    content.add(new THREE.Mesh(g,mat));
  }
}
function line(points,height,color,width=1){
  const geom=new THREE.BufferGeometry().setFromPoints(points.map(([x,y])=>new THREE.Vector3(x,height,-y)));
  content.add(new THREE.Line(geom,new THREE.LineBasicMaterial({color,linewidth:width})));
}
function wall(multi,bottom,top,color){
  const vertices=[];
  for(const poly of multi)for(const ring of poly)for(let i=0;i<ring.length-1;i++){
    const a=ring[i],b=ring[i+1],ha=typeof top==='function'?top(a):top,hb=typeof top==='function'?top(b):top;
    vertices.push(a[0],bottom,-a[1],b[0],bottom,-b[1],b[0],hb,-b[1], a[0],bottom,-a[1],b[0],hb,-b[1],a[0],ha,-a[1]);
  }
  if(!vertices.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();
  content.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.9})));
}
function redrawScene(){
  scene.remove(content);content.traverse(o=>{o.geometry?.dispose();if(o.material) o.material.dispose();});content=new THREE.Group();scene.add(content);
  const r=results[active];
  surface([[data.parcel]],0,'#c8d6cd');
  // Roads remain visible around the parcel, but only their intersection is deducted.
  surface([[data.road]],.3,'#b9c3be');
  line(data.parcel,1,'#3e5648');
  if(r.best){
    const max=r.best.n;
    wall(r.baseline,0,48,'#8ab6a0');
    for(let n=0;n<=max;n++){
      const current=r.levels[n].shape;
      const band=n<max?difference(current,r.levels[n+1].shape):current;
      if(mode==='plane')surface(band,p=>heightAt(r,p,true),'#6aa88c');
      else {surface(band,48+n*r.parameters.floorHeight,'#6aa88c');if(n>0)wall(current,48+(n-1)*r.parameters.floorHeight,48+n*r.parameters.floorHeight,'#559477');}
    }
    if(mode==='plane')wall(r.baseline,48,p=>heightAt(r,p,true),'#76a78e');
    const selected=r.levels[section];
    for(const poly of selected.plate)for(const ring of poly)line(ring,selected.height+1.3,'#174b39');
    surface(r.best.plate,r.best.height+.5,'#28705a');
  }
  for(const id of r.scenario.frontages)for(const l of data.frontages[id].lines){
    line(l,3,'#cfa316');
    const [a,b]=l;const curve=new THREE.LineCurve3(new THREE.Vector3(a[0],3,-a[1]),new THREE.Vector3(b[0],3,-b[1]));
    content.add(new THREE.Mesh(new THREE.TubeGeometry(curve,1,2,5,false),new THREE.MeshBasicMaterial({color:'#d6aa27'})));
  }
}
function svgPath(multi){return multi.map(poly=>poly.map(ring=>'M'+ring.map(([x,y])=>`${x},${-y}`).join('L')+'Z').join('')).join('');}
function redrawPlan(){
  const r=results[active],l=r.levels[section];
  let s=`<path d="${svgPath([[data.parcel]])}" fill="#e0e8e2" stroke="#526b5a" stroke-width="2"/>`;
  s+=`<path d="${svgPath(difference([[data.parcel]],r.net))}" fill="#b9c3be"/>`;
  s+=`<path d="${svgPath(l.plate)}" fill="#4b9474" fill-opacity=".7" fill-rule="evenodd" stroke="#236444" stroke-width="2"/>`;
  for(const id of r.scenario.frontages)for(const l of data.frontages[id].lines)s+=`<path d="M${l.map(([x,y])=>`${x},${-y}`).join('L')}" stroke="#cba51d" stroke-width="5" fill="none"/>`;
  $('plan').setAttribute('viewBox','-25 -405 845 505');$('plan').innerHTML=s;
  $('level-label').textContent=`+${l.n} · ${fmt(l.height)} ft`;
  $('section-area').textContent=`${fmt(l.area)} sq ft`;
}
function render(){
  const r=results[active],b=r.best;
  $('height').innerHTML=b?`${fmt(b.height)} <small>ft</small>`:'Infeasible';
  $('floors').textContent=b?`+${b.n}`:'—';$('plate').innerHTML=b?`${fmt(b.area)} <small>sq ft</small>`:'—';
  const next=b?r.levels[b.n+1]:r.levels[0];
  $('threshold').innerHTML=b?`<div class="pass">Level +${b.n}: ${fmt(b.area)} sq ft ≥ ${fmt(r.parameters.minArea)}</div><div class="fail">Level +${next.n}: ${fmt(next.area)} sq ft &lt; ${fmt(r.parameters.minArea)}</div>`:`<div class="fail">Baseline plate ${fmt(next.area)} sq ft is below ${fmt(r.parameters.minArea)} sq ft.</div>`;
  $('level').max=String(b?.n||0);section=Math.min(section,b?.n||0);$('level').value=String(section);
  $('comparison').innerHTML=results.map((r,i)=>`<tr${i===active?' style="font-weight:700"':''}><td>${r.scenario.name}</td><td>${r.best?'+'+r.best.n:'—'}</td><td>${r.best?fmt(r.best.height)+' ft':'Infeasible'}</td></tr>`).join('');
  document.querySelectorAll('#scenarios button').forEach((b,i)=>b.setAttribute('aria-pressed',i===active));
  document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
  redrawScene();redrawPlan();
  window.__nashzone={ready:true,active,mode,results:results.map(r=>({id:r.scenario.id,n:r.best?.n??null,height:r.best?.height??null,area:r.best?.area??null})),renderer};
}
function calculate(){
  try{const opts={minArea:Number($('min-area').value),floorHeight:Number($('floor-height').value),offset:0};results=SCENARIOS.map(s=>solve(data,s,opts));$('error').textContent='';section=results[active].best?.n||0;render();resetCamera();}
  catch(e){$('error').textContent=e.message;}
}
$('scenarios').innerHTML=SCENARIOS.map((s,i)=>`<button type="button" data-index="${i}" aria-pressed="${i===0}">${s.id} · ${s.name}</button>`).join('');
$('scenarios').onclick=e=>{const b=e.target.closest('button');if(!b)return;active=Number(b.dataset.index);section=results[active].best?.n||0;render();resetCamera();};
$('modes').onclick=e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.mode;render();};
$('parameters').onsubmit=e=>{e.preventDefault();calculate();};
$('level').oninput=()=>{section=Number($('level').value);redrawPlan();redrawScene();};
$('reset-camera').onclick=()=>resetCamera();$('plan-camera').onclick=()=>resetCamera(true);
$('export').onclick=()=>{
  const report={generatedAt:new Date().toISOString(),source:data,results:results.map(r=>({scenario:r.scenario,parameters:r.parameters,netArea:r.netArea,roadArea:r.roadArea,best:r.best,next:r.best?r.levels[r.best.n+1]:r.levels[0],legalStatus:r.legalStatus}))};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));a.download='nashzone-height-study.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
const residual=Math.max(...data.calibration.map(c=>Math.abs(c.residual_ft)));
$('scale-note').textContent=`Maximum edge mismatch: ${residual.toFixed(1)} ft. No surveyed bearings.`;
$('calibration').innerHTML=data.calibration.map(c=>`<tr><td>${c.label_ft.toFixed(1)}</td><td>${c.fitted_ft.toFixed(1)}</td><td>${c.residual_ft.toFixed(1)}</td></tr>`).join('');
createIcons({icons:{Download,Calculator,ScanLine,RotateCcw,Map}});calculate();
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
