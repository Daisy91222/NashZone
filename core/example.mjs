export function example() {
  return {schemaVersion:1,name:'Independent rectangle study',parcelId:'SYNTHETIC-001',units:'ft',
    parcel:[[0,0],[300,0],[300,200],[0,200],[0,0]],exclusions:[],
    frontages:[{id:'south',line:[[0,0],[300,0]],inside:[150,100]},{id:'east',line:[[300,0],[300,200]],inside:[150,100]}],
    sources:[{id:'assumption',title:'Synthetic test assumptions',priority:1,text:'Not a regulation. A synthetic case for testing the engine.'}],
    rules:[['baseHeight',30],['retreatPerFloor',10],['offset',0]].map(([key,value])=>({key,value,sourceId:'assumption',reference:'Synthetic fixture, not legal authority',status:'draft',active:true})),
    scenarios:[{id:'south',frontages:['south']},{id:'combined',frontages:['south','east']}],parameters:{minArea:10000,floorHeight:10},
    limitations:['Synthetic geometry only','No other setbacks, bonus, FAR, parking or use permissions evaluated']};
}
