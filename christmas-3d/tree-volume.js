/* A compact geometry renderer: every branch, ribbon and ornament shares model coordinates. */
const treeCanvas=document.createElement('canvas');
treeCanvas.className='volume-tree';
treeCanvas.setAttribute('role','img');
treeCanvas.setAttribute('aria-label','带环绕灯带、彩球和立体金星的圣诞树');
world.appendChild(treeCanvas);
const treeContext=treeCanvas.getContext('2d');
const treeView={rx:-8,ry:-24};
const skyCanvas=document.createElement('canvas');
skyCanvas.className='panoramic-sky';skyCanvas.setAttribute('aria-hidden','true');
app.prepend(skyCanvas);
const skyContext=skyCanvas.getContext('2d');
let skyFrame={width:1,height:1,scale:1,top:0};
let renderWidth=440,renderHeight=1100;
function resizeWinterScene(){
 const pixelRatio=Math.min(devicePixelRatio||1,2);
 const sceneScale=Math.max(.25,Math.min(.9,(stage.clientHeight-8)/500,(stage.clientWidth-20)/340));
 world.style.scale=sceneScale;
 renderWidth=Math.max(440,Math.ceil(innerWidth/sceneScale+80));
 renderHeight=Math.max(1315,Math.ceil((innerHeight+400)/sceneScale)+215);
 treeCanvas.width=renderWidth*pixelRatio;treeCanvas.height=renderHeight*pixelRatio;
 treeCanvas.style.width=renderWidth+'px';treeCanvas.style.height=renderHeight+'px';
 treeCanvas.style.left=(150-renderWidth/2)+'px';
 treeContext.setTransform(pixelRatio,0,0,pixelRatio,0,0);
 skyFrame={width:app.clientWidth,height:innerHeight,scale:sceneScale,top:stage.offsetTop+world.offsetTop+210*(1-sceneScale)-260*sceneScale};
 skyCanvas.width=skyFrame.width*pixelRatio;skyCanvas.height=skyFrame.height*pixelRatio;
 skyContext.setTransform(pixelRatio,0,0,pixelRatio,0,0);



}
resizeWinterScene();
window.addEventListener('resize',resizeWinterScene); new ResizeObserver(resizeWinterScene).observe(stage);
const mesh=[],decorations=[];
// One world unit is one centimetre: a 4.4 m tree and a Moon 384,400 km away.
const MOON_DISTANCE=384400*100000,MOON_RADIUS=1737.4*100000;
const moonAltitude=10*Math.PI/180,moonBearing=-2*Math.PI/180;
const MOON_POSITION=[MOON_DISTANCE*Math.cos(moonAltitude)*Math.sin(moonBearing),210-MOON_DISTANCE*Math.sin(moonAltitude),-MOON_DISTANCE*Math.cos(moonAltitude)*Math.cos(moonBearing)];
const segments=40,TAU=Math.PI*2;
const profiles=[[0,0],[.19,.29],[.24,.24],[.4,.5],[.46,.43],[.63,.73],[.69,.65],[.86,.94],[.91,.86],[1,1]];
function surfaceRadius(t,radius){
 for(let j=1;j<profiles.length;j++)if(t<=profiles[j][0]){
  const [a,ra]=profiles[j-1],[b,rb]=profiles[j];
  return radius*(ra+(rb-ra)*(t-a)/(b-a));
 }
 return radius;
}
function modelPoint(angle,radius,y){return [Math.cos(angle)*radius,y,Math.sin(angle)*radius];}
function triangle(a,b,c,color,kind='leaf'){mesh.push({points:[a,b,c],color,kind});}
const tiers=[{y:4,h:140,r:59},{y:54,h:168,r:95},{y:118,h:190,r:125},{y:198,h:204,r:153}];
tiers.forEach((tier,index)=>{
 for(let band=1;band<profiles.length;band++){
  const [t0,r0]=profiles[band-1],[t1,r1]=profiles[band];
  for(let i=0;i<segments;i++){
   const a=i/segments*TAU,b=(i+1)/segments*TAU;
   const v0=modelPoint(a,r0*tier.r,tier.y+t0*tier.h);
   const v1=modelPoint(b,r0*tier.r,tier.y+t0*tier.h);
   const v2=modelPoint(b,r1*tier.r,tier.y+t1*tier.h);
   const v3=modelPoint(a,r1*tier.r,tier.y+t1*tier.h);
   const shade=(i%3)*3+(band%2)*4;
   // Soft forest-green patches stay attached to the branches as the tree rotates.
   const accent=Math.max(0,Math.sin(a*3+index*.9)*Math.cos(band*.75+a)-.15)*.48;
   const forest=[7,57,38];
   const tint=color=>color.map((value,channel)=>Math.round(value*(1-accent)+forest[channel]*accent));
   triangle(v0,v1,v2,tint([24+shade,112+shade,65+shade]));
   triangle(v0,v2,v3,tint([23+shade,106+shade,60+shade]));
  }
 }
 // The ribbon wraps around the actual tree surface; rear segments are naturally occluded.
 let previous=null;
 for(let i=0;i<=100;i++){
  const t=.54+i/100*.34,angle=i/100*TAU+index*.8;
  const point=modelPoint(angle,surfaceRadius(t,tier.r)+2,tier.y+t*tier.h);
  if(previous)decorations.push({kind:'wire',points:[previous,point],tier:index});
  if(i%5===0)decorations.push({kind:'lamp',point,r:2.4,tier:index,phase:i*.3});
  previous=point;
 }
 for(let i=0;i<9;i++){
  const t=.48+(i%3)*.16,angle=i/9*TAU+index*.7;
  decorations.push({kind:'ball',point:modelPoint(angle,surfaceRadius(t,tier.r)+4,tier.y+t*tier.h),r:4+index*.7,color:['#d34b55','#e7bc68','#e9d9b8'][i%3]});
 }
 // Fine needles provide depth cues without external textures.
 for(let i=0;i<100;i++){
  const t=.27+((i*37)%100)/100*.7,angle=i*2.39996;
  const start=modelPoint(angle,surfaceRadius(t,tier.r)+.5,tier.y+t*tier.h);
  const end=modelPoint(angle+.018,surfaceRadius(Math.min(t+.055,1),tier.r)+.8,tier.y+Math.min(t+.055,1)*tier.h);
  decorations.push({kind:'needle',points:[start,end],tier:index});
 }
});
for(let i=0;i<24;i++){
 const a=i/24*TAU,b=(i+1)/24*TAU;
 const p=modelPoint(a,22,375),q=modelPoint(b,22,375),r=modelPoint(b,22,452),v=modelPoint(a,22,452);
 triangle(p,q,r,[115,61,30],'wood');triangle(p,r,v,[115,61,30],'wood');
}
const starOutline=[];
for(let i=0;i<10;i++){const angle=-Math.PI/2+i*Math.PI/5,r=i%2?10:23;starOutline.push([Math.cos(angle)*r,-10+Math.sin(angle)*r]);}
for(let i=0;i<10;i++){
 const j=(i+1)%10,a=starOutline[i],b=starOutline[j];
 triangle([0,-10,5],[a[0],a[1],3],[b[0],b[1],3],i%2?[255,223,122]:[244,187,73],'star');
 triangle([0,-10,-5],[b[0],b[1],-3],[a[0],a[1],-3],[222,168,64],'star');
 triangle([a[0],a[1],3],[a[0],a[1],-3],[b[0],b[1],-3],[180,121,35],'star');
 triangle([a[0],a[1],3],[b[0],b[1],-3],[b[0],b[1],3],[180,121,35],'star');
}

