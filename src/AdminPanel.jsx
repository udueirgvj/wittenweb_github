import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.firebasestorage.app",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af3a3e29568130"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const OWNER_USERNAME = "tsaxp";
const APP_BOT_ID = "bot_dfgfd_official";
const APP_CHANNEL_ID = "channel_termeen_official";
const APP_CHANNEL_SUBS = 55000000;

function uidGen() { return Math.random().toString(36).slice(2,10)+Date.now().toString(36); }
function nowStr() { return new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}); }
function nowFull() { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; }
function fmtSubs(n) { return n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(1)+"K":n; }

const ACOLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722"];
function rC(s) { return ACOLORS[(s||"A").charCodeAt(0)%ACOLORS.length]; }

const T = {
  bg:"#050a0f", card:"rgba(10,22,40,0.95)", gold:"#ffd700", goldDim:"rgba(255,215,0,0.5)",
  text:"#e8f4fd", textSec:"#6b8ca4", danger:"#e05c5c", success:"#4dd67a", accent:"#5288c1",
  hover:"rgba(255,255,255,0.04)", border:"rgba(255,215,0,0.08)"
};

function Av({name,photo,size,color}) {
  const sz=size||44;
  return (
    <div style={{width:sz,height:sz,borderRadius:"50%",background:photo?"transparent":(color||rC(name||"?")),display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*0.38,fontWeight:"800",color:"#fff",overflow:"hidden",flexShrink:0}}>
      {photo?<img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
    </div>
  );
}

function Tag({label,color}) {
  return <span style={{background:color+"20",color,fontSize:"10px",fontWeight:"700",padding:"2px 7px",borderRadius:"6px",whiteSpace:"nowrap"}}>{label}</span>;
}

function ABt({label,color,onClick,small}) {
  return (
    <button onClick={onClick}
      style={{padding:small?"5px 10px":"7px 12px",borderRadius:"8px",border:"1px solid "+color+"30",background:color+"15",color,cursor:"pointer",fontFamily:"inherit",fontSize:small?"11px":"12px",fontWeight:"600",transition:"background 0.2s"}}
      onMouseEnter={function(e){e.currentTarget.style.background=color+"28";}}
      onMouseLeave={function(e){e.currentTarget.style.background=color+"15";}}>
      {label}
    </button>
  );
}

function InpField({value,onChange,placeholder,onKeyDown}) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit",boxSizing:"border-box"}}
      onFocus={function(e){e.target.style.borderColor=T.goldDim;}}
      onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
  );
}

