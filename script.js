/* Настройки Supabase (инструкция в README.md). Пока поля пустые, опрос работает в демо-режиме. */
const CFG={url:"",key:""};
const OPT=["Максимальная свобода распространения религиозной информации, минимальное вмешательство государства.","Ограничение только тех материалов, которые содержат реальные призывы к насилию, терроризму и экстремизму.","Более строгий государственный контроль религиозного контента для предотвращения радикализации.","Основной акцент на просвещении, цифровой грамотности и профилактике, а не на блокировках."];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement;
try{root.dataset.theme=localStorage.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light")}catch(e){}
$("#theme").onclick=()=>{const t=root.dataset.theme==="dark"?"light":"dark";root.dataset.theme=t;try{localStorage.theme=t}catch(e){}};
addEventListener("scroll",()=>{const h=root;$("#bar").style.width=h.scrollTop/(h.scrollHeight-h.clientHeight)*100+"%";$("#up").hidden=h.scrollTop<600},{passive:true});
$("#up").onclick=()=>scrollTo({top:0,behavior:"smooth"});
function count(el){const n=+el.dataset.n,t=performance.now();(function f(now){const p=Math.min((now-t)/1200,1);el.textContent=Math.round(n*p)+(p===1?el.dataset.s||"":"");if(p<1)requestAnimationFrame(f)})(t)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add("in");if(e.target.dataset.n)count(e.target);io.unobserve(e.target)}),{threshold:0});
$$(".rv").forEach(e=>{e.classList.add("pre");io.observe(e)});$$("[data-n]").forEach(e=>io.observe(e));
$$(".tl button").forEach(b=>b.onclick=()=>{$$(".tl button").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#tlo").textContent=b.dataset.t});
$$(".cmp .c").forEach(b=>b.onclick=()=>$$(".cmp .c").forEach(x=>{const on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)}));
/* Опрос и QR-код есть только на странице opinion.html */
if($("#poll")){
/* Опрос */
const remote=!!(CFG.url&&CFG.key),LS="poll_demo_counts",VK="poll_voted";
const H={apikey:CFG.key,Authorization:"Bearer "+CFG.key,"Content-Type":"application/json"};
$("#mode").textContent=remote?"Опрос анонимный. Результаты общие для всех посетителей.":"Демо-режим: сервер не подключён, голоса хранятся только в этом браузере и не отражают мнение других посетителей.";
async function getCounts(){
 if(remote){const r=await fetch(CFG.url+"/rest/v1/rpc/poll_counts",{method:"POST",headers:H,body:"{}"});if(!r.ok)throw new Error(r.status);const c=[0,0,0,0];(await r.json()).forEach(x=>c[x.opt-1]=+x.cnt);return c}
 try{return JSON.parse(localStorage[LS])}catch(e){return[0,0,0,0]}}
async function send(i){
 if(remote){const r=await fetch(CFG.url+"/rest/v1/votes",{method:"POST",headers:{...H,Prefer:"return=minimal"},body:JSON.stringify({choice:i+1})});if(!r.ok)throw new Error(r.status);return}
 const c=await getCounts();c[i]++;localStorage[LS]=JSON.stringify(c)}
function draw(c){const t=c.reduce((a,b)=>a+b,0);
 $("#res").innerHTML=OPT.map((o,i)=>{const p=t?Math.round(c[i]/t*100):0;return `<div class="rw"><span>${o}</span><div class="tr"><i style="width:${p}%"></i></div><b>${p}% (${c[i]})</b></div>`}).join("");
 $("#tot").textContent="Проголосовало: "+t;
 $("#cm").textContent=t?"Чаще всего выбирают вариант: «"+OPT[c.indexOf(Math.max(...c))]+"» Это мнение только тех, кто прошёл опрос, а не репрезентативное исследование.":""}
async function refresh(){try{draw(await getCounts())}catch(e){$("#cm").textContent="Не удалось загрузить результаты. Проверьте настройки подключения."}}
let sel=-1,voted=false;try{voted=!!localStorage[VK]}catch(e){}
function showRes(){$("#opts").hidden=true;$("#vote").hidden=true;$("#out").hidden=false;refresh();setInterval(()=>!document.hidden&&refresh(),15000)}
$("#opts").innerHTML=OPT.map((o,i)=>`<button data-i="${i}">${o}</button>`).join("");
$$("#opts button").forEach(b=>b.onclick=()=>{sel=+b.dataset.i;$$("#opts button").forEach(x=>x.classList.toggle("on",x===b));$("#vote").disabled=false});
$("#vote").onclick=async()=>{$("#vote").disabled=true;try{await send(sel);try{localStorage[VK]="1"}catch(e){}showRes()}catch(e){$("#mode").textContent="Не удалось отправить голос. Попробуйте позже."; $("#vote").disabled=false}};
if(voted)showRes();
/* QR-код строится из адреса опубликованного сайта */
const link=location.href.split("#")[0]+"#poll",pub=/^https?:$/.test(location.protocol)&&!/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
if(pub&&window.QRCode){new QRCode($("#qr"),{text:link,width:220,height:220});$("#qrl").textContent=link}
else $("#qr").textContent="QR-код появится после публикации сайта";

}

/* Государственный флаг: волна из вертикальных полос */
const fl=$("#flag");
if(fl){
  const N=30;
  fl.style.setProperty("--flag",'url("https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Kazakhstan.svg")');
  for(let i=0;i<N;i++){
    const s=document.createElement("i");
    s.style.cssText="--i:"+i+";--a:"+(1+i*0.16).toFixed(2)+"px;background-size:"+N*100+"% 100%;background-position:"+(i*100/(N-1)).toFixed(2)+"% 0";
    fl.appendChild(s);
  }
}
/* Интерактивная шкала исторических событий: фильтры и переход по ссылке #eXXXX */
const evs=$$(".ev");
if(evs.length){
  const fb=$$(".flt button");
  const setF=f=>{fb.forEach(x=>x.classList.toggle("on",x.dataset.f===f));evs.forEach(e=>e.hidden=f!=="all"&&e.dataset.c!==f)};
  fb.forEach(b=>b.onclick=()=>setF(b.dataset.f));
  const openHash=()=>{
    let e=null;
    try{e=location.hash.length>1&&document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch(x){}
    if(e&&e.classList.contains("ev")){setF("all");e.open=true;e.scrollIntoView({block:"center"})}
  };
  addEventListener("hashchange",openHash);openHash();
}
