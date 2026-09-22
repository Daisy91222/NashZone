import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,SCENARIOS,area} from '../app/engine.mjs';
const data=JSON.parse(readFileSync(new URL('../app/data/geometry.json',import.meta.url)));
const rect={parcel:[[0,0],[200,0],[200,100],[0,100],[0,0]],road:[[300,0],[310,0],[310,10],[300,10],[300,0]],building_side_point:[100,50],frontages:{X:{lines:[[[0,0],[0,100]]]},Y:{lines:[[[0,0],[200,0]]]}}};
test('single-sided rectangle uses perpendicular depth and discrete retreat',()=>{
  const r=solve(rect,{frontages:['X']},{minArea:5000,floorHeight:10});
  assert.equal(r.best.n,15);assert.equal(r.best.area,5000);assert.equal(r.best.height,198);assert.equal(r.levels[16].area,4000);
});
test('two adjacent frontages intersect rather than add',()=>{
  const r=solve(rect,{frontages:['X','Y']},{minArea:5000});
  assert.equal(r.best.n,6);assert.equal(r.best.area,5600);assert.equal(r.levels[7].area,3900);
});
test('road subtraction and disconnected plate threshold',()=>{
  const split={...rect,road:[[90,-10],[110,-10],[110,110],[90,110],[90,-10]]};
  const r=solve(split,{frontages:['X']},{minArea:10000});
  assert.equal(r.roadArea,2000);assert.equal(r.netArea,18000);assert.equal(r.levels[0].area,9000);assert.equal(r.best,null);
});
test('threshold monotonicity and height does not alter geometry',()=>{
  const a=solve(data,SCENARIOS[0],{minArea:50000}),b=solve(data,SCENARIOS[0],{minArea:60000}),c=solve(data,SCENARIOS[0],{minArea:50000,floorHeight:12});
  assert.ok(b.best.n<=a.best.n);assert.equal(c.best.n,a.best.n);assert.equal(c.best.height,48+c.best.n*12);
});
test('real case areas decrease and combined envelope is bounded',()=>{
  const r=SCENARIOS.map(s=>solve(data,s,{minArea:1}));
  for(const result of r)for(let i=1;i<result.levels.length;i++)assert.ok(result.levels[i].area<=result.levels[i-1].area+1e-5);
  for(let i=0;i<r[3].levels.length;i++){
    assert.ok(area(r[3].levels[i].shape)<=area(r[1].levels[i]?.shape||[])+1e-5);
    assert.ok(area(r[3].levels[i].shape)<=area(r[2].levels[i]?.shape||[])+1e-5);
  }
});
test('invalid inputs rejected',()=>{
  for(const opts of [{minArea:0},{minArea:NaN},{floorHeight:0},{offset:6}])assert.throws(()=>solve(rect,{frontages:['X']},opts));
});