// Snow belongs to the same geometry as the tree, including its rounded rim.
function snowPoint(angle,radius,lower=false){
 const ripple=1+.026*Math.sin(angle*3)+.018*Math.cos(angle*5);
 const x=Math.cos(angle)*700*radius*ripple,z=Math.sin(angle)*700*radius*ripple;
 const drift=5*Math.exp(-((x-75)**2+(z+35)**2)/6500)+3*Math.exp(-((x+95)**2+(z-30)**2)/4200);
 const y=lower?468:448+16*radius**2-drift-7*Math.sin(x/145)*Math.cos(z/170)*radius;
 return [x,y,z];
}
const snowSteps=16,snowSegments=80;
for(let band=0;band<snowSteps;band++){
 for(let i=0;i<snowSegments;i++){
  const a=i/snowSegments*TAU,b=(i+1)/snowSegments*TAU,r0=band/snowSteps,r1=(band+1)/snowSteps;
  const p=snowPoint(a,r0),q=snowPoint(b,r0),r=snowPoint(b,r1),v=snowPoint(a,r1);
  triangle(p,q,r,[249,252,255],'terrain');triangle(p,r,v,[249,252,255],'terrain');
 }
}
for(let i=0;i<snowSegments;i++){
 const a=i/snowSegments*TAU,b=(i+1)/snowSegments*TAU;
 const p=snowPoint(a,1),q=snowPoint(b,1),r=snowPoint(b,.94,true),v=snowPoint(a,.94,true);
 triangle(p,q,r,[226,237,248],'terrain');triangle(p,r,v,[226,237,248],'terrain');
}


// Scene landmarks and their moonlit shadows all use the terrain's coordinates.
function groundHeight(x,z){
 const radius=Math.hypot(x,z)/700;
 return 448+16*radius**2-5*Math.exp(-((x-75)**2+(z+35)**2)/6500)-3*Math.exp(-((x+95)**2+(z-30)**2)/4200)-7*Math.sin(x/145)*Math.cos(z/170)*radius;
}
function snowSphere(x,y,z,r,color,kind='prop'){
 const rows=8,cols=14;
 const point=(j,i)=>{const a=j/rows*Math.PI,b=i/cols*TAU;return [x+r*Math.sin(a)*Math.cos(b),y-r*Math.cos(a),z+r*Math.sin(a)*Math.sin(b)];};
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=point(j,i),b=point(j,i+1),c=point(j+1,i+1),d=point(j+1,i);triangle(a,b,c,color,kind);triangle(a,c,d,color,kind);}
}
function groundMark(x,z,rx,rz,angle,color){
 const points=[];
 for(let i=0;i<32;i++){const a=i/32*TAU,u=Math.cos(a)*rx,v=Math.sin(a)*rz;const px=x+u*Math.cos(angle)-v*Math.sin(angle),pz=z+u*Math.sin(angle)+v*Math.cos(angle);points.push([px,groundHeight(px,pz)-.8,pz]);}
 const center=[x,groundHeight(x,z)-1,z];
 for(let i=0;i<32;i++)triangle(center,points[i],points[(i+1)%32],color,'shadow');
}
const snowmanX=-235,snowmanZ=45,snowmanFloor=groundHeight(snowmanX,snowmanZ);

