const target = new Date("2026-10-03T06:00:00");
const $ = id => document.getElementById(id);

function updateCountdown(){
  if(!$("days")) return;
  const now = new Date();
  let diff = target - now;
  if(diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  $("days").textContent = String(d).padStart(2,"0");
  $("hours").textContent = String(h).padStart(2,"0");
  $("minutes").textContent = String(m).padStart(2,"0");
  $("seconds").textContent = String(s).padStart(2,"0");
}
updateCountdown();
if($("days")) setInterval(updateCountdown,1000);

$("openBtn")?.addEventListener("click",()=>{
  document.getElementById("cosmos").scrollIntoView({behavior:"smooth"});
});

$("birthdayBtn")?.addEventListener("click",()=>{
  $("birthdayModal").classList.add("show");
  burst();
});

document.querySelectorAll("[data-message]").forEach(card=>{
  card.addEventListener("click",()=>{
    document.querySelectorAll("[data-message]").forEach(item=>item.classList.remove("selected"));
    card.classList.add("selected");
    const message = $("constellationMessage");
    if(message){
      message.classList.add("revealed");
      message.querySelector("p").textContent = card.dataset.message;
    }
  });
});

$("whatsappBtn")?.addEventListener("click",()=>{
  const message = "Feliz aniversário, Yaron! Que o teu novo ciclo seja cheio de luz, amor, sonhos realizados e muitos momentos felizes. Espero que aproveites muito o teu dia! ❤️";
  const whatsappUrl = `https://wa.me/258860184449?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

document.querySelectorAll("[data-close]").forEach(btn=>{
  btn.addEventListener("click",()=>$("birthdayModal").classList.remove("show"));
});
$("birthdayModal")?.addEventListener("click",e=>{
  if(e.target.id==="birthdayModal") $("birthdayModal").classList.remove("show");
});

const music = $("music");
const musicBtn = $("musicBtn");
let playing = false;
musicBtn?.addEventListener("click",async()=>{
  try{
    if(!playing){ await music.play(); playing=true; musicBtn.innerHTML="❚❚ <span>Pausar</span>"; }
    else { music.pause(); playing=false; musicBtn.innerHTML="♫ <span>Música</span>"; }
  }catch(e){
    alert("Adicione o arquivo musica/musica.mp3 para usar a música.");
  }
});

function createHeart(){
  const hearts = document.querySelector(".hearts");
  if(!hearts) return;
  const h=document.createElement("span");
  h.className="heart-particle";
  h.textContent="♥";
  h.style.left=Math.random()*100+"%";
  h.style.animationDuration=(6+Math.random()*8)+"s";
  h.style.fontSize=(8+Math.random()*14)+"px";
  hearts.appendChild(h);
  setTimeout(()=>h.remove(),15000);
}
if(document.querySelector(".hearts")) setInterval(createHeart,900);

function burst(){
  const hearts = document.querySelector(".hearts");
  if(!hearts) return;
  for(let i=0;i<28;i++){
    const h=document.createElement("span");
    h.className="heart-particle";
    h.textContent=["♥","✦","♡"][Math.floor(Math.random()*3)];
    h.style.left=(35+Math.random()*30)+"%";
    h.style.bottom=(25+Math.random()*20)+"%";
    h.style.animationDuration=(2+Math.random()*3)+"s";
    hearts.appendChild(h);
    setTimeout(()=>h.remove(),6000);
  }
}


// ===== MOMENTOS =====
const moments = document.getElementById("moments");
const momentsBtn = document.getElementById("momentsBtn");
const closeMoments = document.getElementById("closeMoments");

function openMoments(){
  moments.classList.add("active");
  document.body.classList.add("moments-open");
  moments.scrollIntoView({behavior:"smooth", block:"start"});
  burstMoments();
}

function closeMomentsView(){
  moments.classList.remove("active");
  document.body.classList.remove("moments-open");
  document.getElementById("cosmos").scrollIntoView({behavior:"smooth"});
}

momentsBtn?.addEventListener("click", openMoments);
closeMoments?.addEventListener("click", closeMomentsView);

document.querySelectorAll(".orbit[data-note]").forEach(orbit=>{
  orbit.addEventListener("click",()=>{
    document.querySelectorAll(".orbit[data-note]").forEach(item=>item.classList.remove("selected"));
    orbit.classList.add("selected");
    const note = $("momentNote");
    if(note){
      note.classList.add("revealed");
      note.querySelector("p").textContent = orbit.dataset.note;
    }
  });
});

function burstMoments(){
  const stage = document.querySelector(".moments-stage");
  for(let i=0;i<34;i++){
    const p=document.createElement("span");
    p.textContent=["♥","✦","·"][Math.floor(Math.random()*3)];
    p.style.position="absolute";
    p.style.left=(45+Math.random()*10)+"%";
    p.style.top=(45+Math.random()*10)+"%";
    p.style.color=Math.random()>.35 ? "#ff2848" : "#fff";
    p.style.fontSize=(7+Math.random()*15)+"px";
    p.style.zIndex="7";
    p.style.pointerEvents="none";
    const dx=(Math.random()-.5)*1000;
    const dy=(Math.random()-.5)*700;
    p.animate([
      {transform:"translate(0,0) scale(.2)",opacity:0},
      {transform:`translate(${dx}px,${dy}px) scale(1.2)`,opacity:.9},
      {transform:`translate(${dx*1.1}px,${dy*1.1}px) scale(.3)`,opacity:0}
    ],{duration:1800+Math.random()*2200,easing:"cubic-bezier(.2,.8,.2,1)"});
    stage.appendChild(p);
    setTimeout(()=>p.remove(),4500);
  }
}

// Let each photo's proportions guide its place in the album mosaic.
document.querySelectorAll(".album-photo").forEach(photo=>{
  const image = photo.querySelector("img");
  const setShape = ()=>{
    if(!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    photo.dataset.shape = ratio > 1.3 ? "landscape" : ratio < 0.78 ? "portrait" : "square";
  };
  if(image.complete) setShape();
  else image.addEventListener("load",setShape,{once:true});
});

// ===== ACESSO POR IMPRESSÃO DIGITAL (SIMULAÇÃO VISUAL) =====
if(document.getElementById("fingerprintGate")) document.body.classList.add("locked");
const gate = document.getElementById("fingerprintGate");
const fpIcon = document.getElementById("fingerprintIcon");
const fpBtn = document.getElementById("fingerprintBtn");
const fpStatus = document.getElementById("fingerprintStatus");
let unlocked = false;

function unlockExperience(){
  if(unlocked) return;
  unlocked = true;
  fpIcon.classList.add("scanning");
  fpStatus.innerHTML = "Verificando identidade...<br><span style='color:#ff8da0'>Acesso autorizado</span>";
  fpBtn.textContent = "ACESSO AUTORIZADO";
  setTimeout(()=>{
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
    document.getElementById("openBtn")?.focus({preventScroll:true});
  },1200);
}
fpIcon?.addEventListener("click",unlockExperience);
fpBtn?.addEventListener("click",unlockExperience);
fpIcon?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ") unlockExperience()});
