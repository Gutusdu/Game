let client=null, channel=null, room='', player=1, connected=false;
const statusEl=document.getElementById('status');
const codeEl=document.getElementById('code');
const qs=new URLSearchParams(location.search);
if(qs.get('player')==='2') player=2;
function setStatus(t){if(statusEl)statusEl.textContent=t}
let koState=null,koTimer=null,submissionState=null;
function showKO(payload){koState={hits:0,total:10,difficulty:Math.max(.28,Math.min(1,payload.difficulty||.3)),active:true};const el=document.getElementById('koGame');el.style.display='flex';nextKOButton();}
function nextKOButton(){if(!koState||!koState.active)return;const b=document.getElementById('koTarget');b.style.left=(8+Math.random()*74)+'%';b.style.top=(12+Math.random()*68)+'%';b.textContent=['TAP!','HIT!','GO!','WAKE!'][Math.floor(Math.random()*4)];const life=Math.max(360,1450*(1-koState.difficulty));clearTimeout(koTimer);koTimer=setTimeout(()=>{if(koState&&koState.active)nextKOButton()},life);}
function tapKO(){if(!koState||!koState.active)return;koState.hits++;document.getElementById('koCount').textContent=koState.hits+' / 10';if(koState.hits>=10){koState.active=false;clearTimeout(koTimer);document.getElementById('koGame').style.display='none';send({type:'koescape'});setStatus('YOU GOT UP!');}else nextKOButton();}
function showSubmission(payload){koState=null;clearTimeout(koTimer);document.getElementById('koGame').style.display='none';submissionState={active:true};const el=document.getElementById('submissionGame');el.style.display='flex';document.getElementById('submissionTitle').textContent=payload.attacker===player?'FINISH THE SUBMISSION!':'ESCAPE! TAP FAST!';document.getElementById('submissionRole').textContent=payload.attacker===player?'YOU ARE THE ATTACKER':'YOU ARE DEFENDING';document.getElementById('submissionButton').textContent='TAP!';}
function hideSubmission(payload){submissionState=null;document.getElementById('submissionGame').style.display='none';setStatus(payload.attackerWins?(payload.attacker===player?'SUBMISSION WIN':'SUBMISSION LOST'):(payload.defender===player?'ESCAPED!':'SUBMISSION FAILED'));}
function configValue(){return window.CAGE_CONFIG||window.GAME_CONFIG||window.CONFIG||{}}
function setupClient(){
 const c=configValue();
 const url=c.supabaseUrl||c.SUPABASE_URL||c.url;
 const key=c.supabaseKey||c.SUPABASE_PUBLISHABLE_KEY||c.SUPABASE_ANON_KEY||c.key;
 if(!window.supabase||!url||!key)return false;
 client=window.supabase.createClient(url,key); return true;
}
function send(payload){
 if(!channel||!connected)return;
 channel.send({type:'broadcast',event:player===2?'controller2':'controller',payload:{...payload,player,ts:Date.now()}});
}
async function connectRoom(){
 room=(codeEl.value||'').trim().toUpperCase();
 if(!room){setStatus('ENTER ROOM CODE');return}
 if(!client&&!setupClient()){setStatus('CONFIG ERROR');return}
 if(channel){try{await client.removeChannel(channel)}catch(e){} channel=null}
 connected=false;setStatus('CONNECTING…');
 channel=client.channel('cage-room-'+room);
 channel.on('broadcast',{event:'ko'},({payload})=>{if(payload&&payload.player===player)showKO(payload)});
 channel.on('broadcast',{event:'submission'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player))showSubmission(payload)});
 channel.on('broadcast',{event:'submissionEnd'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player))hideSubmission(payload)});
 channel.on('broadcast',{event:'koend'},({payload})=>{if(payload&&payload.player===player){if(koState)koState.active=false;document.getElementById('koGame').style.display='none';setStatus('KNOCKOUT · FIGHT OVER')}});
 channel.subscribe(s=>{
  if(s==='SUBSCRIBED'){connected=true;setStatus(player===2?'CONNECTED · P2':'CONNECTED · P1');send({type:'hello'});}
  else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'){connected=false;setStatus('CONNECTION ERROR')}
 });
}
document.getElementById('connect').addEventListener('click',connectRoom);
codeEl.addEventListener('keydown',e=>{if(e.key==='Enter')connectRoom()});
function actionDown(a){
 if(a==='blockHigh'||a==='blockLow')send({type:'block',down:true,level:a==='blockHigh'?'high':'low'});
 else send({type:'action',action:a});
}
function actionUp(a){
 if(a==='blockHigh'||a==='blockLow')send({type:'block',down:false,level:a==='blockHigh'?'high':'low'});
}
['jab','hook','upper','highkick','lowkick','ground','blockHigh','blockLow'].forEach(id=>{
 const el=document.getElementById(id),a=({upper:'uppercut',highkick:'highKick',lowkick:'lowKick',blockHigh:'blockHigh',blockLow:'blockLow'})[id]||id;
 el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);el.classList.add('active');actionDown(a)});
 const release=e=>{e.preventDefault();el.classList.remove('active');actionUp(a)};
 el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
});
const joy=document.getElementById('joy'),nub=document.getElementById('nub');let joyActive=false,joyPointer=null,lastX=0,lastY=0;
function moveJoy(e){
 const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=(e.clientX-cx)/(r.width*.34),dy=(e.clientY-cy)/(r.height*.34);
 const mag=Math.hypot(dx,dy);if(mag>1){dx/=mag;dy/=mag}
 lastX=Math.round(dx*100)/100;lastY=Math.round(dy*100)/100;
 nub.style.transform=`translate(${dx*112}%,${dy*112}%)`;
 send({type:'move',x:lastX,y:lastY});
}
function stopJoy(){joyActive=false;nub.style.transform='';lastX=lastY=0;send({type:'move',x:0,y:0})}
joy.addEventListener('pointerdown',e=>{e.preventDefault();joyActive=true;joyPointer=e.pointerId;try{joy.setPointerCapture(e.pointerId)}catch(_){}moveJoy(e)});
joy.addEventListener('pointermove',e=>{if(joyActive&&e.pointerId===joyPointer){e.preventDefault();moveJoy(e)}});
joy.addEventListener('pointerup',e=>{if(e.pointerId===joyPointer){e.preventDefault();stopJoy();joyPointer=null}});
joy.addEventListener('pointercancel',()=>{stopJoy();joyPointer=null});
joy.addEventListener('lostpointercapture',()=>{if(joyActive){stopJoy();joyPointer=null}});

document.getElementById('koTarget').addEventListener('pointerdown',e=>{e.preventDefault();tapKO()});document.getElementById('submissionButton').addEventListener('pointerdown',e=>{e.preventDefault();if(submissionState&&submissionState.active)send({type:'submitTap'});});
window.addEventListener('blur',()=>{send({type:'block',down:false,level:'high'});send({type:'block',down:false,level:'low'});send({type:'move',x:0,y:0});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){send({type:'block',down:false,level:'high'});send({type:'block',down:false,level:'low'});send({type:'move',x:0,y:0});}});
