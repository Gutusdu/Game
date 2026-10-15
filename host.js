(() => {
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d');
const cfg=window.CAGE_CONFIG||{};
const spriteFrames={red:{},blue:{}};
const animCounts={idle:4,jab:5,hook:5,uppercut:5,highkick:5,lowkick:5,blockhigh:4,blocklow:4,walkdown:4,walkup:4,walkleft:5,walkright:4,ko:6,getup:6};
function loadAnimations(color){
 for(const [name,count] of Object.entries(animCounts)){
  spriteFrames[color][name]=[];
  for(let i=0;i<count;i++){
   const img=new Image();
   img.src=`${color}_${name}_${i}.png`;
   spriteFrames[color][name].push(img);
  }
 }
}
loadAnimations('red');loadAnimations('blue');
let client=null,channel=null,room='',connected=false;const arenaArt=new Image();arenaArt.src='arena.png?v=5';

const roster={
 blaze:{name:'BLAZE',color:'#4bbef2',dark:'#176b96',speed:1,damage:1,stamina:1},
 tank:{name:'TANK',color:'#f0a34a',dark:'#9b4d1d',speed:.84,damage:1.22,stamina:1.08},
 flash:{name:'FLASH',color:'#8fe36a',dark:'#397b32',speed:1.2,damage:.83,stamina:.94},
 viper:{name:'VIPER',color:'#bd91ff',dark:'#64439a',speed:1.02,damage:.94,stamina:1.18}
};
let playerPick='blaze',enemyPick='viper',gameMode='ai',p1Connected=false,p2Connected=false;let playerName='PLAYER 1',enemyName='RIVAL AI';const blood=[];let animClock=0;
const state={p:{x:310,y:270,h:100,head:100,body:100,s:100,face:1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0},e:{x:590,y:270,h:100,head:100,body:100,s:100,face:-1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0},move:{x:0,y:0},msg:'CHOOSE YOUR FIGHTER',msgT:5,ended:false,last:0,shake:0,round:1,roundTime:180,breakTime:0,fightActive:false};
function size(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.floor(r.width*Math.min(devicePixelRatio||1,2)));canvas.height=Math.max(1,Math.floor(r.height*Math.min(devicePixelRatio||1,2)));ctx.setTransform(canvas.width/900,0,0,canvas.height/520,0,0)}window.addEventListener('resize',size);size();
function say(t){state.msg=t;state.msgT=1}
function ready(){if(!cfg.SUPABASE_PUBLISHABLE_KEY||cfg.SUPABASE_PUBLISHABLE_KEY.includes('PASTE_')){alert('Open config.js and paste your Supabase publishable key first.');return false}if(!window.supabase){alert('Could not load Supabase client. Check internet connection.');return false}if(!client)client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);return true}
async function createRoom(){if(!ready())return;if(channel){await client.removeChannel(channel);channel=null}room=Math.random().toString(36).slice(2,7).toUpperCase();connected=false;p1Connected=false;p2Connected=false;channel=client.channel('cage-room-'+room,{config:{broadcast:{self:false}}});
channel.on('broadcast',{event:'controller'},({payload})=>handleController(payload,1));
channel.on('broadcast',{event:'controller2'},({payload})=>handleController(payload,2));
channel.subscribe(status=>{if(status==='SUBSCRIBED'){connected=true;$('netstatus').textContent='Room ready';$('roomCode').style.display='block';$('roomCode').textContent=room;$('roomlabel').textContent='ROOM CODE: '+room;$('lobbyStatus').textContent='Room created. Connect your phone controller.';$('createRoomBtn').textContent='NEW ROOM';say('ROOM '+room);}});
}
function handleController(payload,slot){if(!payload)return;if(payload.type==='hello'){if(slot===1)p1Connected=true;else p2Connected=true;updateLobby();return}if(slot===2&&gameMode!=='human')return;const f=slot===1?state.p:state.e;if(payload.type==='move'){if(slot===1){state.move.x=payload.x||0;state.move.y=payload.y||0}else{state.move2={x:payload.x||0,y:payload.y||0}}}else if(payload.type==='koescape'){const f=slot===1?state.p:state.e;if(f.ko&&!state.ended){f.ko=false;f.koTimer=0;f.koHits=10;f.stun=0;f.act='getup';f.actT=.8;f.cool=1;f.h=Math.max(1,(f.head*.55+f.body*.45));say('BACK ON YOUR FEET!')}}else if(payload.type==='action')action(payload.action,slot);else if(payload.type==='block'){f.guard=!!payload.down;f.guardLevel=payload.level||'high';}}
function updateLobby(){const readyToStart=gameMode==='ai'?p1Connected:(p1Connected&&p2Connected);$('startFightBtn').disabled=!readyToStart;$('lobbyStatus').textContent=gameMode==='ai'?(p1Connected?'Controller connected — ready to fight.':'Waiting for player 1 controller…'):(p1Connected&&p2Connected?'Both controllers connected — ready to fight.':`Waiting for controllers: P1 ${p1Connected?'connected':'waiting'}, P2 ${p2Connected?'connected':'waiting'}`);}
$('createRoomBtn').onclick=createRoom;
$('playerName').addEventListener('input',e=>{playerName=e.target.value.trim().slice(0,14)||'PLAYER 1'});$('enemyName').addEventListener('input',e=>{enemyName=e.target.value.trim().slice(0,14)||'RIVAL AI'});$('startFightBtn').onclick=()=>{if($('startFightBtn').disabled)return;state.ended=false;state.fightActive=true;state.round=1;state.roundTime=180;state.breakTime=0;state.p={x:310,y:270,h:100,head:100,body:100,s:100,face:1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0};state.e={x:590,y:270,h:100,head:100,body:100,s:100,face:-1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0};state.move={x:0,y:0};state.move2={x:0,y:0};$('overlay').classList.add('hidden');$('restart').textContent='RESTART FIGHT';say('FIGHT!');};
$('restart').onclick=()=>{state.ended=false;state.fightActive=true;state.round=1;state.roundTime=180;state.breakTime=0;state.p={x:310,y:270,h:100,head:100,body:100,s:100,face:1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0};state.e={x:590,y:270,h:100,head:100,body:100,s:100,face:-1,guard:false,act:'',actT:0,cool:0,stun:0,flash:0};state.move={x:0,y:0};state.move2={x:0,y:0};$('overlay').classList.add('hidden');say('FIGHT RESTARTED');};
$('fullscreen').onclick=()=>{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});};
document.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>{gameMode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b===btn));$('enemyRoster').style.display=gameMode==='ai'?'grid':'none';$('opponentLabel').style.display=gameMode==='ai'?'block':'none';$('enemyNameLabel').style.display=gameMode==='ai'?'block':'none';$('enemyName').style.display=gameMode==='ai'?'block':'none';$('lobbyStatus').textContent=gameMode==='ai'?'AI opponent selected. Create a room and connect one phone.':'Human versus human: connect two phones, one as player 1 and one as player 2.';updateLobby();});