snowSphere(snowmanX,snowmanFloor-24,snowmanZ,25,[239,247,253],'snow');
snowSphere(snowmanX,snowmanFloor-58,snowmanZ,17,[244,249,255],'snow');
for(const dx of [-6,6])snowSphere(snowmanX+dx,snowmanFloor-62,snowmanZ+15,1.7,[40,54,65]);
for(const dy of [16,28,40])snowSphere(snowmanX,snowmanFloor-dy,snowmanZ+22,2,[48,64,76]);
triangle([snowmanX-3,snowmanFloor-58,snowmanZ+16],[snowmanX+3,snowmanFloor-58,snowmanZ+16],[snowmanX+1,snowmanFloor-55,snowmanZ+29],[233,141,66],'prop');
// A small scarf collar.
snowSphere(snowmanX,snowmanFloor-44,snowmanZ,13,[162,57,67]);
for(const [x,z,h] of [[235,-90,95],[-285,-200,68],[330,160,60]]){
 const floor=groundHeight(x,z);

 const trunkRadius=Math.max(3,h*.045);
 for(let i=0;i<24;i++){
  const a=i/24*TAU,b=(i+1)/24*TAU;
  const p=[x+Math.cos(a)*trunkRadius,floor-22,z+Math.sin(a)*trunkRadius];
  const q=[x+Math.cos(b)*trunkRadius,floor-22,z+Math.sin(b)*trunkRadius];
  const r=[q[0],floor+.5,q[2]],v=[p[0],floor+.5,p[2]];
  triangle(p,r,q,[118,77,49],'prop');triangle(p,v,r,[106,67,43],'prop');
 }
 for(let tier=0;tier<3;tier++){
  const top=floor-h+tier*h*.25-12,r=h*(.22+tier*.045),bottom=top+h*.52;
  for(let i=0;i<20;i++){const a=i/20*TAU,b=(i+1)/20*TAU;
   triangle([x,top,z],[x+Math.cos(a)*r,bottom,z+Math.sin(a)*r],[x+Math.cos(b)*r,bottom,z+Math.sin(b)*r],[24,83,63],'prop');
   if(i%3!==0)triangle([x,top-1,z],[x+Math.cos(a)*r*.54,top+h*.28,z+Math.sin(a)*r*.54],[x+Math.cos(b)*r*.54,top+h*.28,z+Math.sin(b)*r*.54],[231,242,249],'snow');
  }
 }
}
// Footprints form a gently curved path towards the main tree.
for(let i=0;i<16;i++){
 const z=100+i*20,x=130+45*Math.sin(i*.18)+(i%2?9:-9);
 groundMark(x,z,4,9,.16,[218,228,237]);
}
// A pair of wrapped gifts gives a closer landmark on the right.
function giftBox(x,z,size,color){
 const y=groundHeight(x,z),v=[[x-size,y-size,z-size],[x+size,y-size,z-size],[x+size,y-size,z+size],[x-size,y-size,z+size],[x-size,y,z-size],[x+size,y,z-size],[x+size,y,z+size],[x-size,y,z+size]];
 for(const [a,b,c,d] of [[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]]){triangle(v[a],v[b],v[c],color,'prop');triangle(v[a],v[c],v[d],color,'prop');}
 triangle([x-2,y-size-.3,z-size],[x+2,y-size-.3,z-size],[x+2,y-size-.3,z+size],[238,202,128],'prop');
 triangle([x-2,y-size-.3,z-size],[x+2,y-size-.3,z+size],[x-2,y-size-.3,z+size],[238,202,128],'prop');
}

giftBox(190,105,14,[158,54,66]);giftBox(224,115,10,[40,98,104]);



// Interactive keepsakes are real meshes; transparent hit targets follow their projections.

const keepsakes=[
 {selector:'.treasure-a',point:[-174,296,72],glow:[255,178,145],radius:28,size:1.12},
 {selector:'.treasure-b',point:[174,274,-50],glow:[255,178,220],radius:28,size:.6},
 {selector:'.treasure-c',point:[-168,390,-100],glow:[255,216,132],radius:25,size:.78},
 {selector:'.treasure-d',point:[158,380,135],glow:[255,231,154],radius:25,size:.72}
];
function tubeLoop(x,y,z,rx,ry,tube,color){
 const n=40,m=8;
 const point=(i,j)=>{const a=i/n*TAU,b=j/m*TAU;return [x+(rx+tube*Math.cos(b))*Math.cos(a),y+(ry+tube*Math.cos(b))*Math.sin(a),z+tube*.65*Math.sin(b)];};
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);triangle(a,b,c,color,'prop');triangle(a,c,d,color,'prop');}
}
function roundedParcel(x,y,z){
 const half=[19,17,16],radius=3.3,grid=8;
 for(let axis=0;axis<3;axis++)for(const side of [-1,1]){
  const u=(axis+1)%3,v=(axis+2)%3;
  function point(i,j){
   const q=[0,0,0];q[axis]=half[axis]*side;q[u]=half[u]*(i/grid*2-1);q[v]=half[v]*(j/grid*2-1);
   const c=q.map((p,k)=>Math.max(-half[k]+radius,Math.min(half[k]-radius,p)));
   const delta=q.map((p,k)=>p-c[k]),length=Math.hypot(...delta)||1;
   return c.map((p,k)=>[x,y,z][k]+p+delta[k]/length*radius);
  }
  for(let i=0;i<grid;i++)for(let j=0;j<grid;j++){
   const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);
   const ribbon=Math.abs((i+.5)/grid*2-1)<.17||Math.abs((j+.5)/grid*2-1)<.17;
   const color=ribbon?[239,204,124]:[171,42,66];
   triangle(a,b,c,color,'prop');triangle(a,c,d,color,'prop');
  }
 }
 tubeLoop(x-8,y-23,z,8,5,1.9,[243,208,133]);
 tubeLoop(x+8,y-23,z,8,5,1.9,[243,208,133]);
 snowSphere(x,y-20,z,3.5,[242,207,132]);
}
keepsakes.forEach((item,owner)=>{
 const begin=mesh.length,[x,y,z]=item.point;
 item.bob=0;item.element=document.querySelector(item.selector);item.element.dataset.keepsakeId=owner;
 item.element.textContent='';item.element.classList.add('model-treasure');world.appendChild(item.element);
 if(owner===0)roundedParcel(x,y,z);
 else if(owner===1){
  const rows=20,cols=48;
  const point=(j,i)=>{const a=j/rows*Math.PI,b=i/cols*TAU;return [x+15*Math.cos(a),y+12*Math.sin(a)*Math.cos(b),z+12*Math.sin(a)*Math.sin(b)];};
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const a=point(j,i),b=point(j,i+1),c=point(j+1,i+1),d=point(j+1,i);
   const stripe=Math.sin(i/cols*TAU*5+j/rows*TAU*2)>.05;
   const color=stripe?[232,108,164]:[255,239,232];
   triangle(a,b,c,color,'prop');triangle(a,c,d,color,'prop');
  }
  for(const side of [-1,1])for(let ring=0;ring<3;ring++)for(let i=0;i<32;i++){
   const profile=[[14,5],[19,9],[29,11],[31,9]],p0=profile[ring],p1=profile[ring+1];
   const point=(p,j)=>{const a=j/32*TAU,r=p[1]*(1+.13*Math.cos(a*8));return [x+side*p[0],y+r*Math.cos(a),z+r*Math.sin(a)];};
   const a=point(p0,i),b=point(p0,i+1),c=point(p1,i+1),d=point(p1,i);
   const color=i%4<2?[242,157,194]:[255,214,230];
   triangle(a,b,c,color,'prop');triangle(a,c,d,color,'prop');
  }
 }else if(owner===2){
  const profile=[[-22,2],[-20,5],[-17,7],[-12,8],[-6,10],[0,13],[7,17],[10,19],[12,19],[13,17],[9,16],[5,14]];
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<56;i++){
   const point=(k,n)=>[x+Math.cos(n/56*TAU)*profile[k][1],y+profile[k][0],z+Math.sin(n/56*TAU)*profile[k][1]];
   const a=point(j,i),b=point(j,i+1),c=point(j+1,i+1),d=point(j+1,i);
   const color=j>8?[144,91,29]:[231,182,76];
   triangle(a,b,c,color,'prop');triangle(a,c,d,color,'prop');
  }
  tubeLoop(x,y-26,z,4,5,1.6,[233,195,112]);
  snowSphere(x,y+11,z,4,[196,139,43]);
 }else{
  const outline=[];
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?9:21;outline.push([Math.cos(a)*r,Math.sin(a)*r]);}
  for(let i=0;i<10;i++)for(const side of [-1,1]){
   const a=outline[i],b=outline[(i+1)%10];
   const outerA=[x+a[0],y+a[1],z+side*1.5],outerB=[x+b[0],y+b[1],z+side*1.5];
   const innerA=[x+a[0]*.74,y+a[1]*.74,z+side*5],innerB=[x+b[0]*.74,y+b[1]*.74,z+side*5];
   triangle([x,y,z+side*7],innerA,innerB,[249,210,110],'star');
   triangle(outerA,outerB,innerB,[218,166,63],'star');triangle(outerA,innerB,innerA,[239,193,88],'star');
   if(side===1){triangle(outerA,[outerA[0],outerA[1],z-1.5],[outerB[0],outerB[1],z-1.5],[173,117,43],'star');triangle(outerA,[outerB[0],outerB[1],z-1.5],outerB,[173,117,43],'star');}
  }
 }
 // Scale each shared vertex once, preserving the detailed shape and its attachment point.
 const vertices=new Set(mesh.slice(begin).flatMap(face=>face.points));
 for(const vertex of vertices)for(let axis=0;axis<3;axis++)vertex[axis]=item.point[axis]+(vertex[axis]-item.point[axis])*item.size;
 item.radius*=item.size;
 for(let i=begin;i<mesh.length;i++)mesh[i].owner=owner;
});
function pointInTriangle(p,vertices){
 const [a,b,c]=vertices; if(p.x<Math.min(a.x,b.x,c.x)||p.x>Math.max(a.x,b.x,c.x)||p.y<Math.min(a.y,b.y,c.y)||p.y>Math.max(a.y,b.y,c.y))return false;
 const sign=(a,b,c)=>(a.x-c.x)*(b.y-c.y)-(b.x-c.x)*(a.y-c.y);
 const d1=sign(p,vertices[0],vertices[1]),d2=sign(p,vertices[1],vertices[2]),d3=sign(p,vertices[2],vertices[0]);
 return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0));
}


