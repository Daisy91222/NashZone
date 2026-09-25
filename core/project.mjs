import * as clip from 'polyclip-ts';

export const VERSION = 1;
export function validate(project) {
  if(!project || typeof project!=='object')return ['Project must be an object'];
  const errors = [];
  if(project.schemaVersion !== VERSION) errors.push('Unsupported schemaVersion');
  if(typeof project.name!=='string'||!project.name.trim()) errors.push('Project name is required');
  if(!['ft','m'].includes(project.units)) errors.push('Units must be ft or m; geographic coordinates must be projected first');
  const ring = r => Array.isArray(r) && r.length >= 4 && r.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)) && r[0].every((v,i)=>v === r.at(-1)[i]);
  if(!ring(project.parcel)) errors.push('Parcel must be a closed local-coordinate ring');
  if(!Array.isArray(project.exclusions) || !project.exclusions.every(ring)) errors.push('Exclusions must be closed rings');
  if(!Array.isArray(project.frontages) || !project.frontages.length) errors.push('At least one frontage is required');
  else for(const f of project.frontages) {
    if(!f || typeof f!=='object'){errors.push('Invalid frontage');continue;}
    if(!f.id || !Array.isArray(f.line) || f.line.length !== 2 || ![...f.line,f.inside].every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))) errors.push('Invalid frontage');
    else { try { normal(f); } catch(e) { errors.push(e.message); } }
  }
  if(Array.isArray(project.frontages) && new Set(project.frontages.map(f=>f?.id)).size !== project.frontages.length) errors.push('Frontage IDs must be unique');
  if(!Array.isArray(project.sources) || !Array.isArray(project.rules) || !Array.isArray(project.scenarios)) errors.push('Sources, rules and scenarios are required');
  else {
    if(project.sources.some(s=>!s||typeof s.id!=='string'||typeof s.title!=='string'))errors.push('Invalid source');
    if(new Set(project.sources.map(s=>s?.id)).size!==project.sources.length)errors.push('Source IDs must be unique');
    if(project.rules.some(r=>!r||typeof r.key!=='string'||typeof r.reference!=='string'))errors.push('Invalid rule');
    if(!project.scenarios.length||project.scenarios.some(s=>!s||typeof s.id!=='string'||!Array.isArray(s.frontages)||!s.frontages.length))errors.push('Invalid scenario');
  }
  return errors;
}
export function normal({line:[a,b],inside}) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  if(length<1e-8) throw Error('Zero-length frontage');
  let n=[-dy/length,dx/length];
  const side=(inside[0]-a[0])*n[0]+(inside[1]-a[1])*n[1];
  if(Math.abs(side)<1e-8) throw Error('Inside point lies on frontage');
  if(side<0)n=n.map(v=>-v);
  return {a,n,t:[dx/length,dy/length]};
}
const ringArea=r=>Math.abs(r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
export const area=p=>ringArea(p[0])-p.slice(1).reduce((s,r)=>s+ringArea(r),0);
export function resolveRules(project) {
  const resolved={};
  for(const key of ['baseHeight','retreatPerFloor','offset']) {
    const candidates=project.rules.filter(r=>r.key===key && r.active);
    if(candidates.length!==1) throw Error(`${key}: select exactly one applicable rule; priority does not automatically resolve conflicts`);
    const r=candidates[0];
    if(r.status!=='reviewed' || !r.reference?.trim() || !project.sources.some(s=>s.id===r.sourceId)) throw Error(`${key}: reviewed rule and source reference required`);
    if(!Number.isFinite(r.value) || r.value<0 || (key==='retreatPerFloor' && r.value===0)) throw Error(`${key}: invalid value`);
    resolved[key]=r.value;
  }
  return resolved;
}
export function calculate(project,scenario,parameters) {
  const errors=validate(project); if(errors.length) throw Error(errors.join('; '));
  const rules=resolveRules(project);
  const {minArea,floorHeight}=parameters;
  if(!Number.isFinite(minArea)||minArea<=0||!Number.isFinite(floorHeight)||floorHeight<=0) throw Error('Area and floor height must be positive');
  if(!scenario.frontages?.length) throw Error('Select a frontage');
  const normals=scenario.frontages.map(id=>{const f=project.frontages.find(f=>f.id===id);if(!f)throw Error(`Unknown frontage ${id}`);return normal(f);});
  let net=[[project.parcel]];
  for(const r of project.exclusions) net=clip.difference(net,[[r]]);
  const size=Math.max(1,...project.parcel.flat().map(Math.abs),...project.frontages.flatMap(f=>f.line.flat().map(Math.abs)))*20;
  const maxDepth=Math.max(...project.parcel.map(p=>Math.min(...normals.map(({a,n})=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1]))));
  const bound=Math.max(0,Math.ceil((maxDepth-rules.offset)/rules.retreatPerFloor))+1;
  if(bound>2000)throw Error('More than 2,000 levels: check units and retreat');
  const levels=[];let best=null;
  for(let step=0;step<=bound;step++) {
    let shape=net;
    for(const {a,n,t} of normals) {
      const d=rules.offset+step*rules.retreatPerFloor;
      const point=(u,v)=>[a[0]+n[0]*(d+v)+t[0]*u,a[1]+n[1]*(d+v)+t[1]*u].map(v=>Math.round(v*1e6)/1e6);
      const ring=[point(-size,0),point(size,0),point(size,size),point(-size,size)];ring.push(ring[0]);
      shape=clip.intersection(shape,[[ring]]);
    }
    const plate=shape.length?shape.reduce((a,b)=>area(a)>area(b)?a:b):null;
    const level={step,height:rules.baseHeight+step*floorHeight,area:plate?area(plate):0,shape};levels.push(level);
    if(level.area+1e-6>=minArea)best=level;else break;
  }
  return {scenarioId:scenario.id,units:project.units,parameters,rules,levels,best,status:'conditional_geometry_only',netArea:net.reduce((s,p)=>s+area(p),0)};
}
