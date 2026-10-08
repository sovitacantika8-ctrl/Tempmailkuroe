const API_BASE="https://apiii-xrina.vercel.app/tools";
const CREATE_URL=`${API_BASE}/tempmail`;
const CHECK_URL=`${API_BASE}/cekmail`;

const $=id=>document.getElementById(id);
let mailbox=JSON.parse(localStorage.getItem("kuroe_temp_mail")||"null");
let timer=null;
let allEmails=[];

function save(){localStorage.setItem("kuroe_temp_mail",JSON.stringify(mailbox))}
function setNotice(t,error=false){$("notice").textContent=t;$("notice").className="notice"+(error?" error":"")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function normalizeEmails(data){
  const list=data?.data?.emails ?? data?.emails ?? [];
  return Array.isArray(list)?list:[];
}
function val(o,keys){
  for(const k of keys){if(o&&o[k]!==undefined&&o[k]!==null)return o[k]}
  return "";
}

async function generate(){
  $("generateBtn").disabled=true;
  setNotice("Membuat mailbox...");
  try{
    const r=await fetch(CREATE_URL,{cache:"no-store"});
    const d=await r.json();
    if(!r.ok||d.status===false)throw new Error(d.message||"API gagal membuat email");
    const x=d.data||d;
    if(!x.email||!x.token)throw new Error("Respons API tidak berisi email/token");
    mailbox={email:x.email,token:x.token,createdAt:Date.now()};
    save();
    $("email").value=mailbox.email;
    $("mailStatus").textContent="Mailbox aktif";
    $("live").textContent="ONLINE";$("live").className="dot on";
    setNotice("Email berhasil dibuat. Token tersimpan di browser.");
    await checkInbox();
  }catch(e){setNotice(e.message||"Gagal membuat email.",true)}
  finally{$("generateBtn").disabled=false}
}

async function checkInbox(){
  if(!mailbox?.token){renderEmpty();return}
  $("refreshBtn").classList.add("loading");
  try{
    const r=await fetch(`${CHECK_URL}?token=${encodeURIComponent(mailbox.token)}`,{cache:"no-store"});
    const d=await r.json();
    if(!r.ok||d.status===false)throw new Error(d.message||"Gagal membaca inbox");
    allEmails=normalizeEmails(d);
    $("count").textContent=d?.data?.total??allEmails.length;
    renderEmails();
    setNotice(allEmails.length?`${allEmails.length} email masuk.`:"Inbox kosong. Auto-refresh aktif.");
  }catch(e){setNotice(e.message||"Gagal membaca inbox.",true)}
  finally{$("refreshBtn").classList.remove("loading")}
}

function renderEmpty(){
  $("count").textContent="0";
  $("inbox").innerHTML='<div class="empty"><strong>No active mailbox</strong><br>Tekan Generate Email untuk mulai menerima pesan.</div>';
}
function renderEmails(){
  const q=$("search").value.trim().toLowerCase();
  const list=allEmails.filter(m=>JSON.stringify(m).toLowerCase().includes(q));
  if(!list.length){
    $("inbox").innerHTML='<div class="empty"><strong>Inbox kosong</strong><br>Belum ada pesan masuk.</div>';
    return;
  }
  $("inbox").innerHTML=list.map((m,i)=>{
    const from=val(m,["from","sender","email","mail","from_email"]);
    const subject=val(m,["subject","title"]);
    const body=val(m,["text","body","content","message","html"]);
    const date=val(m,["date","time","created_at","createdAt"]);
    return `<article class="mail">
      <div class="mail-head"><b>${esc(subject||"No subject")}</b><time>${esc(date)}</time></div>
      <div class="from">FROM: ${esc(from||"Unknown sender")}</div>
      ${body?`<div class="body">${esc(body)}</div>`:""}
    </article>`;
  }).join("");
}

async function copyEmail(){
  const e=$("email").value;
  if(!e)return setNotice("Belum ada email.",true);
  try{await navigator.clipboard.writeText(e);setNotice("Alamat email berhasil disalin.")}
  catch{setNotice("Gagal menyalin otomatis.",true)}
}

function setup(){
  if(mailbox?.email&&mailbox?.token){
    $("email").value=mailbox.email;
    $("mailStatus").textContent="Mailbox aktif";
    $("live").textContent="ONLINE";$("live").className="dot on";
    checkInbox();
  }else renderEmpty();
  $("generateBtn").onclick=generate;
  $("refreshBtn").onclick=checkInbox;
  $("copyBtn").onclick=copyEmail;
  $("search").oninput=renderEmails;
  $("auto").onchange=startTimer;
  startTimer();
}
function startTimer(){
  clearInterval(timer);
  if($("auto").checked&&mailbox?.token)timer=setInterval(checkInbox,10000);
}
setup();