// Text is rasterized only once per click, then projected as a plane in the same 3D scene.
let spatialWish=null;
function hideSpatialWish(){spatialWish=null;treeCanvas.dataset.spatialWishVisible='false';}
function showSpatialWish(element,text){
 const owner=Number(element.dataset.keepsakeId),texture=document.createElement('canvas');
 const lines=[],characters=Array.from(text);
 while(characters.length)lines.push(characters.splice(0,10).join(''));
 texture.width=400;texture.height=lines.length*44+28;
 const ctx=texture.getContext('2d');
 ctx.font='500 32px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='#102736dd';
 ctx.shadowColor='#ffe6ad88';ctx.shadowBlur=8;
 lines.forEach((line,i)=>{ctx.strokeText(line,200,30+i*44);ctx.fillStyle='#fff0c9';ctx.fillText(line,200,30+i*44);});
 const yaw=treeView.ry*Math.PI/180;
 spatialWish={owner,texture,width:200,height:texture.height/2,right:[Math.cos(yaw),0,Math.sin(yaw)],started:null};
}
function appendSpatialWish(list,project,time){
 if(!spatialWish)return;
 const message=spatialWish,item=keepsakes[message.owner];
 if(message.started===null)message.started=time;
 const age=time-message.started;
 const alpha=Math.min(1,.25+age/260,Math.max(0,(7000-age)/650));
 treeCanvas.dataset.spatialWishVisible=alpha>0?'true':'false';
 if(alpha<=0)return;
 const w=message.width,h=message.height,side=item.point[0]<0?-1:1;
 const center=[item.point[0]+message.right[0]*side*16,item.point[1]+item.bob-45-h/2,item.point[2]+message.right[2]*side*16];
 const position=(u,v)=>project([center[0]+message.right[0]*(u-.5)*w,center[1]+(v-.5)*h,center[2]+message.right[2]*(u-.5)*w]);
 for(let i=0;i<8;i++){
  const points=[position(i/8,0),position((i+1)/8,0),position((i+1)/8,1),position(i/8,1)];
  if(points.some(p=>p.z>780))continue;
  list.push({kind:'wish-text',points,z:points.reduce((sum,p)=>sum+p.z,0)/4,texture:message.texture,sourceX:i*50,alpha});
 }
}


