import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, onValue, off } from "firebase/database";

const firebaseConfig = { apiKey:"AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc", authDomain:"tttrt-b8c5a.firebaseapp.com", databaseURL:"https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app", projectId:"tttrt-b8c5a", storageBucket:"tttrt-b8c5a.firebasestorage.app", messagingSenderId:"975123752593", appId:"1:975123752593:web:e591e930af3a3e29568130" };
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const OWNER_USERNAME = "tsaxp";
const APP_BOT_ID = "bot_dfgfd_official";
const uidGen = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const nowStr = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const nowFull = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const ACOLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722"];
const rC = s => ACOLORS[(s||"A").charCodeAt(0)%ACOLORS.length];
const T = { bg:"#050a0f", card:"rgba(10,22,40,0.95)", gold:"#ffd700", goldDim:"rgba(255,215,0,0.5)", text:"#e8f4fd", textSec:"#6b8ca4", danger:"#e05c5c", success:"#4dd67a", accent:"#5288c1" };

const Av = ({name,photo,size=44,color}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:photo?"transparent":(color||rC(name||"?")),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:"800",color:"#fff",overflow:"hidden",flexShrink:0}}>
    {photo?<img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
  </div>
);
const Tag = ({label,color}) => <span style={{background:`${color}20`,color,fontSize:"10px",fontWeight:"700",padding:"2px 7px",borderRadius:"6px"}}>{label}</span>;
const ABt = ({label,color,onClick}) => <button onClick={onClick} style={{padding:"7px 12px",borderRadius:"8px",border:`1px solid ${color}30`,background:`${color}15`,color,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}} onMouseEnter={e=>e.currentTarget.style.background=`${color}25`} onMouseLeave={e=>e.currentTarget.style.background=`${color}15`}>{label}</ABt>;