// ── LOGIN ──
function AdminLogin({onLogin}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [time,setTime]=useState(new Date());

  useEffect(function(){const t=setInterval(function(){setTime(new Date());},1000);return function(){clearInterval(t);};},[]);

  async function handle() {
    if(!email||!pass){setErr("أدخل البريد وكلمة المرور");return;}
    setLoading(true);setErr("");
    try {
      const cred=await signInWithEmailAndPassword(auth,email,pass);
      const snap=await get(ref(db,"users/"+cred.user.uid));
      if(!snap.exists()||snap.val().username!==OWNER_USERNAME){
        await signOut(auth);setErr("⛔ هذه البوابة للمالك فقط");setLoading(false);return;
      }
      onLogin(snap.val());
    } catch(e){
      const m={"auth/invalid-credential":"بيانات الدخول غير صحيحة","auth/user-not-found":"الحساب غير موجود","auth/wrong-password":"كلمة المرور خاطئة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",padding:"20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,215,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.025) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      <div style={{width:"100%",maxWidth:"390px",position:"relative",zIndex:10}}>
        <div style={{textAlign:"center",marginBottom:"8px"}}>
          <span style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",color:"#000",fontSize:"11px",fontWeight:"800",padding:"4px 16px",borderRadius:"20px",letterSpacing:"2px"}}>OWNER ACCESS ONLY</span>
        </div>
        <div style={{background:T.card,borderRadius:"22px",padding:"36px",border:"1px solid rgba(255,215,0,0.15)",boxShadow:"0 40px 80px rgba(0,0,0,0.8)"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <div style={{width:"76px",height:"76px",borderRadius:"50%",margin:"0 auto 14px",background:"linear-gradient(135deg,#ffd700,#ff8c00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"34px",boxShadow:"0 0 30px rgba(255,215,0,0.4)"}}>👑</div>
            <div style={{color:T.gold,fontSize:"20px",fontWeight:"900",letterSpacing:"3px"}}>TSAXP</div>
            <div style={{color:T.goldDim,fontSize:"11px",letterSpacing:"2px",marginTop:"3px"}}>بوابة المالك — تيرمين</div>
            <div style={{color:T.gold,fontSize:"16px",fontWeight:"700",marginTop:"10px",fontVariantNumeric:"tabular-nums"}}>
              {time.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"13px"}}>
            <div>
              <label style={{color:T.goldDim,fontSize:"11px",fontWeight:"700",display:"block",marginBottom:"5px"}}>البريد الإلكتروني</label>
              <input value={email} onChange={function(e){setEmail(e.target.value);}} type="email" placeholder="owner@termeen.app"
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"12px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"ltr",fontFamily:"inherit",boxSizing:"border-box"}}
                onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
            </div>
            <div>
              <label style={{color:T.goldDim,fontSize:"11px",fontWeight:"700",display:"block",marginBottom:"5px"}}>كلمة المرور</label>
              <input value={pass} onChange={function(e){setPass(e.target.value);}} type="password" placeholder="••••••••"
                onKeyDown={function(e){if(e.key==="Enter")handle();}}
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"12px 14px",color:"#fff",fontSize:"14px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}
                onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
            </div>
            {err&&<div style={{background:"rgba(220,50,50,0.1)",border:"1px solid rgba(220,50,50,0.3)",borderRadius:"10px",padding:"10px",color:"#ff6b6b",fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
            <button onClick={handle} disabled={loading}
              style={{width:"100%",padding:"14px",background:loading?"rgba(255,215,0,0.3)":"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"12px",color:"#000",fontWeight:"900",fontSize:"15px",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",marginTop:"4px"}}
              onMouseEnter={function(e){if(!loading){e.currentTarget.style.opacity="0.9";}}}
              onMouseLeave={function(e){e.currentTarget.style.opacity="1";}}>
              {loading?"⟳ جاري التحقق...":"🔓 دخول بوابة المالك"}
            </button>
          </div>
          <div style={{marginTop:"18px",padding:"10px",borderRadius:"10px",background:"rgba(255,50,50,0.05)",border:"1px solid rgba(255,50,50,0.1)",textAlign:"center",color:"rgba(255,100,100,0.6)",fontSize:"11px"}}>
            🔒 هذه البوابة مخصصة للمالك فقط — جميع الإجراءات مسجّلة
          </div>
        </div>
      </div>
      <style>{`* {box-sizing:border-box;margin:0;padding:0} input::placeholder{color:rgba(255,215,0,0.2)}`}</style>
    </div>
  );
}

// ── USER DETAIL PANEL ──
function UserDetail({u,onClose,db}) {
  const [userChats,setUserChats]=useState([]);
  const [userBots,setUserBots]=useState([]);
  const [userMsgs,setUserMsgs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("info");

  useEffect(function(){
    async function load(){
      setLoading(true);
      // Load chats
      const chSnap=await get(ref(db,"userChats/"+u.uid));
      if(chSnap.exists()){
        const list=await Promise.all(Object.values(chSnap.val()).map(async function(uc){
          const cs=await get(ref(db,"chats/"+uc.chatId));
          return cs.exists()?Object.assign({},cs.val(),uc):null;
        }));
        setUserChats(list.filter(Boolean));
      }
      // Load bots
      const bSnap=await get(ref(db,"userBots/"+u.uid));
      if(bSnap.exists()) setUserBots(Object.values(bSnap.val()));
      setLoading(false);
    }
    load();
  },[u.uid,db]);

  async function doAction(action) {
    const updates={};
    switch(action){
      case "ban": updates.isBanned=true; break;
      case "unban": updates.isBanned=false; break;
      case "fraud": updates.isFraud=true; break;
      case "unfraud": updates.isFraud=false; break;
      case "verify": updates.verified=true; break;
      case "unverify": updates.verified=false; break;
      case "restrict": updates.isRestricted=true; break;
      case "unrestrict": updates.isRestricted=false; break;
      default: break;
    }
    await update(ref(db,"users/"+u.uid),updates);
    const nid=uidGen();
    const botId="bot_"+u.uid;
    const msgs={ban:"⚠️ تم تعليق حسابك",unban:"✅ تم رفع التعليق",fraud:"🔴 وُضعت علامة احتيال على حسابك",unfraud:"✅ تم إزالة علامة الاحتيال",verify:"✅ تم توثيق حسابك",unverify:"ℹ️ تم إزالة التوثيق",restrict:"⚠️ تم تقييد حسابك",unrestrict:"✅ تم رفع التقييد"};
    await set(ref(db,"messages/"+botId+"/"+nid),{id:nid,chatId:botId,text:(msgs[action]||"تم تنفيذ إجراء على حسابك")+"\n🕐 "+nowFull(),from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
    alert("✅ تم: "+action+" على @"+u.username);
    onClose();
  }

  async function deleteUser() {
    if(!window.confirm("حذف حساب @"+u.username+" نهائياً؟")) return;
    await remove(ref(db,"users/"+u.uid));
    await remove(ref(db,"usernames/"+u.username));
    alert("✅ تم الحذف");
    onClose();
  }

  const channels=userChats.filter(function(c){return c.type==="channel";});
  const groups=userChats.filter(function(c){return c.type==="group";});
  const privates=userChats.filter(function(c){return c.type==="private";});

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
      <div style={{background:"#0a1628",borderRadius:"20px",width:"100%",maxWidth:"560px",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",border:"1px solid rgba(255,215,0,0.15)",boxShadow:"0 30px 80px rgba(0,0,0,0.8)"}} onClick={function(e){e.stopPropagation();}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,rgba(255,215,0,0.08),rgba(10,22,40,0.9))",padding:"20px",display:"flex",alignItems:"center",gap:"14px",borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
          <Av name={u.displayName} size={60} color={u.color||rC(u.displayName)} photo={u.photoURL}/>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontWeight:"800",fontSize:"16px",display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
              {u.displayName}
              {u.verified&&<Tag label="موثق ✓" color={T.accent}/>}
              {u.isBanned&&<Tag label="محظور" color={T.danger}/>}
              {u.isFraud&&<Tag label="احتيال 🔴" color={T.danger}/>}
              {u.isRestricted&&<Tag label="مقيّد" color={T.gold}/>}
              {u.username===OWNER_USERNAME&&<Tag label="OWNER 👑" color={T.gold}/>}
            </div>
            <div style={{color:T.textSec,fontSize:"12px",marginTop:"4px"}}>@{u.username}</div>
            <div style={{color:T.textSec,fontSize:"11px"}}>{u.email}</div>
            <div style={{color:T.textSec,fontSize:"11px"}}>ID: {(u.uid||"").slice(0,20)}...</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"50%",width:"32px",height:"32px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* Actions */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,215,0,0.06)",display:"flex",flexWrap:"wrap",gap:"8px"}}>
          <ABt label={u.isBanned?"رفع الحظر ✅":"حظر 🚫"} color={u.isBanned?T.success:T.danger} onClick={function(){doAction(u.isBanned?"unban":"ban");}} small/>
          <ABt label={u.isFraud?"إزالة احتيال":"احتيال 🔴"} color={T.danger} onClick={function(){doAction(u.isFraud?"unfraud":"fraud");}} small/>
          <ABt label={u.verified?"إزالة توثيق":"توثيق ✅"} color={T.gold} onClick={function(){doAction(u.verified?"unverify":"verify");}} small/>
          <ABt label={u.isRestricted?"رفع تقييد":"تقييد ⚠️"} color="#ff9800" onClick={function(){doAction(u.isRestricted?"unrestrict":"restrict");}} small/>
          <ABt label="حذف 🗑" color={T.danger} onClick={deleteUser} small/>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,215,0,0.06)"}}>
          {[{k:"info",l:"معلومات"},{k:"chats",l:"المحادثات("+privates.length+")"},{k:"channels",l:"قنواته("+channels.length+")"},{k:"groups",l:"مجموعاته("+groups.length+")"},{k:"bots",l:"بوتاته("+userBots.length+")"}].map(function(t){
            return (
              <button key={t.k} onClick={function(){setActiveTab(t.k);}}
                style={{flex:1,padding:"10px 4px",background:"none",border:"none",color:activeTab===t.k?T.gold:T.textSec,fontWeight:activeTab===t.k?"700":"400",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",borderBottom:activeTab===t.k?"2px solid "+T.gold:"2px solid transparent"}}>
                {t.l}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
          {loading&&<div style={{textAlign:"center",color:T.textSec,padding:"30px"}}>⟳ جاري التحميل...</div>}
          {!loading&&activeTab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {[
                {l:"المعرف",v:u.uid},
                {l:"البريد",v:u.email},
                {l:"اسم المستخدم",v:"@"+u.username},
                {l:"النبذة",v:u.bio||"—"},
                {l:"تاريخ الإنشاء",v:u.createdAt?new Date(u.createdAt).toLocaleDateString("ar-SA"):"—"},
                {l:"آخر ظهور",v:u.lastSeen?new Date(u.lastSeen).toLocaleDateString("ar-SA"):"—"},
                {l:"التحقق بخطوتين",v:u.twoFactor?"مفعّل ✅":"معطّل"},
                {l:"إجمالي المحادثات",v:userChats.length},
                {l:"القنوات",v:channels.length},
                {l:"المجموعات",v:groups.length},
                {l:"البوتات",v:userBots.length},
              ].map(function(row){
                return (
                  <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"rgba(255,255,255,0.03)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{color:T.textSec,fontSize:"12px"}}>{row.l}</span>
                    <span style={{color:T.text,fontSize:"12px",fontWeight:"600",maxWidth:"260px",textAlign:"left",wordBreak:"break-all"}}>{String(row.v)}</span>
                  </div>
                );
              })}
            </div>
          )}
          {!loading&&activeTab==="chats"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {privates.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"30px"}}>لا توجد محادثات خاصة</div>}
              {privates.map(function(c,i){
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(255,255,255,0.03)",borderRadius:"10px"}}>
                    <Av name={c.name||"؟"} size={38} color={c.color||rC(c.name||"؟")}/>
                    <div>
                      <div style={{color:T.text,fontSize:"13px",fontWeight:"600"}}>{c.name||"محادثة"}</div>
                      <div style={{color:T.textSec,fontSize:"11px"}}>{c.lastMessage||"—"} · {c.lastTime||""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading&&activeTab==="channels"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {channels.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"30px"}}>لا توجد قنوات</div>}
              {channels.map(function(c,i){
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(255,255,255,0.03)",borderRadius:"10px"}}>
                    <Av name={c.name||"؟"} size={38} color={rC(c.name||"؟")} photo={c.photoURL}/>
                    <div style={{flex:1}}>
                      <div style={{color:T.text,fontSize:"13px",fontWeight:"600",display:"flex",alignItems:"center",gap:"5px"}}>{c.name}{c.verified&&<Tag label="✓" color={T.accent}/>}{c.ownerId===u.uid&&<Tag label="مالك" color={T.gold}/>}</div>
                      <div style={{color:T.textSec,fontSize:"11px"}}>@{c.username} · {c.subscribers||0} مشترك</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading&&activeTab==="groups"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {groups.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"30px"}}>لا توجد مجموعات</div>}
              {groups.map(function(g,i){
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(255,255,255,0.03)",borderRadius:"10px"}}>
                    <Av name={g.name||"؟"} size={38} color={rC(g.name||"؟")} photo={g.photoURL}/>
                    <div>
                      <div style={{color:T.text,fontSize:"13px",fontWeight:"600",display:"flex",alignItems:"center",gap:"5px"}}>{g.name}{g.ownerId===u.uid&&<Tag label="مالك" color={T.gold}/>}</div>
                      <div style={{color:T.textSec,fontSize:"11px"}}>@{g.username} · {(g.members||[]).length} عضو</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading&&activeTab==="bots"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {userBots.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"30px"}}>لا توجد بوتات</div>}
              {userBots.map(function(b,i){
                return (
                  <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"12px"}}>
                    <div style={{color:T.text,fontSize:"13px",fontWeight:"700",marginBottom:"6px"}}>🤖 @{b.username}</div>
                    <div style={{color:T.textSec,fontSize:"11px",wordBreak:"break-all",background:"rgba(0,0,0,0.3)",padding:"7px 10px",borderRadius:"7px",fontFamily:"monospace"}}>{b.token}</div>
                    <div style={{color:T.textSec,fontSize:"10px",marginTop:"5px"}}>{b.createdAt?new Date(b.createdAt).toLocaleDateString("ar-SA"):""}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APP CHANNEL MANAGER ──
function AppChannelManager({db}) {
  const [channel,setChannel]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [newMsg,setNewMsg]=useState("");
  const [newPhoto,setNewPhoto]=useState("");
  const [newName,setNewName]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(function(){
    async function load(){
      const snap=await get(ref(db,"chats/"+APP_CHANNEL_ID));
      if(snap.exists()){
        setChannel(snap.val());
        setNewName(snap.val().name||"");
        setNewPhoto(snap.val().photoURL||"");
      }
      const mSnap=await get(ref(db,"messages/"+APP_CHANNEL_ID));
      if(mSnap.exists()) setMsgs(Object.values(mSnap.val()).sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);}));
      setLoading(false);
    }
    load();
  },[db]);

  async function saveChannel(){
    await update(ref(db,"chats/"+APP_CHANNEL_ID),{name:newName,photoURL:newPhoto});
    const snap=await get(ref(db,"chats/"+APP_CHANNEL_ID));
    if(snap.exists()) setChannel(snap.val());
    alert("✅ تم حفظ إعدادات القناة");
  }

  async function publishMsg(){
    if(!newMsg.trim()) return;
    const mid=uidGen();
    await set(ref(db,"messages/"+APP_CHANNEL_ID+"/"+mid),{id:mid,chatId:APP_CHANNEL_ID,text:newMsg.trim(),from:"system_owner",senderName:"تيرمين الرسمية",time:nowStr(),type:"text",isOfficial:true,createdAt:Date.now()});
    await update(ref(db,"chats/"+APP_CHANNEL_ID),{lastMessage:newMsg.trim().slice(0,60),lastTime:nowStr()});
    setNewMsg("");
    const mSnap=await get(ref(db,"messages/"+APP_CHANNEL_ID));
    if(mSnap.exists()) setMsgs(Object.values(mSnap.val()).sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);}));
    alert("✅ تم النشر في القناة");
  }

  async function deleteMsg(mid){
    if(!window.confirm("حذف هذه الرسالة؟")) return;
    await remove(ref(db,"messages/"+APP_CHANNEL_ID+"/"+mid));
    setMsgs(function(prev){return prev.filter(function(m){return m.id!==mid;});});
  }

  if(loading) return <div style={{color:T.textSec,textAlign:"center",padding:"60px"}}>⟳ جاري التحميل...</div>;

  return (
    <div>
      <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"16px"}}>📢 قناة تيرمين الرسمية</div>
      {channel&&(
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
            {[{l:"المشتركون",v:fmtSubs(channel.subscribers||APP_CHANNEL_SUBS)},{l:"الرسائل",v:msgs.length},{l:"الحالة",v:channel.verified?"موثقة ✅":"غير موثقة"}].map(function(s){
              return (
                <div key={s.l} style={{background:T.card,borderRadius:"12px",padding:"14px",border:"1px solid "+T.border,textAlign:"center"}}>
                  <div style={{color:T.gold,fontSize:"18px",fontWeight:"900"}}>{s.v}</div>
                  <div style={{color:T.textSec,fontSize:"11px",marginTop:"3px"}}>{s.l}</div>
                </div>
              );
            })}
          </div>

          {/* Settings */}
          <div style={{background:T.card,borderRadius:"14px",padding:"16px",border:"1px solid "+T.border}}>
            <div style={{color:T.goldDim,fontSize:"12px",fontWeight:"700",marginBottom:"12px"}}>إعدادات القناة</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div>
                <label style={{color:T.textSec,fontSize:"11px",display:"block",marginBottom:"5px"}}>اسم القناة</label>
                <input value={newName} onChange={function(e){setNewName(e.target.value);}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
              </div>
              <div>
                <label style={{color:T.textSec,fontSize:"11px",display:"block",marginBottom:"5px"}}>رابط صورة القناة</label>
                <input value={newPhoto} onChange={function(e){setNewPhoto(e.target.value);}} placeholder="https://..." style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"ltr",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={saveChannel} style={{flex:1,padding:"10px",background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>💾 حفظ</button>
                <button onClick={async function(){await update(ref(db,"chats/"+APP_CHANNEL_ID),{verified:!channel.verified});const s=await get(ref(db,"chats/"+APP_CHANNEL_ID));if(s.exists())setChannel(s.val());}} style={{flex:1,padding:"10px",background:channel.verified?"rgba(229,92,92,0.15)":"rgba(77,214,122,0.15)",border:"1px solid "+(channel.verified?T.danger:T.success)+"40",borderRadius:"10px",color:channel.verified?T.danger:T.success,cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>{channel.verified?"❌ إزالة توثيق":"✅ توثيق"}</button>
              </div>
            </div>
          </div>

          {/* Publish */}
          <div style={{background:T.card,borderRadius:"14px",padding:"16px",border:"1px solid "+T.border}}>
            <div style={{color:T.goldDim,fontSize:"12px",fontWeight:"700",marginBottom:"10px"}}>نشر رسالة في القناة</div>
            <textarea value={newMsg} onChange={function(e){setNewMsg(e.target.value);}} placeholder="اكتب رسالتك..." rows={3}
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"10px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none",boxSizing:"border-box"}}
              onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
            <button onClick={publishMsg} style={{marginTop:"10px",width:"100%",padding:"11px",background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>📤 نشر في القناة</button>
          </div>

          {/* Messages */}
          <div style={{background:T.card,borderRadius:"14px",padding:"16px",border:"1px solid "+T.border}}>
            <div style={{color:T.goldDim,fontSize:"12px",fontWeight:"700",marginBottom:"10px"}}>الرسائل ({msgs.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"300px",overflowY:"auto"}}>
              {msgs.map(function(m){
                return (
                  <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px",background:"rgba(255,255,255,0.03)",borderRadius:"10px",gap:"10px"}}>
                    <div style={{flex:1}}>
                      <div style={{color:T.text,fontSize:"13px",lineHeight:"1.5",whiteSpace:"pre-wrap"}}>{m.text}</div>
                      <div style={{color:T.textSec,fontSize:"11px",marginTop:"4px"}}>{m.time}</div>
                    </div>
                    <button onClick={function(){deleteMsg(m.id);}} style={{background:"rgba(229,92,92,0.15)",border:"1px solid rgba(229,92,92,0.3)",borderRadius:"7px",padding:"5px 10px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontSize:"11px",flexShrink:0}}>حذف</button>
                  </div>
                );
              })}
              {msgs.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"20px"}}>لا توجد رسائل بعد</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BOTS MANAGER ──
function BotsManager({db}) {
  const [allBots,setAllBots]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedBot,setSelectedBot]=useState(null);

  useEffect(function(){
    async function load(){
      const snap=await get(ref(db,"bots"));
      if(snap.exists()){
        const bots=Object.values(snap.val());
        const enriched=await Promise.all(bots.map(async function(b){
          if(b.creatorId){
            const uSnap=await get(ref(db,"users/"+b.creatorId));
            return Object.assign({},b,{creatorData:uSnap.exists()?uSnap.val():null});
          }
          return b;
        }));
        setAllBots(enriched);
      }
      setLoading(false);
    }
    load();
  },[db]);

  async function deleteBot(b){
    if(!window.confirm("حذف بوت @"+b.username+"؟")) return;
    await remove(ref(db,"bots/"+b.id));
    if(b.creatorId) await remove(ref(db,"userBots/"+b.creatorId+"/"+b.id));
    setAllBots(function(prev){return prev.filter(function(x){return x.id!==b.id;});});
    setSelectedBot(null);
  }

  if(loading) return <div style={{color:T.textSec,textAlign:"center",padding:"60px"}}>⟳ جاري التحميل...</div>;

  return (
    <div>
      <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"16px"}}>🤖 BotFather — جميع البوتات ({allBots.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {allBots.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"60px"}}>لا توجد بوتات بعد</div>}
        {allBots.map(function(b){
          return (
            <div key={b.id} style={{background:T.card,borderRadius:"14px",padding:"14px",border:"1px solid "+T.border,cursor:"pointer"}}
              onClick={function(){setSelectedBot(selectedBot&&selectedBot.id===b.id?null:b);}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#9C27B0,#673AB7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>🤖</div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"14px"}}>@{b.username}</div>
                  <div style={{color:T.textSec,fontSize:"11px"}}>
                    صاحبه: {b.creatorData?"@"+b.creatorData.username:"مجهول"} · {b.createdAt?new Date(b.createdAt).toLocaleDateString("ar-SA"):""}
                  </div>
                </div>
                <ABt label="حذف 🗑" color={T.danger} onClick={function(e){e.stopPropagation();deleteBot(b);}} small/>
              </div>
              {selectedBot&&selectedBot.id===b.id&&(
                <div style={{marginTop:"12px",borderTop:"1px solid rgba(255,215,0,0.06)",paddingTop:"12px"}}>
                  <div style={{color:T.textSec,fontSize:"11px",marginBottom:"6px"}}>التوكن:</div>
                  <div style={{background:"rgba(0,0,0,0.4)",borderRadius:"8px",padding:"10px",fontFamily:"monospace",fontSize:"11px",color:T.gold,wordBreak:"break-all"}}>{b.token}</div>
                  {b.creatorData&&(
                    <div style={{marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <Av name={b.creatorData.displayName} size={32} color={b.creatorData.color||rC(b.creatorData.displayName)} photo={b.creatorData.photoURL}/>
                      <div>
                        <div style={{color:T.text,fontSize:"12px",fontWeight:"600"}}>{b.creatorData.displayName}</div>
                        <div style={{color:T.textSec,fontSize:"11px"}}>@{b.creatorData.username}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN ADMIN PANEL ──
export default function AdminPanel() {
  const [adminUser,setAdminUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [tab,setTab]=useState("users");
  const [allUsers,setAllUsers]=useState([]);
  const [allChats,setAllChats]=useState([]);
  const [supportTickets,setSupportTickets]=useState([]);
  const [searchUser,setSearchUser]=useState("");
  const [actionInput,setActionInput]=useState("");
  const [replyInput,setReplyInput]=useState({});
  const [time,setTime]=useState(new Date());
  const [selectedUserDetail,setSelectedUserDetail]=useState(null);

  useEffect(function(){const t=setInterval(function(){setTime(new Date());},1000);return function(){clearInterval(t);};},[]);

  useEffect(function(){
    const unsub=onAuthStateChanged(auth,async function(u){
      if(u){
        const snap=await get(ref(db,"users/"+u.uid));
        if(snap.exists()&&snap.val().username===OWNER_USERNAME) setAdminUser(snap.val());
        else {await signOut(auth);setAdminUser(null);}
      } else setAdminUser(null);
      setAuthLoading(false);
    });
    return function(){unsub();};
  },[]);

  useEffect(function(){
    if(!adminUser) return;
    const ur=ref(db,"users");
    const cr=ref(db,"chats");
    const sr=ref(db,"support");
    onValue(ur,function(s){if(s.exists())setAllUsers(Object.values(s.val()));else setAllUsers([]);});
    onValue(cr,function(s){if(s.exists())setAllChats(Object.values(s.val()));else setAllChats([]);});
    onValue(sr,function(s){if(s.exists())setSupportTickets(Object.values(s.val()));else setSupportTickets([]);});
    return function(){off(ur);off(cr);off(sr);};
  },[adminUser]);

  async function doAction(action,targetUsername){
    const uname=(targetUsername||actionInput).trim().replace("@","").toLowerCase();
    if(!uname){alert("أدخل اسم المستخدم");return;}
    const snap=await get(ref(db,"usernames/"+uname));
    if(!snap.exists()){alert("لا يوجد مستخدم @"+uname);return;}
    const uid2=snap.val();
    if(action==="delete"){if(!window.confirm("حذف @"+uname+" نهائياً؟"))return;await remove(ref(db,"users/"+uid2));await remove(ref(db,"usernames/"+uname));alert("✅ تم حذف @"+uname);setActionInput("");return;}
    const map={ban:{isBanned:true},unban:{isBanned:false},fraud:{isFraud:true},unfraud:{isFraud:false},verify:{verified:true},unverify:{verified:false},restrict:{isRestricted:true},unrestrict:{isRestricted:false}};
    if(map[action]){
      await update(ref(db,"users/"+uid2),map[action]);
      const msgs={ban:"⚠️ تم تعليق حسابك",unban:"✅ تم رفع التعليق",fraud:"🔴 وُضعت علامة احتيال",unfraud:"✅ تم إزالة علامة الاحتيال",verify:"✅ تم توثيق حسابك",unverify:"ℹ️ تم إزالة التوثيق",restrict:"⚠️ تم تقييد حسابك",unrestrict:"✅ تم رفع التقييد"};
      const botId="bot_"+uid2;const nid=uidGen();
      await set(ref(db,"messages/"+botId+"/"+nid),{id:nid,chatId:botId,text:msgs[action]+"\n🕐 "+nowFull(),from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
      alert("✅ تم: "+action+" على @"+uname);setActionInput("");
    }
  }

  async function sendReply(ticketId,userId){
    const text=replyInput[ticketId];
    if(!text||!text.trim())return;
    const msgId=uidGen();
    await set(ref(db,"support/"+ticketId+"/messages/"+msgId),{id:msgId,text:text.trim(),from:"admin",time:nowStr(),createdAt:Date.now()});
    await update(ref(db,"support/"+ticketId+"/info"),{status:"replied"});
    const botId="support_"+userId;
    const nid=uidGen();
    await set(ref(db,"messages/"+botId+"/"+nid),{id:nid,chatId:botId,text:"💬 رد من الدعم الفني:\n\n"+text.trim(),from:"support_official",senderName:"الدعم الفني",time:nowStr(),type:"text",isSupport:true,createdAt:Date.now()});
    await update(ref(db,"userChats/"+userId+"/support_"+userId),{lastMessage:"رد جديد من الدعم",lastTime:nowStr(),unread:1,order:Date.now()});
    setReplyInput(function(p){const next=Object.assign({},p);next[ticketId]="";return next;});
    alert("✅ تم إرسال الرد");
  }

  if(authLoading) return <div style={{height:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.gold,fontSize:"20px",fontFamily:"'Segoe UI',sans-serif"}}>جاري التحميل...</div>;
  if(!adminUser) return <AdminLogin onLogin={setAdminUser}/>;

  const channels=allChats.filter(function(c){return c.type==="channel"&&c.id!==APP_CHANNEL_ID;});
  const groups=allChats.filter(function(c){return c.type==="group";});
  const filtered=allUsers.filter(function(u){return (u.username||"").includes(searchUser.toLowerCase())||(u.displayName||"").toLowerCase().includes(searchUser.toLowerCase());});
  const openTickets=supportTickets.filter(function(t){return t.info&&(t.info.status==="open"||t.info.status==="awaiting_human");}).length;

  const TABS=[
    {k:"users",l:"👥 المستخدمون",c:allUsers.length},
    {k:"actions",l:"⚡ إجراءات",c:null},
    {k:"channels",l:"📢 القنوات",c:channels.length},
    {k:"groups",l:"👥 المجموعات",c:groups.length},
    {k:"support",l:"🆘 الدعم",c:openTickets||null},
    {k:"verify",l:"✅ التوثيق",c:null},
    {k:"app_channel",l:"📡 قناة التطبيق",c:null},
    {k:"bots",l:"🤖 BotFather",c:null},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",display:"flex",flexDirection:"column"}}>
      {/* User Detail Modal */}
      {selectedUserDetail&&<UserDetail u={selectedUserDetail} onClose={function(){setSelectedUserDetail(null);}} db={db}/>}

      {/* Top Bar */}
      <div style={{background:"rgba(10,22,40,0.98)",borderBottom:"1px solid rgba(255,215,0,0.15)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{fontSize:"22px"}}>👑</span>
          <div>
            <div style={{color:T.gold,fontWeight:"900",fontSize:"16px"}}>لوحة تحكم المالك</div>
            <div style={{color:"rgba(255,215,0,0.35)",fontSize:"11px"}}>✈️ تيرمين — {adminUser.displayName}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{color:T.gold,fontSize:"13px",fontWeight:"700",fontVariantNumeric:"tabular-nums"}}>{time.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
          <Av name={adminUser.displayName} size={34} color={rC(adminUser.displayName)} photo={adminUser.photoURL}/>
          <button onClick={function(){signOut(auth);}} style={{background:"rgba(255,50,50,0.15)",border:"1px solid rgba(255,50,50,0.3)",borderRadius:"8px",padding:"6px 12px",color:"#ff6b6b",cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>خروج</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:"1px",background:"rgba(255,215,0,0.05)",borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
        {[{l:"المستخدمون",v:allUsers.length,c:T.accent},{l:"القنوات",v:channels.length,c:T.gold},{l:"المجموعات",v:groups.length,c:"#4CAF50"},{l:"تذاكر الدعم",v:supportTickets.length,c:T.danger}].map(function(s){
          return <div key={s.l} style={{flex:1,background:"rgba(10,22,40,0.9)",padding:"10px",textAlign:"center"}}><div style={{color:s.c,fontSize:"18px",fontWeight:"900"}}>{s.v}</div><div style={{color:T.textSec,fontSize:"10px"}}>{s.l}</div></div>;
        })}
      </div>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        {/* Sidebar */}
        <div style={{width:"190px",background:"rgba(10,22,40,0.8)",borderLeft:"1px solid rgba(255,215,0,0.08)",padding:"12px 8px",display:"flex",flexDirection:"column",gap:"3px",flexShrink:0,overflowY:"auto"}}>
          {TABS.map(function(t){
            return (
              <button key={t.k} onClick={function(){setTab(t.k);}}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:"10px",border:"none",background:tab===t.k?"linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,140,0,0.08))":"transparent",color:tab===t.k?T.gold:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:tab===t.k?"700":"400",textAlign:"right",width:"100%",borderRight:tab===t.k?"3px solid #ffd700":"3px solid transparent",transition:"all 0.2s"}}>
                <span>{t.l}</span>
                {t.c>0&&<span style={{background:T.danger,color:"#fff",borderRadius:"10px",minWidth:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"700",padding:"0 4px"}}>{t.c}</span>}
              </button>
            );
          })}
          <div style={{marginTop:"auto",paddingTop:"14px",borderTop:"1px solid rgba(255,215,0,0.06)",color:"rgba(255,215,0,0.15)",fontSize:"10px",textAlign:"center"}}>TERMEEN v4.1</div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"18px"}}>

          {/* USERS */}
          {tab==="users"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>👥 المستخدمون ({allUsers.length})</div>
              <input value={searchUser} onChange={function(e){setSearchUser(e.target.value);}} placeholder="بحث بالاسم أو @username..."
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"10px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",marginBottom:"14px",boxSizing:"border-box"}}
                onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                {filtered.map(function(u){
                  return (
                    <div key={u.uid} style={{background:T.card,borderRadius:"14px",padding:"13px",border:"1px solid "+T.border,cursor:"pointer",transition:"border 0.2s"}}
                      onMouseEnter={function(e){e.currentTarget.style.border="1px solid rgba(255,215,0,0.2)";}}
                      onMouseLeave={function(e){e.currentTarget.style.border="1px solid "+T.border;}}
                      onClick={function(){setSelectedUserDetail(u);}}>
                      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                        <Av name={u.displayName} size={44} color={u.color||rC(u.displayName)} photo={u.photoURL}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:T.text,fontWeight:"700",fontSize:"13px",display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap"}}>
                            {u.displayName}
                            {u.verified&&<Tag label="موثق ✓" color={T.accent}/>}
                            {u.isBanned&&<Tag label="محظور" color={T.danger}/>}
                            {u.isFraud&&<Tag label="احتيال" color={T.danger}/>}
                            {u.isRestricted&&<Tag label="مقيّد" color={T.gold}/>}
                            {u.username===OWNER_USERNAME&&<Tag label="OWNER 👑" color={T.gold}/>}
                          </div>
                          <div style={{color:T.textSec,fontSize:"11px"}}>@{u.username} · {u.email}</div>
                        </div>
                        <div style={{color:T.textSec,fontSize:"11px",flexShrink:0}}>اضغط للتفاصيل ›</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          {tab==="actions"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"18px"}}>⚡ إجراءات سريعة</div>
              <div style={{background:T.card,borderRadius:"16px",padding:"20px",border:"1px solid "+T.border}}>
                <div style={{color:T.goldDim,fontSize:"12px",fontWeight:"700",marginBottom:"12px"}}>أدخل @username ثم اختر الإجراء</div>
                <input value={actionInput} onChange={function(e){setActionInput(e.target.value);}} placeholder="@username"
                  style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"10px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",marginBottom:"14px",boxSizing:"border-box"}}
                  onFocus={function(e){e.target.style.borderColor=T.goldDim;}} onBlur={function(e){e.target.style.borderColor="rgba(255,215,0,0.15)";}}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"9px"}}>
                  {[{l:"🚫 حظر",a:"ban",c:T.danger},{l:"✅ رفع حظر",a:"unban",c:T.success},{l:"🔴 احتيال",a:"fraud",c:T.danger},{l:"🟢 إزالة احتيال",a:"unfraud",c:T.success},{l:"✅ توثيق",a:"verify",c:T.gold},{l:"❌ إزالة توثيق",a:"unverify",c:T.textSec},{l:"⚠️ تقييد",a:"restrict",c:"#ff9800"},{l:"🟢 رفع تقييد",a:"unrestrict",c:T.success},{l:"🗑 حذف",a:"delete",c:T.danger}].map(function(btn){
                    return <button key={btn.l} onClick={function(){doAction(btn.a);}} style={{padding:"11px",borderRadius:"10px",border:"1px solid "+btn.c+"30",background:btn.c+"12",color:btn.c,cursor:"pointer",fontFamily:"inherit",fontSize:"12.5px",fontWeight:"600",textAlign:"center"}} onMouseEnter={function(e){e.currentTarget.style.background=btn.c+"25";}} onMouseLeave={function(e){e.currentTarget.style.background=btn.c+"12";}}>{btn.l}</button>;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CHANNELS */}
          {tab==="channels"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>📢 القنوات ({channels.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {channels.map(function(c){
                  return (
                    <div key={c.id} style={{background:T.card,borderRadius:"14px",padding:"13px",border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:"12px"}}>
                      <Av name={c.name} size={44} color={rC(c.name)} photo={c.photoURL}/>
                      <div style={{flex:1}}>
                        <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>{c.name}{c.verified&&<Tag label="موثقة ✓" color={T.accent}/>}</div>
                        <div style={{color:T.textSec,fontSize:"12px"}}>@{c.username} · {c.subscribers||0} مشترك</div>
                      </div>
                      <ABt label={c.verified?"❌ توثيق":"✅ توثيق"} color={T.gold} onClick={async function(){await update(ref(db,"chats/"+c.id),{verified:!c.verified});}} small/>
                    </div>
                  );
                })}
                {channels.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"40px"}}>لا توجد قنوات</div>}
              </div>
            </div>
          )}

          {/* GROUPS */}
          {tab==="groups"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>👥 المجموعات ({groups.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {groups.map(function(g){
                  return (
                    <div key={g.id} style={{background:T.card,borderRadius:"14px",padding:"13px",border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:"12px"}}>
                      <Av name={g.name} size={44} color={rC(g.name)} photo={g.photoURL}/>
                      <div style={{flex:1}}>
                        <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>{g.name}{g.verified&&<Tag label="موثقة ✓" color={T.accent}/>}</div>
                        <div style={{color:T.textSec,fontSize:"12px"}}>@{g.username} · {(g.members||[]).length} عضو</div>
                      </div>
                      <ABt label={g.verified?"❌ توثيق":"✅ توثيق"} color={T.gold} onClick={async function(){await update(ref(db,"chats/"+g.id),{verified:!g.verified});}} small/>
                    </div>
                  );
                })}
                {groups.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"40px"}}>لا توجد مجموعات</div>}
              </div>
            </div>
          )}

          {/* SUPPORT */}
          {tab==="support"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>🆘 الدعم الفني ({supportTickets.length})</div>
              {supportTickets.length===0&&<div style={{color:T.textSec,textAlign:"center",padding:"60px"}}>لا توجد تذاكر دعم</div>}
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {supportTickets.map(function(ticket,i){
                  const tId="ticket_"+(ticket.info&&ticket.info.userId);
                  const msgs2=ticket.messages?Object.values(ticket.messages).sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);}):[];
                  const status=ticket.info&&ticket.info.status;
                  return (
                    <div key={i} style={{background:T.card,borderRadius:"16px",padding:"16px",border:"1px solid "+T.border}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                        <div>
                          <div style={{color:T.text,fontWeight:"700",fontSize:"14px"}}>@{ticket.info&&ticket.info.username} — {ticket.info&&ticket.info.displayName}</div>
                          {ticket.info&&ticket.info.ticketNum&&<div style={{color:T.textSec,fontSize:"11px"}}>🎫 {ticket.info.ticketNum}</div>}
                        </div>
                        <Tag label={status==="awaiting_human"?"⏳ ينتظر":status==="replied"?"✅ تم الرد":"🟢 مفتوح"} color={status==="awaiting_human"?T.gold:status==="replied"?T.success:T.accent}/>
                      </div>
                      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"10px",maxHeight:"180px",overflowY:"auto",marginBottom:"10px"}}>
                        {msgs2.map(function(m){
                          return (
                            <div key={m.id} style={{marginBottom:"8px"}}>
                              <div style={{color:m.from==="admin"?T.gold:m.from==="ai_bot"?"#4CAF50":T.accent,fontSize:"11px",fontWeight:"700",marginBottom:"2px"}}>
                                {m.from==="admin"?"👑 أنت":m.from==="ai_bot"?"🤖 AI":"👤 مستخدم"}
                                <span style={{color:T.textSec,fontSize:"10px",marginRight:"6px"}}>{m.time}</span>
                              </div>
                              <div style={{color:T.text,fontSize:"13px",lineHeight:"1.5",whiteSpace:"pre-wrap"}}>{m.text}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{display:"flex",gap:"8px"}}>
                        <InpField value={replyInput[tId]||""} onChange={function(e){const val=e.target.value;setReplyInput(function(p){const next=Object.assign({},p);next[tId]=val;return next;});}} placeholder="اكتب ردك..." onKeyDown={function(e){if(e.key==="Enter")sendReply(tId,ticket.info&&ticket.info.userId);}}/>
                        <button onClick={function(){sendReply(tId,ticket.info&&ticket.info.userId);}} style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",padding:"9px 16px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700",whiteSpace:"nowrap"}}>إرسال</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VERIFY */}
          {tab==="verify"&&(
            <div>
              <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"18px"}}>✅ التوثيق</div>
              {[
                {title:"توثيق حساب مستخدم",a:function(){doAction("verify");},label:"✅ توثيق"},
                {title:"إزالة توثيق مستخدم",a:function(){doAction("unverify");},label:"❌ إزالة"},
                {title:"توثيق قناة أو مجموعة",a:async function(){const u=actionInput.trim().replace("@","").toLowerCase();if(!u){alert("أدخل اسم المستخدم");return;}const s=await get(ref(db,"chatUsernames/"+u));if(!s.exists()){alert("لا توجد قناة بهذا الاسم");return;}await update(ref(db,"chats/"+s.val()),{verified:true});alert("✅ تم توثيق @"+u);setActionInput("");},label:"✅ توثيق قناة"},
              ].map(function(sec,i){
                return (
                  <div key={i} style={{background:T.card,borderRadius:"16px",padding:"18px",border:"1px solid "+T.border,marginBottom:"12px"}}>
                    <div style={{color:T.text,fontWeight:"700",fontSize:"14px",marginBottom:"12px"}}>{sec.title}</div>
                    <div style={{display:"flex",gap:"10px"}}>
                      <InpField value={actionInput} onChange={function(e){setActionInput(e.target.value);}} placeholder="@username"/>
                      <button onClick={sec.a} style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",padding:"9px 18px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700",whiteSpace:"nowrap"}}>{sec.label}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* APP CHANNEL */}
          {tab==="app_channel"&&<AppChannelManager db={db}/>}

          {/* BOTS */}
          {tab==="bots"&&<BotsManager db={db}/>}

        </div>
      </div>

      <style>{`
        * {box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.3);border-radius:4px}
        input::placeholder,textarea::placeholder{color:rgba(255,215,0,0.2)}
        input,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}