// Project actual mesh triangles from the moon onto the terrain, then union them in a mask.
function moonGroundProjection(point){
 const direction=point.map((value,axis)=>value-MOON_POSITION[axis]);
 let t=(groundHeight(point[0],point[2])-MOON_POSITION[1])/direction[1];
 for(let i=0;i<5;i++){
  const x=MOON_POSITION[0]+direction[0]*t,z=MOON_POSITION[2]+direction[2]*t;
  t=(groundHeight(x,z)-MOON_POSITION[1])/direction[1];
 }
 const x=MOON_POSITION[0]+direction[0]*t,z=MOON_POSITION[2]+direction[2]*t;
 return [x,groundHeight(x,z)-.5,z];
}
const shadowVertexCache=new Map();
const shadowCasters=mesh.filter(face=>face.kind!=='terrain'&&face.kind!=='shadow').map(face=>({
 owner:face.owner,points:face.points.map(point=>{
  if(!shadowVertexCache.has(point))shadowVertexCache.set(point,moonGroundProjection(point));
  return shadowVertexCache.get(point);
 })
}));
shadowVertexCache.clear();
const shadowMask=document.createElement('canvas'),shadowContext=shadowMask.getContext('2d');
let previousShadowYaw=null,previousShadowPitch=null,lastShadowTime=0;
function drawMeshShadows(ctx,project,time){
 const changed=previousShadowYaw!==treeView.ry||previousShadowPitch!==treeView.rx;
 if(changed||time-lastShadowTime>180||shadowMask.width!==renderWidth||shadowMask.height!==renderHeight){
  if(shadowMask.width!==renderWidth||shadowMask.height!==renderHeight){shadowMask.width=renderWidth;shadowMask.height=renderHeight;}
  shadowContext.clearRect(0,0,renderWidth,renderHeight);
  shadowContext.fillStyle='#7490ad';
  const offsets=keepsakes.map(item=>{
   const a=moonGroundProjection(item.point),b=moonGroundProjection([item.point[0],item.point[1]+item.bob,item.point[2]]);
   return [b[0]-a[0],b[2]-a[2]];
  });
  // Opaque union prevents overlapping faces from producing darker internal seams.
  for(const face of shadowCasters){
   if(face.points.every(p=>Math.hypot(p[0],p[2])>690))continue;
   const shift=face.owner===undefined?[0,0]:offsets[face.owner];
   const points=face.owner===undefined?face.points.map(project):face.points.map(p=>{
    const x=p[0]+shift[0],z=p[2]+shift[1];
    return project([x,groundHeight(x,z)-.5,z]);
   });
   if(points.some(p=>p.z>780||!Number.isFinite(p.x)||!Number.isFinite(p.y)))continue;
   const [a,b,c]=points;
   const cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
   shadowContext.beginPath();shadowContext.moveTo(a.x,a.y);
   if(cross>=0){shadowContext.lineTo(b.x,b.y);shadowContext.lineTo(c.x,c.y);}
   else{shadowContext.lineTo(c.x,c.y);shadowContext.lineTo(b.x,b.y);}
   shadowContext.closePath();shadowContext.fill();
  }
  previousShadowYaw=treeView.ry;previousShadowPitch=treeView.rx;lastShadowTime=time;
 }
 ctx.save();ctx.globalAlpha=.2;ctx.filter='blur(1.2px)';ctx.drawImage(shadowMask,0,0);ctx.restore();
}

// A seamless cylindrical night panorama: mountains and stars share the camera yaw.

// Randomize once, keeping every star anchored to the panorama while it turns.
const starClusters=Array.from({length:7},()=>({azimuth:Math.random()*TAU,height:.25+Math.random()*.65}));
const nightStars=Array.from({length:620},()=>{
 const cluster=starClusters[Math.floor(Math.random()*starClusters.length)],clustered=Math.random()<.24;
 return {azimuth:clustered?(cluster.azimuth+(Math.random()-.5)*.55+TAU)%TAU:Math.random()*TAU,
 height:clustered?Math.max(.08,Math.min(.97,cluster.height+(Math.random()-.5)*.3)):.08+Math.random()*.9,
 r:Math.random()<.045?1.35+Math.random()*.65:.25+Math.random()**3*1.15,
 brightness:.12+Math.random()**1.5*.58,phase:Math.random()*TAU,period:2200+Math.random()*4200,
 color:Math.random()<.2?'#fff0d5':'#e4edff'};
});