function AdminLogin({onLogin}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState(""); const [time,setTime]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  const handle=async()=>{
    if(!email||!pass){setErr("أدخل البريد وكلمة المرور");return;}
    setLoading(true);setErr("");
    try {
      const cred=await signInWithEmailAndPassword(auth,email,pass);
      const snap=await get(ref(db,`users/${cred.user.uid}`));
      if(!snap.exists()||snap.val().username!==OWNER_USERNAME){await signOut(auth);setErr("⛔ هذه البوابة للمالك فقط");setLoading(false);return;}
      onLogin(snap.val());
    } catch(e){const m={"auth/invalid-credential":"بيانات الدخول غير صحيحة","auth/user-not-found":"الحساب غير موجود"};setErr(m[e.code]||e.message);}
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",padding:"20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,215,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.025) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      <div style={{width:"100%",maxWidth:"390px",position:"relative",zIndex:10}}>
        <div style={{textAlign:"center",marginBottom:"8px"}}><span style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",color:"#000",fontSize:"11px",fontWeight:"800",padding:"4px 16px",borderRadius:"20px",letterSpacing:"2px"}}>OWNER ACCESS ONLY</span></div>
        <div style={{background:T.card,borderRadius:"22px",padding:"36px",border:"1px solid rgba(255,215,0,0.15)",boxShadow:"0 40px 80px rgba(0,0,0,0.8)"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <div style={{width:"76px",height:"76px",borderRadius:"50%",margin:"0 auto 14px",background:"linear-gradient(135deg,#ffd700,#ff8c00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"34px",boxShadow:"0 0 30px rgba(255,215,0,0.4)"}}>👑</div>
            <div style={{color:T.gold,fontSize:"20px",fontWeight:"900",letterSpacing:"3px"}}>TSAXP</div>
            <div style={{color:T.goldDim,fontSize:"11px",letterSpacing:"2px",marginTop:"3px"}}>بوابة المالك — تيرمين</div>
            <div style={{color:T.gold,fontSize:"16px",fontWeight:"700",marginTop:"10px",fontVariantNumeric:"tabular-nums"}}>{time.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"13px"}}>
            <div>
              <label style={{color:T.goldDim,fontSize:"11px",fontWeight:"700",letterSpacing:"1px",display:"block",marginBottom:"5px"}}>البريد الإلكتروني</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="owner@termeen.app" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"12px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"ltr",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"}/>
            </div>
            <div>
              <label style={{color:T.goldDim,fontSize:"11px",fontWeight:"700",letterSpacing:"1px",display:"block",marginBottom:"5px"}}>كلمة المرور</label>
              <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"12px 14px",color:"#fff",fontSize:"14px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"}/>
            </div>
            {err&&<div style={{background:"rgba(220,50,50,0.1)",border:"1px solid rgba(220,50,50,0.3)",borderRadius:"10px",padding:"10px",color:"#ff6b6b",fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
            <button onClick={handle} disabled={loading} style={{width:"100%",padding:"14px",background:loading?"rgba(255,215,0,0.3)":"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"12px",color:"#000",fontWeight:"900",fontSize:"15px",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",marginTop:"4px",transition:"all 0.3s"}} onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 30px rgba(255,215,0,0.5)";}}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
              {loading?"⟳ جاري التحقق...":"🔓 دخول بوابة المالك"}
            </button>
          </div>
          <div style={{marginTop:"18px",padding:"10px",borderRadius:"10px",background:"rgba(255,50,50,0.05)",border:"1px solid rgba(255,50,50,0.1)",textAlign:"center",color:"rgba(255,100,100,0.6)",fontSize:"11px",lineHeight:"1.7"}}>🔒 هذه البوابة مخصصة للمالك فقط</div>
        </div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} input::placeholder{color:rgba(255,215,0,0.2)} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function AdminPanel() {
  const [adminUser,setAdminUser]=useState(null); const [authLoading,setAuthLoading]=useState(true); const [tab,setTab]=useState("users");
  const [allUsers,setAllUsers]=useState([]); const [allChats,setAllChats]=useState([]); const [supportTickets,setSupportTickets]=useState([]);
  const [selectedUser,setSelectedUser]=useState(null); const [searchUser,setSearchUser]=useState(""); const [actionInput,setActionInput]=useState("");
  const [replyInput,setReplyInput]=useState({}); const [time,setTime]=useState(new Date()); const [userChats,setUserChats]=useState(null);

  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const unsub=onAuthStateChanged(auth,async u=>{if(u){const snap=await get(ref(db,`users/${u.uid}`));if(snap.exists()&&snap.val().username===OWNER_USERNAME)setAdminUser(snap.val());else{await signOut(auth);setAdminUser(null);}}else setAdminUser(null);setAuthLoading(false);});return()=>unsub();},[]);
  useEffect(()=>{if(!adminUser)return;const ur=ref(db,"users");const cr=ref(db,"chats");const sr=ref(db,"support");onValue(ur,s=>{if(s.exists())setAllUsers(Object.values(s.val()));});onValue(cr,s=>{if(s.exists())setAllChats(Object.values(s.val()));else setAllChats([]);});onValue(sr,s=>{if(s.exists())setSupportTickets(Object.values(s.val()));else setSupportTickets([]);});return()=>{off(ur);off(cr);off(sr);};},[adminUser]);

  const doAction=async(action,targetUsername)=>{
    const uname=(targetUsername||actionInput).trim().replace("@","").toLowerCase();
    if(!uname){alert("أدخل اسم المستخدم");return;}
    const snap=await get(ref(db,`usernames/${uname}`));
    if(!snap.exists()){alert(`لا يوجد مستخدم @${uname}`);return;}
    const uid2=snap.val();
    if(action==="delete"){if(!window.confirm(`حذف @${uname} نهائياً؟`))return;await remove(ref(db,`users/${uid2}`));await remove(ref(db,`usernames/${uname}`));alert(`✅ تم حذف @${uname}`);setActionInput("");return;}
    const map={ban:{isBanned:true},unban:{isBanned:false},fraud:{isFraud:true},unfraud:{isFraud:false},verify:{verified:true},unverify:{verified:false},restrict:{isRestricted:true},unrestrict:{isRestricted:false}};
    if(map[action]){await update(ref(db,`users/${uid2}`),map[action]);const botId=`bot_${uid2}`;const nid=uidGen();const msgs={ban:"⚠️ تم تعليق حسابك",unban:"✅ تم رفع تعليق حسابك",fraud:"🔴 تم وضع علامة احتيال",unfraud:"✅ تم إزالة علامة الاحتيال",verify:"✅ تم توثيق حسابك",unverify:"ℹ️ تم إزالة التوثيق",restrict:"⚠️ تم تقييد حسابك",unrestrict:"✅ تم رفع التقييد"};await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`${msgs[action]}\n🕐 ${nowFull()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});alert(`✅ تم: ${action} على @${uname}`);setActionInput("");}
  };

  const viewUser=async(u)=>{
    setSelectedUser(selectedUser?.uid===u.uid?null:u);
    if(selectedUser?.uid!==u.uid){const snap=await get(ref(db,`userChats/${u.uid}`));if(snap.exists()){const list=await Promise.all(Object.values(snap.val()).map(async uc=>{const cs=await get(ref(db,`chats/${uc.chatId}`));return cs.exists()?{...cs.val(),...uc}:null;}));setUserChats(list.filter(Boolean));}else setUserChats([]);}else setUserChats(null);
  };

  const sendReply=async(ticketId,userId)=>{
    const text=replyInput[ticketId];if(!text?.trim())return;
    const msgId=uidGen();await set(ref(db,`support/${ticketId}/messages/${msgId}`),{id:msgId,text:text.trim(),from:"admin",time:nowStr(),createdAt:Date.now()});await update(ref(db,`support/${ticketId}/info`),{status:"replied"});
    const botId=`bot_${userId}`;const nid=uidGen();await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`💬 رد من الدعم الفني:\n\n${text.trim()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
    setReplyInput(p=>({...p,[ticketId]:""}));
  };

  if(authLoading)return<div style={{height:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.gold,fontSize:"20px",fontFamily:"'Segoe UI',sans-serif"}}>جاري التحميل...</div>;
  if(!adminUser)return<AdminLogin onLogin={setAdminUser}/>;

  const channels=allChats.filter(c=>c.type==="channel");
  const groups=allChats.filter(c=>c.type==="group");
  const filtered=allUsers.filter(u=>(u.username||"").includes(searchUser.toLowerCase())||(u.displayName||"").toLowerCase().includes(searchUser.toLowerCase()));
  const openTickets=supportTickets.filter(t=>t.info?.status==="open"||t.info?.status==="awaiting_human").length;

  const TABS=[{k:"users",l:"👥 المستخدمون",c:allUsers.length},{k:"actions",l:"⚡ إجراءات",c:null},{k:"channels",l:"📢 القنوات",c:channels.length},{k:"groups",l:"👥 المجموعات",c:groups.length},{k:"support",l:"🆘 الدعم",c:openTickets||null},{k:"verify",l:"✅ التوثيق",c:null}];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",display:"flex",flexDirection:"column"}}>
      <div style={{background:"linear-gradient(135deg,rgba(10,22,40,0.98),rgba(5,10,15,0.99))",borderBottom:"1px solid rgba(255,215,0,0.15)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"22px"}}>👑</span><div><div style={{color:T.gold,fontWeight:"900",fontSize:"16px",letterSpacing:"1px"}}>لوحة تحكم المالك</div><div style={{color:"rgba(255,215,0,0.35)",fontSize:"11px"}}>✈️ تيرمين — {adminUser.displayName}</div></div></div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{color:T.gold,fontSize:"13px",fontWeight:"700",fontVariantNumeric:"tabular-nums"}}>{time.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
          <Av name={adminUser.displayName} size={34} color={rC(adminUser.displayName)} photo={adminUser.photoURL}/>
          <button onClick={()=>signOut(auth)} style={{background:"rgba(255,50,50,0.15)",border:"1px solid rgba(255,50,50,0.3)",borderRadius:"8px",padding:"6px 12px",color:"#ff6b6b",cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>خروج</button>
        </div>
      </div>
      <div style={{display:"flex",gap:"1px",background:"rgba(255,215,0,0.05)",borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
        {[{l:"المستخدمون",v:allUsers.length,c:T.accent},{l:"القنوات",v:channels.length,c:T.gold},{l:"المجموعات",v:groups.length,c:"#4CAF50"},{l:"تذاكر الدعم",v:supportTickets.length,c:T.danger}].map(s=>(
          <div key={s.l} style={{flex:1,background:"rgba(10,22,40,0.9)",padding:"10px",textAlign:"center"}}><div style={{color:s.c,fontSize:"18px",fontWeight:"900"}}>{s.v}</div><div style={{color:T.textSec,fontSize:"10px"}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",flex:1,minHeight:0}}>
        <div style={{width:"190px",background:"rgba(10,22,40,0.8)",borderLeft:"1px solid rgba(255,215,0,0.08)",padding:"12px 8px",display:"flex",flexDirection:"column",gap:"4px",flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:"10px",border:"none",background:tab===t.k?"linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,140,0,0.08))":"transparent",color:tab===t.k?T.gold:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:tab===t.k?"700":"400",textAlign:"right",width:"100%",borderRight:tab===t.k?"3px solid #ffd700":"3px solid transparent",transition:"all 0.2s"}}>
              <span>{t.l}</span>
              {t.c>0&&<span style={{background:T.danger,color:"#fff",borderRadius:"10px",minWidth:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"700",padding:"0 4px"}}>{t.c}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto",paddingTop:"14px",borderTop:"1px solid rgba(255,215,0,0.06)",color:"rgba(255,215,0,0.15)",fontSize:"10px",textAlign:"center",letterSpacing:"1px"}}>TERMEEN v4.0</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"18px"}}>

          {tab==="users"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}><div style={{color:T.gold,fontSize:"17px",fontWeight:"800"}}>👥 المستخدمون ({allUsers.length})</div></div>
            <input value={searchUser} onChange={e=>setSearchUser(e.target.value)} placeholder="بحث بالاسم أو @username..." style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"10px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",marginBottom:"14px",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"}/>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {filtered.map(u=>(
                <div key={u.uid} style={{background:T.card,borderRadius:"14px",padding:"14px",border:"1px solid rgba(255,215,0,0.08)",cursor:"pointer",transition:"border 0.2s"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid rgba(255,215,0,0.2)"} onMouseLeave={e=>e.currentTarget.style.border="1px solid rgba(255,215,0,0.08)"} onClick={()=>viewUser(u)}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <Av name={u.displayName} size={44} color={u.color||rC(u.displayName)} photo={u.photoURL}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap"}}>
                        {u.displayName}
                        {u.verified&&<Tag label="موثق ✓" color={T.accent}/>}
                        {u.isBanned&&<Tag label="محظور" color={T.danger}/>}
                        {u.isFraud&&<Tag label="احتيال 🔴" color={T.danger}/>}
                        {u.isRestricted&&<Tag label="مقيّد" color={T.gold}/>}
                        {u.username===OWNER_USERNAME&&<Tag label="OWNER 👑" color={T.gold}/>}
                      </div>
                      <div style={{color:T.textSec,fontSize:"12px"}}>@{u.username} · {u.email}</div>
                      <div style={{color:T.textSec,fontSize:"11px"}}>ID: {(u.uid||"").slice(0,16)}...</div>
                    </div>
                  </div>
                  {selectedUser?.uid===u.uid&&(
                    <div style={{marginTop:"14px",borderTop:"1px solid rgba(255,215,0,0.08)",paddingTop:"14px"}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"10px"}}>
                        <ABt label={u.isBanned?"رفع الحظر ✅":"حظر 🚫"} color={u.isBanned?T.success:T.danger} onClick={e=>{e.stopPropagation();doAction(u.isBanned?"unban":"ban",u.username);}}/>
                        <ABt label={u.isFraud?"إزالة احتيال":"احتيال 🔴"} color={T.danger} onClick={e=>{e.stopPropagation();doAction(u.isFraud?"unfraud":"fraud",u.username);}}/>
                        <ABt label={u.verified?"إزالة توثيق":"توثيق ✅"} color={T.gold} onClick={e=>{e.stopPropagation();doAction(u.verified?"unverify":"verify",u.username);}}/>
                        <ABt label={u.isRestricted?"رفع تقييد":"تقييد ⚠️"} color="#ff9800" onClick={e=>{e.stopPropagation();doAction(u.isRestricted?"unrestrict":"restrict",u.username);}}/>
                        <ABt label="حذف 🗑" color={T.danger} onClick={e=>{e.stopPropagation();doAction("delete",u.username);}}/>
                      </div>
                      {userChats&&<div><div style={{color:T.textSec,fontSize:"11px",fontWeight:"700",marginBottom:"7px"}}>محادثاته ({userChats.length}):</div><div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>{userChats.slice(0,10).map((c,i)=><span key={i} style={{background:"rgba(255,255,255,0.05)",color:T.textSec,fontSize:"11px",padding:"3px 9px",borderRadius:"7px"}}>{c.type==="channel"?"📢":c.type==="group"?"👥":c.type==="saved"?"🔖":"💬"} {c.name||"محادثة"}</span>)}</div></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>}

          {tab==="actions"&&<div>
            <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"18px"}}>⚡ إجراءات سريعة</div>
            <div style={{background:T.card,borderRadius:"16px",padding:"20px",border:"1px solid rgba(255,215,0,0.08)"}}>
              <div style={{color:T.goldDim,fontSize:"12px",fontWeight:"700",marginBottom:"12px"}}>أدخل @username ثم اختر الإجراء</div>
              <input value={actionInput} onChange={e=>setActionInput(e.target.value)} placeholder="@username" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"10px 14px",color:"#fff",fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",marginBottom:"14px",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"9px"}}>
                {[{l:"🚫 حظر",a:"ban",c:T.danger},{l:"✅ رفع حظر",a:"unban",c:T.success},{l:"🔴 احتيال",a:"fraud",c:T.danger},{l:"🟢 إزالة احتيال",a:"unfraud",c:T.success},{l:"✅ توثيق",a:"verify",c:T.gold},{l:"❌ إزالة توثيق",a:"unverify",c:T.textSec},{l:"⚠️ تقييد",a:"restrict",c:"#ff9800"},{l:"🟢 رفع تقييد",a:"unrestrict",c:T.success},{l:"🗑 حذف",a:"delete",c:T.danger}].map(btn=>(
                  <button key={btn.l} onClick={()=>doAction(btn.a)} style={{padding:"11px",borderRadius:"10px",border:`1px solid ${btn.c}30`,background:`${btn.c}12`,color:btn.c,cursor:"pointer",fontFamily:"inherit",fontSize:"12.5px",fontWeight:"600",transition:"all 0.2s",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.background=`${btn.c}25`} onMouseLeave={e=>e.currentTarget.style.background=`${btn.c}12`}>{btn.l}</button>
                ))}
              </div>
            </div>
          </div>}

          {tab==="channels"&&<div>
            <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>📢 القنوات ({channels.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {channels.map(c=>(
                <div key={c.id} style={{background:T.card,borderRadius:"14px",padding:"14px",border:"1px solid rgba(255,215,0,0.08)",display:"flex",alignItems:"center",gap:"12px"}}>
                  <Av name={c.name} size={44} color={rC(c.name)} photo={c.photoURL}/>
                  <div style={{flex:1}}><div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>{c.name}{c.verified&&<Tag label="موثقة ✓" color={T.accent}/>}</div><div style={{color:T.textSec,fontSize:"12px"}}>@{c.username} · {c.subscribers||0} مشترك</div></div>
                  <ABt label={c.verified?"إزالة توثيق":"✅ توثيق"} color={T.gold} onClick={async()=>await update(ref(db,`chats/${c.id}`),{verified:!c.verified})}/>
                </div>
              ))}
              {!channels.length&&<div style={{color:T.textSec,textAlign:"center",padding:"40px"}}>لا توجد قنوات</div>}
            </div>
          </div>}

          {tab==="groups"&&<div>
            <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>👥 المجموعات ({groups.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {groups.map(g=>(
                <div key={g.id} style={{background:T.card,borderRadius:"14px",padding:"14px",border:"1px solid rgba(255,215,0,0.08)",display:"flex",alignItems:"center",gap:"12px"}}>
                  <Av name={g.name} size={44} color={rC(g.name)} photo={g.photoURL}/>
                  <div style={{flex:1}}><div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>{g.name}{g.verified&&<Tag label="موثقة ✓" color={T.accent}/>}</div><div style={{color:T.textSec,fontSize:"12px"}}>@{g.username} · {g.members?.length||0} عضو</div></div>
                  <ABt label={g.verified?"إزالة توثيق":"✅ توثيق"} color={T.gold} onClick={async()=>await update(ref(db,`chats/${g.id}`),{verified:!g.verified})}/>
                </div>
              ))}
              {!groups.length&&<div style={{color:T.textSec,textAlign:"center",padding:"40px"}}>لا توجد مجموعات</div>}
            </div>
          </div>}

          {tab==="support"&&<div>
            <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"14px"}}>🆘 الدعم الفني ({supportTickets.length})</div>
            {!supportTickets.length&&<div style={{color:T.textSec,textAlign:"center",padding:"60px"}}>لا توجد تذاكر دعم</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {supportTickets.map((ticket,i)=>{
                const tId=`ticket_${ticket.info?.userId}`;
                const msgs=ticket.messages?Object.values(ticket.messages).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)):[];
                return (
                  <div key={i} style={{background:T.card,borderRadius:"16px",padding:"16px",border:"1px solid rgba(255,215,0,0.08)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                      <div><div style={{color:T.text,fontWeight:"700",fontSize:"14px"}}>@{ticket.info?.username} — {ticket.info?.displayName}</div></div>
                      <Tag label={ticket.info?.status==="awaiting_human"?"⏳ ينتظر":ticket.info?.status==="replied"?"✅ تم الرد":"🟢 مفتوح"} color={ticket.info?.status==="awaiting_human"?T.gold:ticket.info?.status==="replied"?T.success:T.accent}/>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"10px",maxHeight:"180px",overflowY:"auto",marginBottom:"10px"}}>
                      {msgs.map(m=>(
                        <div key={m.id} style={{marginBottom:"8px"}}>
                          <div style={{color:m.from==="admin"?T.gold:m.from==="ai_bot"?"#4CAF50":T.accent,fontSize:"11px",fontWeight:"700",marginBottom:"2px"}}>{m.from==="admin"?"👑 أنت":m.from==="ai_bot"?"🤖 AI":"👤 مستخدم"} <span style={{color:T.textSec,fontSize:"10px"}}>{m.time}</span></div>
                          <div style={{color:T.text,fontSize:"13px",lineHeight:"1.5",whiteSpace:"pre-wrap"}}>{m.text}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:"8px"}}>
                      <input value={replyInput[tId]||""} onChange={e=>setReplyInput(p=>({...p,[tId]:e.target.value}))} placeholder="اكتب ردك..." style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"} onKeyDown={e=>{if(e.key==="Enter")sendReply(tId,ticket.info?.userId);}}/>
                      <button onClick={()=>sendReply(tId,ticket.info?.userId)} style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",padding:"9px 16px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>إرسال</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>}

          {tab==="verify"&&<div>
            <div style={{color:T.gold,fontSize:"17px",fontWeight:"800",marginBottom:"18px"}}>✅ التوثيق</div>
            {[{title:"توثيق حساب مستخدم",a:()=>doAction("verify"),label:"✅ توثيق"},{title:"إزالة توثيق مستخدم",a:()=>doAction("unverify"),label:"❌ إزالة"},{title:"توثيق قناة أو مجموعة",a:async()=>{const u=actionInput.trim().replace("@","").toLowerCase();if(!u){alert("أدخل اسم المستخدم");return;}const s=await get(ref(db,`chatUsernames/${u}`));if(!s.exists()){alert("لا توجد قناة بهذا الاسم");return;}await update(ref(db,`chats/${s.val()}`),{verified:true});alert(`✅ تم توثيق @${u}`);setActionInput("");},label:"✅ توثيق قناة"}].map((sec,i)=>(
              <div key={i} style={{background:T.card,borderRadius:"16px",padding:"18px",border:"1px solid rgba(255,215,0,0.08)",marginBottom:"12px"}}>
                <div style={{color:T.text,fontWeight:"700",fontSize:"14px",marginBottom:"12px"}}>{sec.title}</div>
                <div style={{display:"flex",gap:"10px"}}>
                  <input value={actionInput} onChange={e=>setActionInput(e.target.value)} placeholder="@username" style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.15)"}/>
                  <button onClick={sec.a} style={{background:"linear-gradient(135deg,#ffd700,#ff8c00)",border:"none",borderRadius:"10px",padding:"9px 18px",color:"#000",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700",whiteSpace:"nowrap"}}>{sec.label}</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.3);border-radius:4px} input::placeholder{color:rgba(255,215,0,0.2)} input,button{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