function send(event,payload){if(channel&&connected)channel.send({type:'broadcast',event,payload})}
const costs={jab:7,hook:18,uppercut:20,highKick:28,lowKick:23,ground:24},dmg={jab:2,hook:3.5,uppercut:4,highKick:7,lowKick:4,ground:3},dur={jab:.24,hook:.43,uppercut:.42,highKick:.5,lowKick:.42,ground:.55};
function action(type,slot=1){let p=slot===1?state.p:state.e;if(state.ended||p.ko)return;if(type==='dodge'){if(p.s<11)return;p.s-=11;p.x+=p.face*-20;p.flash=.08;say('DODGE!');return}if(!costs[type]||p.cool>0||p.actT>0||p.s<costs[type])return;p.s-=costs[type];p.act=type;p.actT=dur[type];p.cool={jab:.18,hook:.44,uppercut:.48,highKick:.62,lowKick:.48,ground:.7}[type];p._hit=false;say(type.toUpperCase()+'!')}
function hit(a,d,type){if(d.guard){d.s=Math.max(0,d.s-5);a.s=Math.max(0,a.s-3);say('BLOCKED!');return}if(d.flash>0||d.ko)return;
 const headHit=['jab','hook','uppercut','highKick'].includes(type),bodyHit=['lowKick','ground'].includes(type);
 const base=(dmg[type]||3)*(a===state.p?roster[playerPick].damage:roster[enemyPick].damage);
 const target=headHit?'head':'body'; let hp=d[target];
 // Critical chance scales with damage to the relevant target, attack type and remaining stamina.
 let chance=.015+(100-hp)*.003+(100-a.s)*.0004;
 if(type==='jab')chance+=headHit?.015:0;if(type==='hook')chance+=.025;if(type==='uppercut')chance+=.04;
 if(type==='highKick')chance+=.03;if(type==='lowKick')chance+=.015;
 chance=Math.max(.01,Math.min(.55,chance)); const crit=Math.random()<chance;
 d[target]=Math.max(0,d[target]-base*(crit?1.5:1));
 if(bodyHit)d.s=Math.max(0,d.s-(8+(100-d.body)*.04));else d.s=Math.max(0,d.s-5);
 d.h=Math.max(0,(d.head*.55+d.body*.45));d.flash=.14;state.shake=crit?8:3;
 if(crit){for(let i=0;i<18;i++){const ang=Math.random()*Math.PI*2,spd=45+Math.random()*155;blood.push({x:d.x+(d.face||1)*9,y:d.y-26,vx:Math.cos(ang)*spd-(a.face*35),vy:Math.sin(ang)*spd-45,life:.38+Math.random()*.45,r:2+Math.random()*3});}d.stun=Math.max(d.stun,.24);say('CRITICAL!');}else say(type.toUpperCase()+' HIT');
 // Knockdowns should be rare early and become likely only when the relevant region is badly damaged.
 let koChance=0;
 if(headHit){
   koChance=Math.pow((100-d.head)/100,2)*.20;
   if(type==='hook')koChance+=.012;
   if(type==='uppercut')koChance+=.025;
   if(type==='highKick')koChance+=.02;
 }
 if(type==='lowKick')koChance=Math.pow((100-d.body)/100,2)*.25+(100-d.s)*.0002;
 if(type==='ground')koChance=Math.pow((100-d.body)/100,2)*.16;
 if(d.head<=0&&headHit)koChance=1;
 if(type==='lowKick'&&d.body<=10)koChance=Math.max(koChance,.80);
 if(d.body<=0&&bodyHit)koChance=Math.max(koChance,.85);
 if(d.h<=0)koChance=1;
 if(Math.random()<Math.min(1,koChance)){beginKO(d,a);}
}
function beginKO(victim,attacker){if(victim.ko||state.ended)return;victim.ko=true;victim.koTimer=10;victim.koHits=0;victim.koDifficulty=Math.max(.28,1-Math.max(victim.head,victim.body)/115);victim.actT=0;victim.guard=false;victim.stun=10;state.msg='KNOCKDOWN!';state.msgT=2;send('ko',{player:victim===state.p?1:2,difficulty:victim.koDifficulty,hits:10});}
function send(event,payload){if(channel&&connected)channel.send({type:'broadcast',event,payload})}
function update(dt){animClock+=dt;const p=state.p,e=state.e;if(state.ended)return;if(state.fightActive){if(state.breakTime>0){state.breakTime-=dt;if(state.breakTime<=0){state.round++;state.roundTime=180;say('ROUND '+state.round+' — FIGHT!');} }else{state.roundTime-=dt;if(state.roundTime<=0){state.roundTime=0;if(state.round<3){state.breakTime=3;say('ROUND '+state.round+' OVER');}else{state.ended=true;state.fightActive=false;const ps=state.p.head+state.p.body,es=state.e.head+state.e.body;state.msg=ps===es?'DRAW!':(ps>es?'DECISION — YOU WIN!':'DECISION — YOU LOSE!');state.msgT=99;$('netstatus').textContent='Fight over';return;}}}}if(!state.fightActive||state.breakTime>0)return;for(const f of [p,e]){if(f.ko){f.koTimer-=dt;if(f.koTimer<=0){state.ended=true;state.fightActive=false;state.msg=(f===state.p?'YOU LOSE!':'YOU WIN!');state.msgT=99;$('netstatus').textContent='Fight over';send('koend',{player:f===state.p?1:2});return}}}for(const f of [p,e]){f.cool=Math.max(0,f.cool-dt);f.actT=Math.max(0,f.actT-dt);f.stun=Math.max(0,f.stun-dt);f.flash=Math.max(0,f.flash-dt);f.s=Math.min(100,f.s+14*(f===p?roster[playerPick].stamina:roster[enemyPick].stamina)*dt)}p.face=e.x>=p.x?1:-1;e.face=p.x>=e.x?1:-1;p.x+=state.move.x*190*roster[playerPick].speed*(.62+.38*p.body/100)*dt;p.y+=state.move.y*190*roster[playerPick].speed*(.62+.38*p.body/100)*dt;
let dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy)||1;if(gameMode==='ai'){e.x+=dx/dist*92*roster[enemyPick].speed*(.62+.38*e.body/100)*dt;e.y+=dy/dist*92*roster[enemyPick].speed*(.62+.38*e.body/100)*dt;}else{e.x+=(state.move2?.x||0)*190*roster[enemyPick].speed*(.62+.38*e.body/100)*dt;e.y+=(state.move2?.y||0)*190*roster[enemyPick].speed*(.62+.38*e.body/100)*dt;}if(gameMode==='ai'&&dist<88&&e.cool<=0&&e.actT<=0&&e.s>12){let r=Math.random();let type=r<.4?'jab':r<.68?'hook':r<.85?'lowKick':'highKick';e.s-=({jab:7,hook:18,lowKick:23,highKick:28})[type];e.act=type;e.actT=({jab:.24,hook:.43,lowKick:.42,highKick:.5})[type];e.cool=({jab:.5,hook:1,lowKick:1,highKick:1.2})[type];e._hit=false;e.guard=Math.random()<.24}
for(const f of [p,e]){f.x=Math.max(145,Math.min(755,f.x));f.y=Math.max(105,Math.min(415,f.y));if(f.actT>0&&f.actT<({jab:.12,hook:.24,uppercut:.23,highKick:.28,lowKick:.24,ground:.3})[f.act]&&!f._hit){f._hit=true;let o=f===p?e:p;let dd=Math.hypot(o.x-f.x,o.y-f.y),reach=({jab:70,hook:72,uppercut:70,highKick:105,lowKick:98,ground:62})[f.act];if(dd<reach&&Math.abs(o.y-f.y)<(['highKick','lowKick'].includes(f.act)?58:43)&&((o.x-f.x)*f.face>-4))hit(f,o,f.act)}if(f.actT===0)f._hit=false}
state.msgT=Math.max(0,state.msgT-dt);state.shake=Math.max(0,state.shake-dt*20);for(let i=blood.length-1;i>=0;i--){const b=blood[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=220*dt;b.life-=dt;if(b.life<=0)blood.splice(i,1);}const clock=$('fightClock');if(clock){const secs=Math.ceil(state.roundTime);clock.textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');$('roundLabel').textContent='ROUND '+state.round+' / 3';} $('pst').style.width=p.s+'%';$('est').style.width=e.s+'%';$('phead').style.width=p.head+'%';$('pbody').style.width=p.body+'%';$('ehead').style.width=e.head+'%';$('ebody').style.width=e.body+'%';}
function poly(cx,cy,rx,ry,n,rot=-Math.PI/8){let a=[];for(let i=0;i<n;i++){let t=rot+i*Math.PI*2/n;a.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry])}return a}
function path(a){ctx.beginPath();a.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath()}
function draw(){ctx.save();if(state.shake)ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);ctx.fillStyle='#111920';ctx.fillRect(0,0,900,520);if(arenaArt.complete&&arenaArt.naturalWidth){ctx.drawImage(arenaArt,0,0,900,520);}else{ctx.fillStyle='#202832';ctx.fillRect(0,0,900,520);}for(const [f,pl] of [[state.p,true],[state.e,false]].sort((a,b)=>a[0].y-b[0].y))fighter(f,pl);for(const b of blood){ctx.globalAlpha=Math.min(1,b.life*2.5);ctx.fillStyle='#e51b32';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}for(const f of [state.p,state.e])if(f.ko){ctx.fillStyle='#000c';ctx.fillRect(310,92,280,64);ctx.fillStyle='#ff5364';ctx.font='1000 22px system-ui';ctx.textAlign='center';ctx.fillText('KNOCKDOWN',450,118);ctx.fillStyle='#fff';ctx.font='1000 26px system-ui';ctx.fillText(Math.max(0,f.koTimer).toFixed(1)+'s',450,145)}if(state.msgT>0){ctx.fillStyle='#000b';ctx.fillRect(290,42,320,40);ctx.fillStyle='#ffd166';ctx.font='1000 19px system-ui';ctx.textAlign='center';ctx.fillText(state.msg,450,68)}ctx.restore()}
function fighter(f,pl){
 const bank=pl?spriteFrames.red:spriteFrames.blue;
 const mx=pl?state.move.x:(state.move2?.x||0),my=pl?state.move.y:(state.move2?.y||0);
 const moving=Math.abs(mx)+Math.abs(my)>.05;
 let anim='idle';
 if(f.ko|| (state.ended&&f.h<=0)) anim='ko';
 else if(f.stun>0||f.flash>0) anim='idle';
 else if(f.guard) anim=f.guardLevel==='low'?'blocklow':'blockhigh';
 else if(f.actT>0){
  const map={jab:'jab',hook:'hook',uppercut:'uppercut',highKick:'highkick',lowKick:'lowkick',ground:'lowkick'};
  anim=map[f.act]||'idle';
 }else if(moving){
  if(Math.abs(mx)>Math.abs(my))anim=mx<0?'walkleft':'walkright';
  else anim=my<0?'walkup':'walkdown';
 }
 const frames=bank[anim]||bank.idle||[];
 let col=0;
 const count=frames.length||1;
 if(anim==='idle')col=Math.floor(animClock*3)%count;
 else if(anim.startsWith('walk'))col=Math.floor(animClock*8)%count;
 else if(anim==='ko')col=Math.min(count-1,Math.floor((animClock%3)*2));
 else if(f.actT>0){const durMap={jab:.24,hook:.43,uppercut:.42,highKick:.5,lowKick:.42,ground:.55};const progress=1-f.actT/(durMap[f.act]||.3);col=Math.max(0,Math.min(count-1,Math.floor(progress*count)));}
 else col=Math.floor(animClock*5)%count;
 const frame=frames[col];
 ctx.save();ctx.translate(f.x,f.y);
 ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,9,21,6,0,0,Math.PI*2);ctx.fill();
 if(frame&&frame.complete&&frame.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(frame,-43,-84,86,98);}
 else {ctx.fillStyle=pl?'#c52232':'#1977df';ctx.fillRect(-12,-22,24,30);}
 ctx.restore();
 ctx.fillStyle='#f6f8fa';ctx.strokeStyle='#0b1015';ctx.lineWidth=3;ctx.font='900 12px system-ui';ctx.textAlign='center';
 ctx.strokeText(pl?playerName:enemyName,f.x,f.y-105);ctx.fillText(pl?playerName:enemyName,f.x,f.y-105);

}
document.querySelectorAll('[data-roster]').forEach(btn=>btn.addEventListener('click',()=>{const group=btn.dataset.roster,id=btn.dataset.id;if(group==='player')playerPick=id;else enemyPick=id==='random'?['blaze','tank','flash','viper'][Math.floor(Math.random()*4)]:id;document.querySelectorAll('[data-roster="'+group+'"]').forEach(b=>b.classList.toggle('selected',b===btn));if(group==='enemy'&&id==='random'){document.querySelectorAll('[data-roster="enemy"]').forEach(b=>b.classList.toggle('selected',b.dataset.id==='random'));} }));
function frame(ts){let dt=Math.min(.035,(ts-state.last)/1000||0);state.last=ts;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();