const galaxyTexture=document.createElement('canvas');
galaxyTexture.width=2048;galaxyTexture.height=768;
const galaxyContext=galaxyTexture.getContext('2d');
function galaxyAltitude(angle){return .57+.23*Math.sin(angle+.45)+.045*Math.sin(angle*2-.8);}
function galaxyVisibility(angle){
 const offset=Math.atan2(Math.sin(angle-.12),Math.cos(angle-.12));
 return Math.exp(-Math.pow(offset/.78,4));
}
function noiseHash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
function smoothNoise(x,y){
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 return (noiseHash(ix,iy)*(1-u)+noiseHash(ix+1,iy)*u)*(1-v)+(noiseHash(ix,iy+1)*(1-u)+noiseHash(ix+1,iy+1)*u)*v;
}
const galacticPixels=galaxyContext.createImageData(2048,768);
for(let x=0;x<2048;x++){
 const angle=x/2048*TAU,center=(1-galaxyAltitude(angle))*768;
 const core=Math.exp(-(Math.atan2(Math.sin(angle-.18),Math.cos(angle-.18))**2)/.45);
 const width=15+core*16+5*Math.sin(angle*3);
 for(let y=Math.max(0,Math.floor(center-100));y<Math.min(768,center+100);y++){
  const distance=y-center;
  const n=smoothNoise(x/27,y/17)*.48+smoothNoise(x/11,y/8)*.32+smoothNoise(x/4,y/3)*.2;
  const envelope=Math.exp(-distance*distance/(width*width*2));
  const lane=5*Math.sin(angle*9)+3*Math.sin(angle*23);
  const rift=Math.exp(-((distance-lane)**2)/34);
  const clumps=Math.max(0,(n-.24)*1.5);
  const brightness=envelope*clumps*(1-rift*.85)*(.6+core*.75)*galaxyVisibility(angle);
  const i=(y*2048+x)*4;
  const violet=smoothNoise(x/68+19,y/43)*.65, warm=core*smoothNoise(x/43,y/27+8);
  galacticPixels.data[i]=166+violet*65+warm*46;
  galacticPixels.data[i+1]=182+violet*12+warm*27;
  galacticPixels.data[i+2]=220+violet*28-warm*30;
  galacticPixels.data[i+3]=Math.min(60,brightness*73);
 }
}
// Feather the periodic seam before uploading the panorama.
for(let y=0;y<768;y++)for(let x=0;x<128;x++){
 const mix=(1-x/128)*.5,a=(y*2048+x)*4,b=(y*2048+2047-x)*4;
 for(let channel=0;channel<4;channel++){
  const left=galacticPixels.data[a+channel],right=galacticPixels.data[b+channel];
  galacticPixels.data[a+channel]=left*(1-mix)+right*mix;
  galacticPixels.data[b+channel]=right*(1-mix)+left*mix;
 }
}
galaxyContext.putImageData(galacticPixels,0,0);
for(let i=0;i<8000;i++){
 const angle=Math.random()*TAU,spread=(Math.random()+Math.random()+Math.random()-1.5)*.045;
 const x=angle/TAU*2048,y=(1-galaxyAltitude(angle)+spread)*768;
 const lane=5*Math.sin(angle*9)+3*Math.sin(angle*23);
 if(Math.abs(y-(1-galaxyAltitude(angle))*768-lane)<3&&Math.random()<.85)continue;
 galaxyContext.globalAlpha=(.045+Math.random()*.17)*galaxyVisibility(angle);galaxyContext.fillStyle=Math.random()<.23?'#e7d1b1':'#c8daed';
 galaxyContext.beginPath();galaxyContext.arc(x,y,.15+Math.random()*.45,0,TAU);galaxyContext.fill();
}
galaxyContext.globalAlpha=1;
// The former mist is kept as separate, broken wisps, not a continuous luminous band.
const cloudTexture=document.createElement('canvas');cloudTexture.width=2048;cloudTexture.height=768;
const cloudContext=cloudTexture.getContext('2d');
for(let cloud=0;cloud<8;cloud++){
 const centerX=Math.random()*2048,centerY=240+Math.random()*250;
 for(let i=0;i<18;i++){
  const x=centerX+(Math.random()-.5)*170,y=centerY+(Math.random()-.5)*24,r=12+Math.random()*21;
  for(const wrap of [-2048,0,2048]){
   cloudContext.save();cloudContext.translate(x+wrap,y);cloudContext.scale(2.5,1);
   const haze=cloudContext.createRadialGradient(0,0,0,0,0,r);
   haze.addColorStop(0,'#b5c6dd08');haze.addColorStop(1,'#b5c6dd00');
   cloudContext.fillStyle=haze;cloudContext.fillRect(-r,-r,r*2,r*2);cloudContext.restore();
  }
 }
}
// All celestial textures use a fixed spherical sky and the scene camera's exact rotation.
const SKY_ALTITUDE=.8;
const atmosphereTexture=document.createElement('canvas');
atmosphereTexture.width=2048;atmosphereTexture.height=768;
const atmosphereContext=atmosphereTexture.getContext('2d');
atmosphereContext.globalAlpha=.5;atmosphereContext.drawImage(cloudTexture,0,0);
atmosphereContext.globalAlpha=.68;atmosphereContext.drawImage(galaxyTexture,0,0);
const atmospherePixels=atmosphereContext.getImageData(0,0,2048,768).data;
const atmosphereView=document.createElement('canvas'),atmosphereViewContext=atmosphereView.getContext('2d');
let atmosphereImage=null;
function skyRayAngles(screenX,screenY,focal,rotation,result){
 const [cy,sy,cx,sx]=rotation;
 const cameraX=screenX/focal,cameraY=screenY/focal;
 const worldY=cameraY*cx-sx,turnedZ=-cameraY*sx-cx;
 const worldX=cameraX*cy-turnedZ*sy,worldZ=cameraX*sy+turnedZ*cy;
 result[0]=Math.atan2(worldX,-worldZ);result[1]=Math.atan2(-worldY,Math.hypot(worldX,worldZ));
}
function drawCelestialAtmosphere(ctx,w,h,focal,centerY,yaw,pitch){
 // A small reusable raster avoids hundreds of clipping paths or full-resolution per-pixel work.
 const width=Math.ceil(w/3),height=Math.ceil(h/3);
 if(atmosphereView.width!==width||atmosphereView.height!==height){
  atmosphereView.width=width;atmosphereView.height=height;
  atmosphereImage=atmosphereViewContext.createImageData(width,height);
 }
 const pixels=atmosphereImage.data,rotation=[Math.cos(yaw),Math.sin(yaw),Math.cos(pitch),Math.sin(pitch)],angles=[0,0];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  skyRayAngles((x+.5)*w/width-w/2,(y+.5)*h/height-centerY,focal,rotation,angles);
  const [azimuth,altitude]=angles;
  const target=(y*width+x)*4;
  if(altitude<0||altitude>SKY_ALTITUDE){pixels[target+3]=0;continue;}
  const tx=Math.floor(((azimuth%TAU+TAU)%TAU)/TAU*2048);
  const ty=Math.min(767,Math.floor((1-altitude/SKY_ALTITUDE)*768));
  const source=(ty*2048+tx)*4;
  pixels[target]=atmospherePixels[source];pixels[target+1]=atmospherePixels[source+1];
  pixels[target+2]=atmospherePixels[source+2];pixels[target+3]=atmospherePixels[source+3];
 }
 atmosphereViewContext.putImageData(atmosphereImage,0,0);
 ctx.drawImage(atmosphereView,0,0,w,h);
}
function drawDistantMoon(ctx,x,y,r){
 // Atmospheric colour and a feathered limb merge the Moon into the distant sky.
 const veil=ctx.createRadialGradient(x,y,r*.7,x,y,r*3.6);
 veil.addColorStop(0,'#bdcfd31a');veil.addColorStop(.35,'#a5becb0c');veil.addColorStop(1,'#a5becb00');
 ctx.fillStyle=veil;ctx.fillRect(x-r*3.6,y-r*3.6,r*7.2,r*7.2);
 const disc=ctx.createRadialGradient(x-r*.18,y-r*.2,0,x,y,r*1.08);
 disc.addColorStop(0,'#d9dfd9df');disc.addColorStop(.75,'#d0dad6d9');
 disc.addColorStop(.91,'#bdcfcebf');disc.addColorStop(1,'#b9cbcc00');
 ctx.fillStyle=disc;ctx.beginPath();ctx.arc(x,y,r*1.08,0,TAU);ctx.fill();
 for(const [a,b,size] of [[-.25,-.1,.3],[.22,.22,.25],[-.12,.45,.16]]){
  ctx.save();ctx.translate(x+a*r,y+b*r);ctx.scale(1,.8);
  const maria=ctx.createRadialGradient(0,0,0,0,0,size*r);
  maria.addColorStop(0,'#829eaa25');maria.addColorStop(1,'#829eaa00');
  ctx.fillStyle=maria;ctx.fillRect(-size*r,-size*r,size*r*2,size*r*2);ctx.restore();
 }
}
function drawWinterSky(yaw,pitch,time,project){
 const ctx=skyContext,w=skyFrame.width,h=skyFrame.height;
 const focal=850*.94*skyFrame.scale;
 const horizon=Math.min(h*.81,skyFrame.top+project([600*Math.sin(yaw),450,-600*Math.cos(yaw)]).y*skyFrame.scale+24);
 // Use the same world-to-camera rotation, focal length and origin as the tree.
 const moonPoint=project(MOON_POSITION);
 const moonX=w/2+(moonPoint.x-renderWidth/2)*skyFrame.scale;
 const moonY=skyFrame.top+moonPoint.y*skyFrame.scale;
 const moonDepth=850-moonPoint.z;
 // A modest art-direction enlargement preserves the distant camera behaviour.
 const moonRadius=MOON_RADIUS*focal/moonDepth*1.85;
 const moonVisible=moonDepth>0&&moonX+moonRadius>0&&moonX-moonRadius<w&&moonY+moonRadius>0&&moonY-moonRadius<horizon;
 const sky=ctx.createLinearGradient(0,0,0,h);
 sky.addColorStop(0,'#07172f');sky.addColorStop(.53,'#193451');sky.addColorStop(1,'#617c95');
 ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 // Paint beneath the atmospheric wisps and ridges, as part of the sky background.
 if(moonVisible)drawDistantMoon(ctx,moonX,moonY,moonRadius);

 drawCelestialAtmosphere(ctx,w,h,focal,skyFrame.top+460*skyFrame.scale,yaw,pitch);

 for(const star of nightStars){
  const elevation=star.height*SKY_ALTITUDE,distance=1e10;
  const point=project([Math.sin(star.azimuth)*Math.cos(elevation)*distance,210-Math.sin(elevation)*distance,-Math.cos(star.azimuth)*Math.cos(elevation)*distance]);
  if(point.z>=850)continue;
  const x=w/2+(point.x-renderWidth/2)*skyFrame.scale,y=skyFrame.top+point.y*skyFrame.scale;
  if(x<0||x>w||y<0||y>horizon-25)continue;
  if(moonVisible&&Math.hypot(x-moonX,y-moonY)<moonRadius*1.3)continue;
  ctx.globalAlpha=star.brightness*(.7+.3*(.5+.5*Math.sin(time/star.period+star.phase)));
  if(star.r>1.3){
   const halo=ctx.createRadialGradient(x,y,0,x,y,star.r*4);
   halo.addColorStop(0,'#dce9ff55');halo.addColorStop(1,'#dce9ff00');
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,star.r*4,0,TAU);ctx.fill();
  }
  ctx.fillStyle=star.color;ctx.beginPath();ctx.arc(x,y,star.r,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 const moonAzimuth=Math.atan2(MOON_POSITION[0],-MOON_POSITION[2]);
 for(let layer=0;layer<3;layer++){
  const baseline=horizon+layer*17,amplitude=(layer===0?103:layer===1?83:58)*Math.min(1,h/760);
  const ridge=[];
  for(let x=-30;x<=w+30;x+=24){
   const angle=yaw+Math.atan((x-w/2)/focal);
   const shape=.28+.4*Math.abs(Math.sin(angle*(5+layer)+layer*1.3))+.2*Math.abs(Math.sin(angle*13+layer*.8))+.1*Math.sin(angle*23);
   ridge.push({x,y:baseline-amplitude*shape,angle});
  }
  ctx.beginPath();ctx.moveTo(-30,h);for(const point of ridge)ctx.lineTo(point.x,point.y);ctx.lineTo(w+30,h);ctx.closePath();
  ctx.fillStyle=['#526d87','#3b5974','#294760'][layer];ctx.fill();
  // Snow catches a fixed direction of moonlight along each ridge.
  for(let i=1;i<ridge.length;i++){
   const a=ridge[i-1],b=ridge[i],illumination=.5+.5*Math.cos((a.angle+b.angle)/2-moonAzimuth);
   const depth=(layer===0?14:10)*(1-Math.min(1,Math.abs(b.y-a.y)/55));
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y+depth*.6);ctx.lineTo((a.x+b.x)/2,(a.y+b.y)/2+depth);ctx.closePath();
   ctx.fillStyle='rgba(210,230,244,'+(.08+illumination*.16)+')';ctx.fill();
  }
 }
 const mist=ctx.createLinearGradient(0,horizon-28,0,horizon+90);
 mist.addColorStop(0,'#b7ccde00');mist.addColorStop(.55,'#aec6d62b');mist.addColorStop(1,'#dce7ef00');
 ctx.fillStyle=mist;ctx.fillRect(0,horizon-28,w,120);
}

