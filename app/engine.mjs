import * as polygonClipping from 'polyclip-ts';
polygonClipping.setPrecision(1e-7);

export const SCENARIOS = [
  {id:'F1',name:'Cleghorn',frontages:['F1']},
  {id:'F2',name:'Right road',frontages:['F2']},
  {id:'F3',name:'Middle road',frontages:['F3']},
  {id:'F23',name:'Middle + right',frontages:['F2','F3']},
];
export function ringArea(ring) {
  return Math.abs(ring.reduce((sum,p,i)=> { const q=ring[(i+1)%ring.length]; return sum+p[0]*q[1]-q[0]*p[1]; },0)/2);
}
export function polygonArea(poly) { return ringArea(poly[0])-poly.slice(1).reduce((s,r)=>s+ringArea(r),0); }
export function area(multi) {return multi.reduce((s,p)=>s+polygonArea(p),0);}
export function largest(multi) {return multi.length ? multi.reduce((a,b)=>polygonArea(a)>polygonArea(b)?a:b):null;}
export function normal(line,inside) {
  const [a,b]=line, dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);
  if(l<1e-8) throw Error('Zero-length frontage');
  let n=[-dy/l,dx/l];
  const sign=(inside[0]-a[0])*n[0]+(inside[1]-a[1])*n[1];
  if(Math.abs(sign)<1e-8) throw Error('Building-side point lies on frontage');
  if(sign<0)n=n.map(v=>-v);
  return {a,n,t:[dx/l,dy/l]};
}
export function halfPlane(line,inside,distance,size) {
  const {a,n,t}=normal(line,inside),o=[a[0]+n[0]*distance,a[1]+n[1]*distance];
  // Millifoot precision avoids near-coincident PDF edges destabilizing clipping.
  const point=(u,v)=>[o[0]+u*t[0]+v*n[0],o[1]+u*t[1]+v*n[1]].map(v=>Math.round(v*1000)/1000);
  const p=[point(-size,0),point(size,0),point(size,size),point(-size,size)];
  return [[...p,p[0]]];
}
export const difference=(a,b)=>polygonClipping.difference(a,b);
export function solve(data,scenario,{minArea=50000,floorHeight=10,offset=0}={}) {
  if(!Number.isFinite(minArea)||minArea<=0)throw Error('Top-floor area must be positive.');
  if(!Number.isFinite(floorHeight)||floorHeight<=0||floorHeight>100)throw Error('Floor height must be between 0 and 100 ft.');
  if(!Number.isFinite(offset)||offset<0||offset>5)throw Error('Build-to offset must be 0–5 ft.');
  const net=polygonClipping.difference([data.parcel],[data.road]);
  const lines=scenario.frontages.flatMap(id=>data.frontages[id].lines);
  const normals=lines.map(line=>normal(line,data.building_side_point));
  const allPoints=data.parcel;
  const size=Math.max(...allPoints.flat().map(Math.abs),1)*20;
  const maxDepth=Math.max(0,...allPoints.map(p=>Math.min(...normals.map(({a,n})=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1]))));
  const maxSteps=Math.ceil(maxDepth/10)+1;
  if(maxSteps>10000)throw Error('Geometry exceeds supported demo extent.');
  const levels=[];
  let best=null;
  for(let n=0;n<=maxSteps;n++) {
    let shape=net;
    for(const line of lines)shape=polygonClipping.intersection(shape,halfPlane(line,data.building_side_point,offset+10*n,size));
    const plate=largest(shape),plateArea=plate?polygonArea(plate):0;
    const level={n,retreat:10*n,height:48+n*floorHeight,area:plateArea,shape,plate:plate?[plate]:[]};
    levels.push(level);
    if(plateArea+1e-6>=minArea)best=level;
    else break;
  }
  return {scenario,parameters:{minArea,floorHeight,offset},net,netArea:area(net),roadArea:area([[data.parcel]])-area(net),levels,best,baseline:levels[0].shape,normals,maxDepth,legalStatus:'geometry_only_bonus_not_evaluated'};
}
export function heightAt(result,p,continuous=true) {
  if(!result.best)return 0;
  const depth=Math.min(...result.normals.map(({a,n})=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1]))-result.parameters.offset;
  const steps=continuous?depth/10:Math.floor((depth+1e-6)/10);
  return 48+Math.min(result.best.n,Math.max(0,steps))*result.parameters.floorHeight;
}