let lastDraw=0,lightStarted=0,wasLit=false;
const prefersStill=matchMedia('(prefers-reduced-motion:reduce)');
function renderTree(time){
 requestAnimationFrame(renderTree);
 if(document.hidden||time-lastDraw<32)return;
 lastDraw=time;
 if(app.classList.contains('auto')&&!prefersStill.matches){
  treeView.ry=-12+Math.sin(time/11000)*12;treeView.rx=-8+Math.sin(time/16000)*2;
 }
 const lit=app.classList.contains('lit');
 if(lit&&!wasLit)lightStarted=time;
 wasLit=lit;
 const yaw=treeView.ry*Math.PI/180,pitch=-treeView.rx*Math.PI/180;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
 function project(point){
  const [x,rawY,z]=point,y=rawY-210;
  const xx=x*cy+z*sy,zz=-x*sy+z*cy;
  const yy=y*cx-zz*sx,depth=y*sx+zz*cx;
  const scale=.94*850/(850-depth);
  return {x:renderWidth/2+xx*scale,y:460+yy*scale,z:depth,scale};
 }
 const drawList=[];
 for(let i=0;i<keepsakes.length;i++)keepsakes[i].bob=prefersStill.matches?0:Math.sin(time/1450+i*1.6)*3.5;
 for(const face of mesh){
  const bob=face.owner===undefined?0:keepsakes[face.owner].bob;
  const points=face.points.map(p=>project([p[0],p[1]+bob,p[2]]));
  const a=points[0],b=points[1],c=points[2];
  if(!face.paintColor){
  const original=face.points,ax=original[1][0]-original[0][0],ay=original[1][1]-original[0][1],az=original[1][2]-original[0][2];
  const bx=original[2][0]-original[0][0],by=original[2][1]-original[0][1],bz=original[2][2]-original[0][2];
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  if((face.kind==='leaf'||face.kind==='wood')&&nx*(original[0][0]+original[1][0]+original[2][0])+nz*(original[0][2]+original[1][2]+original[2][2])<0){nx=-nx;ny=-ny;nz=-nz;}
  if(face.owner!==undefined){
   const center=keepsakes[face.owner].point;
   if(nx*(original[0][0]-center[0])+ny*(original[0][1]-center[1])+nz*(original[0][2]-center[2])<0){nx=-nx;ny=-ny;nz=-nz;}
  }
  const length=Math.hypot(nx,ny,nz)||1;nx/=length;ny/=length;nz/=length;
  // The visible moon, face lighting and ground-shadow rays use one world-space source.
  const center=original[0].map((value,axis)=>(value+original[1][axis]+original[2][axis])/3);
  const light=MOON_POSITION.map((value,axis)=>value-center[axis]),lightLength=Math.hypot(...light)||1;
  const diffuse=Math.max(0,(nx*light[0]+ny*light[1]+nz*light[2])/lightLength);
  const brightness=face.owner!==undefined?.82+diffuse*.85:face.kind==='shadow'?1:(face.kind==='snow'||face.kind==='terrain')?.94+diffuse*.065:face.kind==='star'?.7+diffuse*.45:.66+diffuse*1.12;
   face.paintColor='rgb('+face.color.map(v=>Math.min(255,Math.round(v*brightness))).join(',')+')';
  }
  drawList.push({kind:'face',points,z:(a.z+b.z+c.z)/3,color:face.paintColor,owner:face.owner,star:face.kind==='star',snow:face.kind==='snow'||face.kind==='terrain',terrain:face.kind==='terrain',shadow:face.kind==='shadow'});
 }
 for(const item of decorations){
  if(item.points){const points=item.points.map(project);drawList.push({...item,points,z:(points[0].z+points[1].z)/2});}
  else{const point=project(item.point);drawList.push({...item,point,z:point.z});}
 }
 
 for(let owner=0;owner<keepsakes.length;owner++){
  const item=keepsakes[owner],p=project([item.point[0],item.point[1]+item.bob,item.point[2]]),element=item.element;
  const blocked=drawList.some(face=>face.kind==='face'&&!face.terrain&&!face.shadow&&face.owner!==owner&&face.z>p.z+4&&pointInTriangle(p,face.points));
  const visible=lit&&!blocked&&p.z<780;
  if(lit)drawList.push({kind:'aura',point:p,z:p.z-24,r:item.radius,color:item.glow});
  element.style.left=(150+p.x-renderWidth/2)+'px';
  element.style.top=(p.y-260)+'px';
  element.style.visibility=visible?'visible':'hidden';element.tabIndex=visible?0:-1;
 }
 appendSpatialWish(drawList,project,time);

 const paintGroup=item=>item.terrain?0:item.shadow?1:2;
 drawList.sort((a,b)=>paintGroup(a)-paintGroup(b)||a.z-b.z);
 const ctx=treeContext;ctx.clearRect(0,0,renderWidth,renderHeight);
 drawWinterSky(yaw,pitch,time,project);
 
 const theme=songSelect.value;
 const lampColor=theme==='sugarplum'?'#c3eaff':theme==='wewish'?'#ffe0b3':'#ffe49a';
 let meshShadowsPainted=false;
 for(const item of drawList){
  if(!meshShadowsPainted&&!item.terrain&&!item.shadow){drawMeshShadows(ctx,project,time);meshShadowsPainted=true;}
  if(item.kind==='wish-text'){
   const [a,b,c,d]=item.points;
   ctx.save();ctx.globalAlpha=item.alpha;
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.clip();
   ctx.transform(b.x-a.x,b.y-a.y,d.x-a.x,d.y-a.y,a.x,a.y);
   ctx.drawImage(item.texture,item.sourceX,0,item.sourceWidth||50,item.texture.height,0,0,1,1);ctx.restore();
  }else if(item.kind==='aura'){
   const p=item.point,r=item.r*Math.abs(p.scale)*2.1;
   const glow=ctx.createRadialGradient(p.x,p.y,r*.15,p.x,p.y,r);
   glow.addColorStop(0,'rgba('+item.color.join(',')+',.15)');glow.addColorStop(.5,'rgba('+item.color.join(',')+',.065)');glow.addColorStop(1,'rgba('+item.color.join(',')+',0)');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();
  }else if(item.kind==='face'){
   ctx.beginPath();ctx.moveTo(item.points[0].x,item.points[0].y);ctx.lineTo(item.points[1].x,item.points[1].y);ctx.lineTo(item.points[2].x,item.points[2].y);ctx.closePath();
   ctx.fillStyle=item.color;ctx.fill();if(item.snow){ctx.strokeStyle=item.color;ctx.lineWidth=.8;ctx.stroke();}
  }else if(item.points){
   ctx.beginPath();ctx.moveTo(item.points[0].x,item.points[0].y);ctx.lineTo(item.points[1].x,item.points[1].y);
   ctx.strokeStyle=item.kind==='needle'?'#b0d99b18':lit?'#e5c785b3':'#9c80594d';
   ctx.lineWidth=item.kind==='needle'?.65:1.3;ctx.stroke();
  }else{
   const p=item.point,r=item.r*p.scale;
   const on=lit&&(prefersStill.matches||time-lightStarted>(3-item.tier)*280);
   if(item.kind==='lamp'){
    if(on){
     const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*5);
     glow.addColorStop(0,lampColor+'b3');glow.addColorStop(.2,lampColor+'55');glow.addColorStop(1,lampColor+'00');
     ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,r*5,0,TAU);ctx.fill();
    }
    ctx.fillStyle=on?'#fff5cf':'#bda974';
   }else{
    const shine=ctx.createRadialGradient(p.x-r*.35,p.y-r*.4,r*.1,p.x,p.y,r);
    shine.addColorStop(0,'#fff3d9');shine.addColorStop(.22,item.color);shine.addColorStop(1,'#412b28');ctx.fillStyle=shine;
    ctx.fillRect(p.x-1,p.y-r-2,2,3);
   }
   ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();
  }
 }
 if(lit){
  const p=project([0,-10,0]),glow=ctx.createRadialGradient(p.x,p.y,3,p.x,p.y,36);
  glow.addColorStop(0,'#ffe1a331');glow.addColorStop(1,'#ffe1a300');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,36,0,TAU);ctx.fill();
 }
}
requestAnimationFrame(renderTree);
