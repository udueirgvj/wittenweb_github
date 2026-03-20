import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, push, onValue, off, update, remove, query, orderByChild, equalTo, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.firebasestorage.app",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af3a3e29568130",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==================== CONSTANTS ====================
const OWNER_UID = "TSAXP_OWNER_FIXED_UID";
const OWNER_USERNAME = "TSAXP";
const OWNER_EMAIL = "tsaxp@termeen.app";
const BOT_ID = "bot_tsaxp_official";

const T = {
  bg: "#17212b", sidebar: "#0e1621", panel: "#182533",
  accent: "#2b5278", accentBtn: "#5288c1", text: "#e8f4fd",
  textSec: "#6b8ca4", msgOut: "#2b5278", msgIn: "#182533",
  border: "#0d1822", inputBg: "#1c2d3d", hover: "#1c2d3d",
  online: "#4dd67a", unread: "#5288c1", danger: "#e05c5c",
  gold: "#f0a040", verified: "#5288c1", fraud: "#e05c5c",
};

const ACOLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722","#607D8B"];
const rColor = (s) => ACOLORS[(s||"A").charCodeAt(0) % ACOLORS.length];
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);
const nowStr = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const nowFull = () => { const d=new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")} · ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const fmtSize = (b) => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const hashStr = async (str) => { const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str)); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join(""); };

// ==================== ICONS ====================
const SVG = {
  send:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke={c} strokeWidth="2"/><path d="M5 10C5 14.418 8.134 18 12 18C15.866 18 19 14.418 19 10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  attach:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05L12.25 20.24C10.5 21.99 7.75 21.99 6 20.24C4.25 18.49 4.25 15.74 6 13.99L14.5 5.49C15.67 4.32 17.58 4.32 18.75 5.49C19.92 6.66 19.92 8.57 18.75 9.74L10.24 18.24C9.66 18.82 8.72 18.82 8.13 18.24C7.55 17.66 7.55 16.72 8.13 16.13L15.92 8.34" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2"/><path d="M21 21L16.65 16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  menu:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  back:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={c}/><circle cx="12" cy="12" r="1.5" fill={c}/><circle cx="12" cy="19" r="1.5" fill={c}/></svg>,
  call:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke={c} strokeWidth="2"/></svg>,
  checks:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="18 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 6 13 17" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  file:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2"/></svg>,
  user:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="2"/></svg>,
  group:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  channel:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L8 8H3l4.5 4.5-2 7L12 16l6.5 3.5-2-7L21 8h-5L12 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  settings:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/></svg>,
  trash:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4h6v2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  edit:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bot:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="3" stroke={c} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="16" r="1.5" fill={c}/><circle cx="16" cy="16" r="1.5" fill={c}/><line x1="9.5" y1="19" x2="14.5" y2="19" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  support:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  saved:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={c}/><path d="M21 15L16 10L5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/></svg>,
  eyeOff:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  crown:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  notification:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const Ic = ({ n, s=20, c=T.textSec }) => SVG[n] ? SVG[n](c,s) : <span style={{color:c,fontSize:s}}></span>;

// ==================== UI COMPONENTS ====================
const Av = ({ name, color, size=46, online=false, verified=false, photo=null, fraud=false }) => (
  <div style={{ position:"relative", flexShrink:0 }}>
    <div style={{ width:size, height:size, borderRadius:"50%", background:photo?"transparent":(color||rColor(name||"?")), display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:"800", color:"#fff", overflow:"hidden", border: fraud ? `2px solid ${T.fraud}` : "none" }}>
      {photo ? <img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (name||"?").charAt(0).toUpperCase()}
    </div>
    {online && <div style={{ position:"absolute", bottom:1, right:1, width:size*0.26, height:size*0.26, borderRadius:"50%", background:T.online, border:`2px solid ${T.sidebar}` }}/>}
    {verified && <div style={{ position:"absolute", bottom:-2, left:-2, background:T.verified, borderRadius:"50%", width:size*0.32, height:size*0.32, display:"flex", alignItems:"center", justifyContent:"center", border:`1.5px solid ${T.sidebar}` }}><Ic n="check" s={size*0.18} c="#fff"/></div>}
  </div>
);

const Btn = ({children,onClick,style={},disabled=false,...rest}) => (
  <button onClick={onClick} disabled={disabled} style={{ background:"none", border:"none", cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:"7px", borderRadius:"50%", transition:"background 0.15s", opacity:disabled?0.5:1, ...style }}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>e.currentTarget.style.background=(style.background||"none")} {...rest}>
    {children}
  </button>
);

const Modal = ({title,children,onClose,width="440px"}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div style={{background:"#1a2a3a",borderRadius:"18px",padding:"26px",width,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.65)",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
        <h3 style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>{title}</h3>
        <Btn onClick={onClose}><Ic n="close" s={18}/></Btn>
      </div>
      {children}
    </div>
  </div>
);

const FInput = ({label,value,onChange,placeholder,type="text",icon=null,style={}}) => {
  const [show,setShow]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"6px",...style}}>
      {label&&<label style={{color:T.textSec,fontSize:"12px",fontWeight:"600"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {icon&&<div style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)"}}><Ic n={icon} s={16}/></div>}
        <input value={value} onChange={onChange} placeholder={placeholder} type={type==="password"&&show?"text":type}
          style={{background:T.inputBg,border:`1px solid ${T.border}44`,borderRadius:"12px",padding:`12px ${icon?"38px":"14px"} 12px 14px`,color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",boxSizing:"border-box",transition:"border 0.2s"}}
          onFocus={e=>e.target.style.borderColor=T.accentBtn} onBlur={e=>e.target.style.borderColor=`${T.border}44`}/>
        {type==="password"&&<button onClick={()=>setShow(!show)} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer"}}><Ic n={show?"eyeOff":"eye"} s={16}/></button>}
      </div>
    </div>
  );
};

const PBtn = ({children,onClick,loading=false,color=T.accentBtn,disabled=false}) => (
  <button onClick={onClick} disabled={loading||disabled}
    style={{background:color,border:"none",borderRadius:"12px",padding:"13px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:(loading||disabled)?"not-allowed":"pointer",fontFamily:"inherit",width:"100%",transition:"opacity 0.15s",opacity:(loading||disabled)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}
    onMouseEnter={e=>{if(!loading&&!disabled)e.currentTarget.style.opacity="0.85";}} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
    {loading?<span style={{animation:"spin 0.8s linear infinite",display:"inline-block"}}>⟳</span>:children}
  </button>
);

// ==================== AUTH SCREEN ====================
function AuthScreen({onAuth}) {
  const [mode,setMode]=useState("login"); // login | register
  const [form,setForm]=useState({displayName:"",username:"",email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const F = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleRegister = async () => {
    if(!form.displayName||!form.username||!form.email||!form.password){setErr("يرجى ملء جميع الحقول");return;}
    if(form.username.length<3){setErr("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");return;}
    if(!/^[a-zA-Z0-9_]+$/.test(form.username)){setErr("اسم المستخدم يجب أن يحتوي على حروف وأرقام وشرطة سفلية فقط");return;}
    if(form.password.length<6){setErr("كلمة المرور يجب أن تكون 6 أحرف على الأقل");return;}
    setLoading(true); setErr("");
    try {
      // Check username uniqueness
      const usernameSnap = await get(query(ref(db,"users"),orderByChild("username"),equalTo(form.username.toLowerCase())));
      if(usernameSnap.exists()){setErr("اسم المستخدم مستخدم بالفعل");setLoading(false);return;}
      
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, {displayName: form.displayName});
      
      const userId = cred.user.uid;
      const passwordHash = await hashStr(form.password);
      
      // Save user data
      await set(ref(db,`users/${userId}`), {
        uid: userId,
        displayName: form.displayName,
        username: form.username.toLowerCase(),
        email: form.email,
        passwordHash,
        bio: "",
        photoURL: "",
        verified: false,
        isBanned: false,
        isRestricted: false,
        isFraud: false,
        twoFactor: false,
        createdAt: Date.now(),
        lastSeen: Date.now(),
        color: ACOLORS[form.displayName.charCodeAt(0)%ACOLORS.length],
      });

      // Save username index
      await set(ref(db,`usernames/${form.username.toLowerCase()}`), userId);

      // Create TSAXP bot chat for new user
      const savedChatId = `saved_${userId}`;
      const botChatId = `bot_${userId}`;
      await set(ref(db,`chats/${savedChatId}`),{id:savedChatId,type:"saved",name:"الرسائل المحفوظة",members:[userId],createdAt:Date.now()});
      await set(ref(db,`userChats/${userId}/${savedChatId}`),{chatId:savedChatId,lastMessage:"احفظ رسائلك هنا",lastTime:nowStr(),unread:0,order:Date.now()});

      await set(ref(db,`chats/${botChatId}`),{id:botChatId,type:"bot",name:"TSAXP",username:"tsaxp",isOfficial:true,members:[userId,BOT_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${userId}/${botChatId}`),{chatId:botChatId,lastMessage:"مرحباً بك في تيرمين! 🎉",lastTime:nowStr(),unread:1,order:Date.now()-1});
      
      // Welcome message from bot
      const wMsgId = uid();
      await set(ref(db,`messages/${botChatId}/${wMsgId}`),{
        id:wMsgId, chatId:botChatId, text:`🎉 مرحباً ${form.displayName}!\n\nأنا TSAXP، المساعد الرسمي لتيرمين.\n\nمعرّفك: @${form.username}\nرقم حسابك: ${userId.slice(0,8).toUpperCase()}\n\nيمكنك من هنا:\n• استقبال رموز تسجيل الدخول\n• إشعارات الأمان\n• الدعم الفني\n\n✈️ تيرمين — تواصل أسرع وأآمن!`, from:BOT_ID, time:nowStr(), type:"text", isBot:true, createdAt:Date.now()
      });

    } catch(e) {
      const msgs = {
        "auth/email-already-in-use":"البريد الإلكتروني مستخدم بالفعل",
        "auth/invalid-email":"بريد إلكتروني غير صالح",
        "auth/weak-password":"كلمة المرور ضعيفة جداً",
        "auth/network-request-failed":"خطأ في الاتصال بالإنترنت",
      };
      setErr(msgs[e.code]||("حدث خطأ: "+e.message));
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if(!form.email||!form.password){setErr("يرجى ملء جميع الحقول");return;}
    setLoading(true); setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      await update(ref(db,`users/${cred.user.uid}`),{lastSeen:Date.now()});
    } catch(e) {
      const msgs = {
        "auth/user-not-found":"لا يوجد حساب بهذا البريد",
        "auth/wrong-password":"كلمة المرور غير صحيحة",
        "auth/invalid-credential":"بيانات الدخول غير صحيحة",
        "auth/network-request-failed":"خطأ في الاتصال بالإنترنت",
      };
      setErr(msgs[e.code]||("حدث خطأ: "+e.message));
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"64px",marginBottom:"12px",filter:"drop-shadow(0 8px 24px rgba(82,136,193,0.4))"}}>✈️</div>
          <div style={{color:T.text,fontSize:"28px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
          <div style={{color:T.textSec,fontSize:"13px",marginTop:"6px"}}>تواصل أسرع · أسهل · أكثر أماناً</div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:T.panel,borderRadius:"14px",padding:"4px",marginBottom:"24px",gap:"4px"}}>
          {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{flex:1,padding:"10px",borderRadius:"11px",border:"none",background:mode===k?T.accentBtn:"transparent",color:mode===k?"#fff":T.textSec,fontWeight:"700",fontSize:"14px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>

        {/* Form */}
        <div style={{background:T.sidebar,borderRadius:"18px",padding:"24px",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:"14px"}}>
          {mode==="register"&&<FInput label="الاسم الشخصي" value={form.displayName} onChange={F("displayName")} placeholder="اسمك الكامل..." icon="user"/>}
          {mode==="register"&&<FInput label="اسم المستخدم" value={form.username} onChange={F("username")} placeholder="username (بدون @)..." icon="user"/>}
          <FInput label="البريد الإلكتروني" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" icon="user"/>
          <FInput label="كلمة المرور" value={form.password} onChange={F("password")} placeholder="••••••••" type="password" icon="lock"/>
          
          {err&&<div style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"10px",padding:"10px 14px",color:T.danger,fontSize:"13px",textAlign:"center"}}>{err}</div>}
          
          <PBtn onClick={mode==="login"?handleLogin:handleRegister} loading={loading}>
            {mode==="login"?"🔐 تسجيل الدخول":"✨ إنشاء حساب جديد"}
          </PBtn>
          
          {mode==="register"&&(
            <div style={{color:T.textSec,fontSize:"12px",textAlign:"center",lineHeight:"1.6"}}>
              بإنشاء حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function Termeen() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [attachMenu, setAttachMenu] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [modal, setModal] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth<768);
  const [panel, setPanel] = useState("chats"); // chats | settings | admin | support
  const [searchMode, setSearchMode] = useState(false);
  const [newForm, setNewForm] = useState({name:"",username:"",bio:"",type:"group"});
  const [isOwner, setIsOwner] = useState(false);

  // Admin state
  const [allUsers, setAllUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [verifyRequests, setVerifyRequests] = useState([]);
  const [adminTab, setAdminTab] = useState("users"); // users | support | verify

  // Settings state
  const [editProfile, setEditProfile] = useState({displayName:"",bio:"",username:""});
  const [settingsTab, setSettingsTab] = useState("profile");

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const msgListenerRef = useRef(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(u){
        setUser(u);
        const snap = await get(ref(db,`users/${u.uid}`));
        if(snap.exists()){
          const data = snap.val();
          setUserData(data);
          setEditProfile({displayName:data.displayName||"",bio:data.bio||"",username:data.username||""});
          // Check if owner
          if(data.username===OWNER_USERNAME.toLowerCase()||u.uid===OWNER_UID){
            setIsOwner(true);
          }
        }
      } else {
        setUser(null); setUserData(null); setIsOwner(false);
      }
      setAuthLoading(false);
    });
    const onResize=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",onResize);
    return ()=>{unsub();window.removeEventListener("resize",onResize);};
  },[]);

  // Load chats
  useEffect(()=>{
    if(!user) return;
    const r = ref(db,`userChats/${user.uid}`);
    const unsub = onValue(r, async(snap)=>{
      if(!snap.exists()){setChats([]);return;}
      const raw = snap.val();
      const list = await Promise.all(Object.values(raw).map(async(uc)=>{
        const cSnap = await get(ref(db,`chats/${uc.chatId}`));
        if(!cSnap.exists()) return null;
        return {...cSnap.val(),...uc};
      }));
      setChats(list.filter(Boolean).sort((a,b)=>(b.order||0)-(a.order||0)));
    });
    return ()=>off(r);
  },[user]);

  // Load messages for active chat
  useEffect(()=>{
    if(msgListenerRef.current){off(msgListenerRef.current);msgListenerRef.current=null;}
    if(!activeChat) return;
    const r = ref(db,`messages/${activeChat}`);
    msgListenerRef.current = r;
    const unsub = onValue(r,(snap)=>{
      if(!snap.exists()){setMessages([]);return;}
      const list = Object.values(snap.val()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
      setMessages(list);
    });
    return ()=>{if(msgListenerRef.current)off(msgListenerRef.current);};
  },[activeChat]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  // Load admin data
  useEffect(()=>{
    if(!isOwner) return;
    const r = ref(db,"users");
    const unsub = onValue(r,(snap)=>{
      if(snap.exists()) setAllUsers(Object.values(snap.val()));
    });
    const sr = ref(db,"support");
    const unsub2 = onValue(sr,(snap)=>{
      if(snap.exists()) setSupportTickets(Object.values(snap.val()));
    });
    const vr = ref(db,"verifications");
    const unsub3 = onValue(vr,(snap)=>{
      if(snap.exists()) setVerifyRequests(Object.values(snap.val()));
    });
    return ()=>{off(r);off(sr);off(vr);};
  },[isOwner]);

  // Search
  useEffect(()=>{
    if(!search.trim()||!searchMode){setSearchResults([]);return;}
    const q = search.toLowerCase().replace("@","");
    const doSearch = async()=>{
      const snap = await get(ref(db,"users"));
      const results = [];
      if(snap.exists()){
        Object.values(snap.val()).forEach(u=>{
          if((u.username||"").includes(q)||(u.displayName||"").toLowerCase().includes(q)){
            results.push({...u,resultType:"user"});
          }
        });
      }
      const cSnap = await get(ref(db,"chats"));
      if(cSnap.exists()){
        Object.values(cSnap.val()).forEach(c=>{
          if(c.type!=="private"&&c.type!=="saved"&&c.type!=="bot"&&(c.username||"").includes(q)){
            results.push({...c,resultType:c.type});
          }
        });
      }
      setSearchResults(results.slice(0,20));
    };
    const t = setTimeout(doSearch,300);
    return ()=>clearTimeout(t);
  },[search,searchMode]);

  const openChat = useCallback(async(chatId,chatDataOverride=null)=>{
    setActiveChat(chatId);
    setShowInfo(false);setReplyTo(null);setShowMenu(false);setAttachMenu(false);setSearchMode(false);
    if(isMobile) setShowSidebar(false);
    
    // Get chat data
    const snap = await get(ref(db,`chats/${chatId}`));
    if(snap.exists()) setActiveChatData(snap.val());
    else if(chatDataOverride) setActiveChatData(chatDataOverride);
    
    // Clear unread
    if(user) update(ref(db,`userChats/${user.uid}/${chatId}`),{unread:0});
    setTimeout(()=>inputRef.current?.focus(),80);
  },[isMobile,user]);

  const sendMessage = useCallback(async(overText=null,type="text",extra={})=>{
    const text = overText??input.trim();
    if(!text&&!extra.imageUrl&&!extra.fileName) return;
    if(!activeChat||!user||!userData) return;
    
    // Check if channel and not owner
    if(activeChatData?.type==="channel"&&activeChatData?.ownerId!==user.uid) return;
    
    const msgId = uid();
    const msg = {
      id:msgId, chatId:activeChat, text:text||"", from:user.uid,
      senderName:userData.displayName, senderUsername:userData.username,
      senderPhoto:userData.photoURL||"", senderColor:userData.color||rColor(userData.displayName),
      time:nowStr(), type, createdAt:Date.now(),
      replyTo:replyTo?{text:replyTo.text,sender:replyTo.senderName||"أنا",msgId:replyTo.id}:null,
      ...extra,
    };
    
    await set(ref(db,`messages/${activeChat}/${msgId}`),msg);
    const preview = type==="image"?"📷 صورة":type==="file"?`📎 ${msg.fileName}`:text;
    await update(ref(db,`userChats/${user.uid}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),order:Date.now()});
    
    // If group/channel, update for all members
    if(activeChatData?.members){
      for(const memberId of activeChatData.members){
        if(memberId!==user.uid){
          const memberChat = await get(ref(db,`userChats/${memberId}/${activeChat}`));
          const unread = (memberChat.exists()?memberChat.val().unread||0:0)+1;
          await update(ref(db,`userChats/${memberId}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),unread,order:Date.now()});
        }
      }
    }
    
    setInput("");setReplyTo(null);setShowEmoji(false);
    inputRef.current?.focus();
  },[input,activeChat,user,userData,replyTo,activeChatData]);

  const handleFile = useCallback((file,isImg)=>{
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      if(isImg) sendMessage("",  "image",{imageUrl:e.target.result,fileName:file.name,fileSize:file.size});
      else sendMessage("","file",{fileName:file.name,fileSize:file.size,fileData:e.target.result});
    };
    reader.readAsDataURL(file);
    setAttachMenu(false);
  },[sendMessage]);

  const createGroup = useCallback(async(type)=>{
    if(!newForm.name.trim()||!user||!userData) return;
    if(newForm.username&&!/^[a-zA-Z0-9_]+$/.test(newForm.username)){alert("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط");return;}
    
    const chatId = uid();
    const isOfficial = userData.username===OWNER_USERNAME.toLowerCase();
    const chatData = {
      id:chatId, type, name:newForm.name.trim(),
      username:(newForm.username||"").toLowerCase()||chatId.slice(0,8),
      bio:newForm.bio||"", photoURL:"",
      ownerId:user.uid, members:[user.uid], admins:[user.uid],
      verified:false, createdAt:Date.now(),
      ...(type==="channel"?{subscribers:1,subscribersList:[user.uid]}:{}),
    };
    
    await set(ref(db,`chats/${chatId}`),chatData);
    if(newForm.username) await set(ref(db,`chatUsernames/${newForm.username.toLowerCase()}`),chatId);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"تم إنشاء "+(type==="channel"?"القناة":"المجموعة"),lastTime:nowStr(),unread:0,order:Date.now()});
    
    // Welcome msg
    const wid=uid();
    await set(ref(db,`messages/${chatId}/${wid}`),{id:wid,chatId,text:`🎉 تم إنشاء ${type==="channel"?"القناة":"المجموعة"} "${newForm.name}"`,from:"system",time:nowStr(),type:"system",createdAt:Date.now()});
    
    setModal(null);setNewForm({name:"",username:"",bio:"",type:"group"});
    openChat(chatId,chatData);
  },[newForm,user,userData,openChat]);

  const joinChannel = useCallback(async(chat)=>{
    if(!user) return;
    const chatId = chat.id;
    const newCount = (chat.subscribers||0)+1;
    const newList = [...(chat.subscribersList||[])];
    if(!newList.includes(user.uid)) newList.push(user.uid);
    const newMembers = [...(chat.members||[])];
    if(!newMembers.includes(user.uid)) newMembers.push(user.uid);
    
    await update(ref(db,`chats/${chatId}`),{subscribers:newCount,subscribersList:newList,members:newMembers});
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:chat.lastMessage||"",lastTime:nowStr(),unread:0,order:Date.now()});
    openChat(chatId,{...chat,subscribers:newCount,members:newMembers});
  },[user,openChat]);

  const sendSupport = useCallback(async(text)=>{
    if(!user||!userData||!text.trim()) return;
    const ticketId = `ticket_${user.uid}`;
    const msgId = uid();
    
    // Save to support DB
    await set(ref(db,`support/${ticketId}/info`),{userId:user.uid,username:userData.username,displayName:userData.displayName,status:"open",createdAt:Date.now()});
    await set(ref(db,`support/${ticketId}/messages/${msgId}`),{id:msgId,text:text.trim(),from:user.uid,time:nowStr(),createdAt:Date.now()});
    
    // AI response
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:500,
          system:"أنت مساعد دعم فني لتطبيق تيرمين (نسخة من تيليغرام). أجب باللغة العربية بشكل مفيد وودي. إذا طلب المستخدم تحويل لدعم بشري، قل له أنك ستحول طلبه.",
          messages:[{role:"user",content:text.trim()}]
        })
      });
      const data = await res.json();
      const aiText = data.content?.[0]?.text||"شكراً لتواصلك معنا! سيتم معالجة طلبك قريباً.";
      const needsHuman = aiText.includes("تحويل")||text.includes("بشري")||text.includes("إنسان");
      
      const aiId=uid();
      await set(ref(db,`support/${ticketId}/messages/${aiId}`),{id:aiId,text:aiText+(needsHuman?"\n\n🔄 جاري تحويلك إلى الدعم البشري...":""),from:"ai_bot",time:nowStr(),createdAt:Date.now()+1});
      
      if(needsHuman){
        await update(ref(db,`support/${ticketId}/info`),{status:"awaiting_human"});
        // Notify owner
        const notifId=uid();
        const botChatId=`bot_${OWNER_UID}`;
        await set(ref(db,`messages/${botChatId}/${notifId}`),{id:notifId,chatId:botChatId,text:`🆕 طلب دعم جديد من @${userData.username}\n\nالرسالة: "${text.trim()}"\n\nانتقل إلى لوحة الإدارة > الدعم الفني للرد.`,from:BOT_ID,time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
      }
    } catch {}
  },[user,userData]);

  const adminAction = useCallback(async(action,targetUid,extra={})=>{
    switch(action){
      case "ban": await update(ref(db,`users/${targetUid}`),{isBanned:true}); break;
      case "unban": await update(ref(db,`users/${targetUid}`),{isBanned:false}); break;
      case "fraud": await update(ref(db,`users/${targetUid}`),{isFraud:true}); break;
      case "unfraud": await update(ref(db,`users/${targetUid}`),{isFraud:false}); break;
      case "verify": await update(ref(db,`users/${targetUid}`),{verified:true}); break;
      case "unverify": await update(ref(db,`users/${targetUid}`),{verified:false}); break;
      case "delete": await remove(ref(db,`users/${targetUid}`)); break;
      case "verifyChat": await update(ref(db,`chats/${extra.chatId}`),{verified:true}); break;
    }
    const snap = await get(ref(db,"users"));
    if(snap.exists()) setAllUsers(Object.values(snap.val()));
  },[]);

  const saveSettings = useCallback(async()=>{
    if(!user) return;
    if(editProfile.username&&editProfile.username!==userData?.username){
      if(!/^[a-zA-Z0-9_]+$/.test(editProfile.username)){alert("اسم المستخدم غير صالح");return;}
      const usSnap = await get(ref(db,`usernames/${editProfile.username.toLowerCase()}`));
      if(usSnap.exists()&&usSnap.val()!==user.uid){alert("اسم المستخدم مستخدم بالفعل");return;}
      // Remove old username
      if(userData?.username) await remove(ref(db,`usernames/${userData.username}`));
      await set(ref(db,`usernames/${editProfile.username.toLowerCase()}`),user.uid);
    }
    await update(ref(db,`users/${user.uid}`),{displayName:editProfile.displayName,bio:editProfile.bio,username:editProfile.username.toLowerCase()});
    await updateProfile(user,{displayName:editProfile.displayName});
    const snap=await get(ref(db,`users/${user.uid}`));
    if(snap.exists()) setUserData(snap.val());
    setModal(null);
    alert("تم حفظ التغييرات ✅");
  },[user,userData,editProfile]);

  const EMOJIS=["😀","😂","😍","😊","🥳","😎","🤩","😭","😤","🥺","❤️","🔥","💯","⭐","🎉","👍","👋","🙏","💪","✅","🚀","💡","🎵","🌟","😅","🤔","💬","📱","🎯","🏆","💎","🌈","🎁","🍕","☕","🌸","🦋","🎮","📸","🔑"];

  const currentChat = chats.find(c=>c.chatId===activeChat||c.id===activeChat)||activeChatData;
  const isChannel = currentChat?.type==="channel";
  const isMine = isChannel&&currentChat?.ownerId===user?.uid;
  const canSend = !isChannel||(isChannel&&isMine);

  if(authLoading) return (
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
      <div style={{fontSize:"56px",animation:"spin 1.2s linear infinite"}}>✈️</div>
      <div style={{color:T.text,fontSize:"22px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!user) return <AuthScreen onAuth={()=>{}}/>;

  // ========== RENDER CHAT AREA ==========
  const renderChat = () => {
    if(!activeChat) return (
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"20px",padding:"40px"}}>
        <div style={{fontSize:"76px",filter:"drop-shadow(0 8px 24px rgba(82,136,193,0.35))"}}>✈️</div>
        <div style={{textAlign:"center"}}>
          <div style={{color:T.text,fontSize:"30px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
          <div style={{color:T.textSec,fontSize:"14px",marginTop:"8px"}}>اختر محادثة للبدء</div>
        </div>
        {[["🔒","تشفير من طرف إلى طرف"],["🔥","قاعدة بيانات Firebase حقيقية"],["📁","إرسال الصور والملفات"],["🤖","بوت ذكاء اصطناعي"]].map(([ic,txt])=>(
          <div key={txt} style={{display:"flex",alignItems:"center",gap:"12px",background:T.sidebar,borderRadius:"12px",padding:"11px 16px",border:`1px solid ${T.border}`,width:"100%",maxWidth:"300px"}}>
            <span style={{fontSize:"19px"}}>{ic}</span>
            <span style={{color:T.textSec,fontSize:"13.5px"}}>{txt}</span>
          </div>
        ))}
      </div>
    );

    const chatName = currentChat?.name||"محادثة";
    const chatType = currentChat?.type;
    const isBot = chatType==="bot";
    const isSaved = chatType==="saved";

    return (
      <>
        {/* Header */}
        <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",background:T.sidebar,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          {isMobile&&<Btn onClick={()=>{setShowSidebar(true);setActiveChat(null);setActiveChatData(null);}}><Ic n="back" s={22}/></Btn>}
          <div style={{display:"flex",alignItems:"center",gap:"11px",flex:1,cursor:"pointer"}} onClick={()=>setShowInfo(!showInfo)}>
            <Av name={chatName} color={currentChat?.color||rColor(chatName)} size={40} online={chatType==="private"&&currentChat?.online} verified={currentChat?.verified} photo={currentChat?.photoURL}/>
            <div>
              <div style={{color:T.text,fontWeight:"700",fontSize:"15px",display:"flex",alignItems:"center",gap:"5px"}}>
                {chatName}
                {currentChat?.isFraud&&<span style={{color:T.danger,fontSize:"11px",background:`${T.danger}20`,padding:"1px 6px",borderRadius:"8px"}}>احتيال</span>}
                {currentChat?.verified&&<Ic n="check" s={14} c={T.verified}/>}
                {isBot&&<span style={{color:T.gold,fontSize:"11px",background:`${T.gold}20`,padding:"1px 6px",borderRadius:"8px"}}>بوت</span>}
              </div>
              <div style={{color:T.textSec,fontSize:"12px"}}>
                {isSaved?"رسائلك المحفوظة":isBot?"بوت رسمي":chatType==="group"?`${currentChat?.members?.length||0} عضو`:chatType==="channel"?`${currentChat?.subscribers||0} مشترك`:"متصل"}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"2px"}}>
            {!isBot&&!isSaved&&<Btn><Ic n="call" s={20}/></Btn>}
            <Btn><Ic n="search" s={20}/></Btn>
            <Btn><Ic n="more" s={20}/></Btn>
          </div>
        </div>

        {/* Reply */}
        {replyTo&&(
          <div style={{padding:"7px 16px",background:T.panel,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"3px",height:"30px",background:T.accentBtn,borderRadius:"2px",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:T.accentBtn,fontSize:"11.5px",fontWeight:"700"}}>{replyTo.senderName||"أنت"}</div>
              <div style={{color:T.textSec,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{replyTo.text}</div>
            </div>
            <Btn onClick={()=>setReplyTo(null)}><Ic n="close" s={15}/></Btn>
          </div>
        )}

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 18px",background:T.bg,display:"flex",flexDirection:"column",gap:"2px"}}>
          {!messages.length&&(
            <div style={{margin:"auto",textAlign:"center",color:T.textSec}}>
              {isSaved?<><div style={{fontSize:"44px",marginBottom:"10px"}}>🔖</div><div>احفظ رسائلك المهمة هنا</div></>
              :isBot?<><div style={{fontSize:"44px",marginBottom:"10px"}}>🤖</div><div>ابدأ المحادثة مع البوت</div></>
              :<><div style={{fontSize:"44px",marginBottom:"10px"}}>👋</div><div>ابدأ المحادثة!</div></>}
            </div>
          )}
          {messages.map((msg,idx)=>{
            const isMe = msg.from===user?.uid;
            const isSystem = msg.type==="system";
            const isBotMsg = msg.isBot||msg.from===BOT_ID||msg.from==="ai_bot";
            const showSender = !isMe&&(chatType==="group")&&(idx===0||messages[idx-1]?.from!==msg.from);
            if(isSystem) return (
              <div key={msg.id} style={{textAlign:"center",margin:"6px 0"}}>
                <span style={{background:`${T.accentBtn}20`,color:T.textSec,borderRadius:"12px",padding:"4px 14px",fontSize:"12px"}}>{msg.text}</span>
              </div>
            );
            return (
              <div key={msg.id} style={{display:"flex",justifyContent:isMe?"flex-start":"flex-end",marginBottom:"1px"}}
                onContextMenu={e=>{e.preventDefault();setCtxMenu({x:e.clientX,y:e.clientY,msg});}}>
                <div style={{maxWidth:"72%",padding:"8px 11px 5px",borderRadius:isMe?"16px 16px 16px 4px":"16px 16px 4px 16px",background:isMe?T.msgOut:isBotMsg?"#1a3040":T.msgIn,boxShadow:"0 1px 3px rgba(0,0,0,0.3)",animation:"msgIn 0.2s ease"}}>
                  {showSender&&<div style={{color:T.accentBtn,fontSize:"12px",fontWeight:"700",marginBottom:"3px"}}>{msg.senderName}</div>}
                  {isBotMsg&&!isMe&&<div style={{color:T.gold,fontSize:"11px",fontWeight:"700",marginBottom:"3px",display:"flex",alignItems:"center",gap:"4px"}}><Ic n="star" s={10} c={T.gold}/> TSAXP الرسمي</div>}
                  {msg.replyTo&&(
                    <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"8px",padding:"5px 10px",marginBottom:"6px",borderRight:`3px solid ${T.accentBtn}`}}>
                      <div style={{color:T.accentBtn,fontSize:"11px",fontWeight:"700"}}>{msg.replyTo.sender}</div>
                      <div style={{color:T.textSec,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{msg.replyTo.text}</div>
                    </div>
                  )}
                  {msg.type==="image"&&<div style={{marginBottom:"4px"}}><img src={msg.imageUrl} alt="" style={{maxWidth:"240px",maxHeight:"280px",borderRadius:"10px",display:"block",width:"100%",objectFit:"cover"}}/>{msg.text&&<div style={{color:T.text,fontSize:"14px",marginTop:"5px"}}>{msg.text}</div>}</div>}
                  {msg.type==="file"&&<a href={msg.fileData} download={msg.fileName} style={{display:"flex",alignItems:"center",gap:"10px",textDecoration:"none",background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 12px",marginBottom:"4px"}}><Ic n="file" s={28} c={T.accentBtn}/><div><div style={{color:T.text,fontSize:"13px",fontWeight:"600",wordBreak:"break-all"}}>{msg.fileName}</div><div style={{color:T.textSec,fontSize:"11px"}}>{fmtSize(msg.fileSize)}</div></div></a>}
                  {(msg.type==="text"||!msg.type)&&<div style={{color:T.text,fontSize:"14.5px",lineHeight:"1.55",wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</div>}
                  <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:"3px",marginTop:"3px"}}>
                    <span style={{color:T.textSec,fontSize:"10.5px"}}>{msg.time}</span>
                    {isMe&&<Ic n="checks" s={13} c={T.accentBtn}/>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef}/>
        </div>

        {/* Input — only if can send */}
        {canSend?(
          <div style={{padding:"9px 12px",background:T.sidebar,borderTop:`1px solid ${T.border}`,flexShrink:0,position:"relative"}}>
            {showEmoji&&(
              <div style={{position:"absolute",bottom:"62px",right:"12px",background:"#1a2a3a",borderRadius:"14px",padding:"12px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                {EMOJIS.map(e=><button key={e} onClick={()=>{setInput(p=>p+e);inputRef.current?.focus();}} style={{background:"none",border:"none",fontSize:"21px",cursor:"pointer",padding:"4px",borderRadius:"7px",lineHeight:1}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hover} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
              </div>
            )}
            {attachMenu&&(
              <div style={{position:"absolute",bottom:"62px",right:"52px",background:"#1c2d3d",borderRadius:"14px",padding:"10px 14px",display:"flex",gap:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:200,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                {[{n:"image",l:"صورة",c:"#4CAF50",a:()=>{imgRef.current?.click();setAttachMenu(false);}},{n:"file",l:"ملف",c:"#2196F3",a:()=>{fileRef.current?.click();setAttachMenu(false);}}].map(b=>(
                  <button key={b.l} onClick={b.a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",background:"none",border:"none",cursor:"pointer",padding:"10px 12px",borderRadius:"10px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                    <Ic n={b.n} s={26} c={b.c}/><span style={{color:T.textSec,fontSize:"11px"}}>{b.l}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <Btn onClick={e=>{e.stopPropagation();setShowEmoji(!showEmoji);setAttachMenu(false);}} style={{fontSize:"20px",padding:"6px"}}>😊</Btn>
              {!isSaved&&!isBot&&<Btn onClick={e=>{e.stopPropagation();setAttachMenu(!attachMenu);setShowEmoji(false);}}><Ic n="attach" s={20}/></Btn>}
              <div style={{flex:1,background:T.inputBg,borderRadius:"22px",padding:"8px 14px"}}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                  placeholder={isSaved?"احفظ ملاحظاتك هنا...":isChannel?"نشر في القناة...":"اكتب رسالة..."}
                  rows={1} style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14.5px",width:"100%",direction:"rtl",fontFamily:"inherit",resize:"none",lineHeight:"1.5",maxHeight:"90px",overflowY:"auto"}}/>
              </div>
              <button onClick={()=>input.trim()?sendMessage():null}
                style={{background:input.trim()?T.accentBtn:T.inputBg,border:"none",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",boxShadow:input.trim()?"0 4px 12px rgba(82,136,193,0.4)":"none"}}>
                <Ic n={input.trim()?"send":"mic"} s={19} c={input.trim()?"#fff":T.textSec}/>
              </button>
            </div>
            <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],true)} onClick={e=>e.target.value=""}/>
            <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],false)} onClick={e=>e.target.value=""}/>
          </div>
        ):(
          <div style={{padding:"14px",background:T.sidebar,borderTop:`1px solid ${T.border}`,textAlign:"center",color:T.textSec,fontSize:"13px"}}>
            📢 فقط الإدمن يمكنه النشر في هذه القناة
          </div>
        )}
      </>
    );
  };

  // ========== ADMIN PANEL ==========
  const renderAdmin = () => (
    <div style={{flex:1,overflowY:"auto",padding:"20px",direction:"rtl"}}>
      <div style={{color:T.text,fontSize:"18px",fontWeight:"800",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}><Ic n="crown" s={20} c={T.gold}/> لوحة الإدارة</div>
      <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
        {[["users","المستخدمون"],["support","الدعم الفني"],["verify","التوثيق"]].map(([k,l])=>(
          <button key={k} onClick={()=>setAdminTab(k)} style={{padding:"8px 16px",borderRadius:"10px",border:"none",background:adminTab===k?T.accentBtn:T.panel,color:adminTab===k?"#fff":T.textSec,cursor:"pointer",fontFamily:"inherit",fontWeight:"600",fontSize:"13px"}}>{l}</button>
        ))}
      </div>

      {adminTab==="users"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          <div style={{color:T.textSec,fontSize:"13px",marginBottom:"4px"}}>{allUsers.length} مستخدم مسجل</div>
          {allUsers.map(u=>(
            <div key={u.uid} style={{background:T.panel,borderRadius:"14px",padding:"14px",border:`1px solid ${T.border}`,cursor:"pointer"}} onClick={()=>setSelectedAdminUser(u===selectedAdminUser?null:u)}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <Av name={u.displayName} color={u.color||rColor(u.displayName)} size={42} verified={u.verified} fraud={u.isFraud} photo={u.photoURL}/>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>
                    {u.displayName}
                    {u.verified&&<Ic n="check" s={13} c={T.verified}/>}
                    {u.isFraud&&<span style={{color:T.danger,fontSize:"11px",background:`${T.danger}20`,padding:"1px 6px",borderRadius:"6px"}}>احتيال</span>}
                    {u.isBanned&&<span style={{color:T.danger,fontSize:"11px",background:`${T.danger}20`,padding:"1px 6px",borderRadius:"6px"}}>محظور</span>}
                  </div>
                  <div style={{color:T.textSec,fontSize:"12px"}}>@{u.username} · {u.email}</div>
                  <div style={{color:T.textSec,fontSize:"11px"}}>ID: {(u.uid||"").slice(0,12)}...</div>
                </div>
              </div>
              {selectedAdminUser?.uid===u.uid&&(
                <div style={{marginTop:"12px",display:"flex",flexWrap:"wrap",gap:"8px"}}>
                  {[
                    {l:u.isBanned?"رفع الحظر":"حظر",a:u.isBanned?"unban":"ban",c:u.isBanned?"#4CAF50":T.danger},
                    {l:u.isFraud?"إزالة احتيال":"علامة احتيال",a:u.isFraud?"unfraud":"fraud",c:T.danger},
                    {l:u.verified?"إزالة توثيق":"توثيق",a:u.verified?"unverify":"verify",c:T.gold},
                    {l:"حذف الحساب",a:"delete",c:T.danger},
                  ].map(btn=>(
                    <button key={btn.l} onClick={()=>adminAction(btn.a,u.uid)} style={{padding:"7px 14px",borderRadius:"8px",border:`1px solid ${btn.c}30`,background:`${btn.c}15`,color:btn.c,cursor:"pointer",fontFamily:"inherit",fontSize:"12.5px",fontWeight:"600"}}>{btn.l}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adminTab==="support"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {!supportTickets.length&&<div style={{color:T.textSec,textAlign:"center",padding:"40px"}}>لا توجد تذاكر دعم</div>}
          {supportTickets.map((ticket,i)=>(
            <div key={i} style={{background:T.panel,borderRadius:"14px",padding:"14px",border:`1px solid ${T.border}`}}>
              <div style={{color:T.text,fontWeight:"700"}}>@{ticket.info?.username}</div>
              <div style={{color:T.textSec,fontSize:"12px",marginBottom:"8px"}}>الحالة: {ticket.info?.status==="awaiting_human"?"⏳ ينتظر رد بشري":ticket.info?.status==="open"?"🟢 مفتوح":"✅ مغلق"}</div>
              <div style={{background:T.inputBg,borderRadius:"10px",padding:"10px",maxHeight:"150px",overflowY:"auto"}}>
                {ticket.messages&&Object.values(ticket.messages).map(m=>(
                  <div key={m.id} style={{marginBottom:"6px"}}>
                    <span style={{color:m.from==="ai_bot"?T.gold:T.accentBtn,fontSize:"11px",fontWeight:"700"}}>{m.from==="ai_bot"?"🤖 AI":m.from==="admin"?"👑 الدعم":"👤 المستخدم"}</span>
                    <div style={{color:T.text,fontSize:"13px",marginTop:"2px",whiteSpace:"pre-wrap"}}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
                <input placeholder="رد من الدعم..." style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:"10px",padding:"8px 12px",color:T.text,fontSize:"13px",outline:"none",direction:"rtl",fontFamily:"inherit"}} id={`reply_${i}`}/>
                <button onClick={async()=>{
                  const inp=document.getElementById(`reply_${i}`);
                  if(!inp||!inp.value.trim()) return;
                  const msgId=uid();
                  const tId=`ticket_${ticket.info?.userId}`;
                  await set(ref(db,`support/${tId}/messages/${msgId}`),{id:msgId,text:inp.value.trim(),from:"admin",time:nowStr(),createdAt:Date.now()});
                  await update(ref(db,`support/${tId}/info`),{status:"replied"});
                  inp.value="";
                }} style={{background:T.accentBtn,border:"none",borderRadius:"10px",padding:"8px 14px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",fontSize:"13px"}}>إرسال</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab==="verify"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{color:T.textSec,fontSize:"13px",marginBottom:"4px"}}>توثيق الحسابات والقنوات والمجموعات</div>
          {allUsers.map(u=>(
            <div key={u.uid} style={{background:T.panel,borderRadius:"12px",padding:"12px",display:"flex",alignItems:"center",gap:"10px",border:`1px solid ${T.border}`}}>
              <Av name={u.displayName} color={u.color||rColor(u.displayName)} size={36} verified={u.verified}/>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontSize:"13.5px",fontWeight:"600"}}>{u.displayName} · @{u.username}</div>
              </div>
              <button onClick={()=>adminAction(u.verified?"unverify":"verify",u.uid)} style={{padding:"6px 12px",borderRadius:"8px",border:"none",background:u.verified?`${T.danger}20`:`${T.gold}20`,color:u.verified?T.danger:T.gold,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>
                {u.verified?"إزالة التوثيق":"✅ توثيق"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== SETTINGS ==========
  const renderSettings = () => (
    <div style={{flex:1,overflowY:"auto",padding:"20px",direction:"rtl"}}>
      <div style={{color:T.text,fontSize:"18px",fontWeight:"800",marginBottom:"20px",display:"flex",alignItems:"center",gap:"8px"}}><Ic n="settings" s={20} c={T.accentBtn}/> الإعدادات</div>
      
      {/* Profile Card */}
      <div style={{background:T.panel,borderRadius:"16px",padding:"20px",marginBottom:"16px",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
        <Av name={userData?.displayName||""} color={userData?.color||rColor(userData?.displayName||"")} size={72} verified={userData?.verified} photo={userData?.photoURL}/>
        <div style={{textAlign:"center"}}>
          <div style={{color:T.text,fontWeight:"800",fontSize:"17px",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
            {userData?.displayName}
            {userData?.verified&&<Ic n="check" s={14} c={T.verified}/>}
          </div>
          <div style={{color:T.textSec,fontSize:"13px"}}>@{userData?.username}</div>
          <div style={{color:T.textSec,fontSize:"12px",marginTop:"4px"}}>{userData?.bio||"لا توجد نبذة"}</div>
        </div>
        <button onClick={()=>setModal("editProfile")} style={{background:`${T.accentBtn}20`,border:`1px solid ${T.accentBtn}40`,borderRadius:"10px",padding:"8px 20px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontWeight:"600",fontSize:"13px"}}>✏️ تعديل الملف الشخصي</button>
      </div>

      {/* Settings Options */}
      {[
        {icon:"notification",label:"الإشعارات",desc:"مفعّلة"},
        {icon:"lock",label:"التحقق بخطوتين",desc:userData?.twoFactor?"مفعّل":"معطّل",action:()=>setModal("twoFactor")},
        {icon:"shield",label:"الخصوصية والأمان",desc:""},
        {icon:"support",label:"الدعم الفني",desc:"",action:()=>setModal("support")},
        {icon:"user",label:"معلومات الحساب",desc:`ID: ${(user?.uid||"").slice(0,8).toUpperCase()}`},
      ].map(s=>(
        <div key={s.label} onClick={s.action} style={{display:"flex",alignItems:"center",gap:"14px",background:T.panel,borderRadius:"12px",padding:"14px",marginBottom:"8px",border:`1px solid ${T.border}`,cursor:s.action?"pointer":"default",transition:"background 0.15s"}}
          onMouseEnter={e=>{if(s.action)e.currentTarget.style.background=T.hoverLight;}} onMouseLeave={e=>e.currentTarget.style.background=T.panel}>
          <div style={{width:"36px",height:"36px",borderRadius:"10px",background:`${T.accentBtn}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={s.icon} s={18} c={T.accentBtn}/></div>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{s.label}</div>
            {s.desc&&<div style={{color:T.textSec,fontSize:"12px"}}>{s.desc}</div>}
          </div>
          {s.action&&<Ic n="back" s={16} c={T.textSec}/>}
        </div>
      ))}

      <button onClick={()=>signOut(auth)} style={{width:"100%",background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"12px",padding:"13px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px",marginTop:"8px"}}>
        🚪 تسجيل الخروج
      </button>
    </div>
  );

  // ========== SEARCH RESULTS ==========
  const renderSearchResults = () => (
    <div style={{overflowY:"auto",flex:1}}>
      {!searchResults.length&&search.trim()&&<div style={{padding:"40px",textAlign:"center",color:T.textSec,fontSize:"13px"}}>لا توجد نتائج لـ "{search}"</div>}
      {searchResults.map((r,i)=>{
        const isUser=r.resultType==="user";
        const isCh=r.resultType==="channel";
        const isGr=r.resultType==="group";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.border}18`,transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={async()=>{
              if(isCh||isGr){
                const already = chats.find(c=>c.id===r.id||c.chatId===r.id);
                if(already) openChat(r.id,r);
                else {
                  // Join or view
                  setActiveChatData(r);setActiveChat(r.id);
                  if(isMobile)setShowSidebar(false);
                }
              } else if(isUser&&r.uid!==user?.uid){
                // Open/create private chat
                const chatId=`pm_${[user.uid,r.uid].sort().join("_")}`;
                const snap=await get(ref(db,`chats/${chatId}`));
                if(!snap.exists()){
                  await set(ref(db,`chats/${chatId}`),{id:chatId,type:"private",name:r.displayName,members:[user.uid,r.uid],createdAt:Date.now(),color:r.color||rColor(r.displayName),photoURL:r.photoURL||""});
                  await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now()});
                  await set(ref(db,`userChats/${r.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now()});
                }
                openChat(chatId,{id:chatId,type:"private",name:r.displayName,color:r.color,photoURL:r.photoURL});
              }
              setSearchMode(false);setSearch("");
            }}>
            <Av name={r.name||r.displayName} color={r.color||rColor(r.name||r.displayName)} size={46} verified={r.verified} photo={r.photoURL} fraud={r.isFraud}/>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"5px"}}>
                {isCh&&<Ic n="channel" s={13} c={T.gold}/>}
                {isGr&&<Ic n="group" s={13} c={T.accentBtn}/>}
                {isUser&&<Ic n="user" s={13} c={T.textSec}/>}
                {r.name||r.displayName}
                {r.verified&&<Ic n="check" s={13} c={T.verified}/>}
                {r.isFraud&&<span style={{color:T.danger,fontSize:"10px",background:`${T.danger}20`,padding:"1px 5px",borderRadius:"5px"}}>احتيال</span>}
              </div>
              <div style={{color:T.textSec,fontSize:"12px"}}>@{r.username} · {isCh?`${r.subscribers||0} مشترك`:isGr?`${r.members?.length||0} عضو`:"مستخدم"}</div>
            </div>
            {isCh&&!chats.find(c=>c.id===r.id)&&(
              <button onClick={e=>{e.stopPropagation();joinChannel(r);}} style={{background:`${T.accentBtn}20`,border:`1px solid ${T.accentBtn}40`,borderRadius:"8px",padding:"6px 12px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>انضمام</button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",overflow:"hidden"}}
      onClick={()=>{setShowMenu(false);setAttachMenu(false);setCtxMenu(null);setShowEmoji(false);}}>

      {/* ===== SIDEBAR ===== */}
      <div style={{width:showSidebar?(isMobile?"100%":"320px"):"0",minWidth:0,background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"width 0.25s",position:isMobile?"absolute":"relative",height:"100%",zIndex:isMobile?20:1}}>

        {/* Header */}
        <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${T.border}`,position:"relative"}}>
          {isOwner&&<div style={{position:"absolute",top:"4px",right:"4px",background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>ADMIN</div>}
          <Btn onClick={e=>{e.stopPropagation();setShowMenu(!showMenu);}}>
            <Ic n="menu" s={20}/>
          </Btn>
          <div style={{flex:1,display:"flex",alignItems:"center",background:T.inputBg,borderRadius:"22px",padding:"7px 14px",gap:"8px",cursor:"text"}} onClick={()=>setSearchMode(true)}>
            <Ic n="search" s={15}/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} onFocus={()=>setSearchMode(true)} placeholder="بحث في تيرمين..." style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14px",flex:1,direction:"rtl",fontFamily:"inherit"}}/>
            {searchMode&&search&&<button onClick={()=>{setSearch("");setSearchMode(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"0"}}><Ic n="close" s={14}/></button>}
          </div>

          {showMenu&&(
            <div style={{position:"absolute",top:"54px",right:"8px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:300,minWidth:"210px",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
              {[
                {n:"user",l:"محادثة جديدة",a:()=>{setModal("newChat");setShowMenu(false);}},
                {n:"group",l:"مجموعة جديدة",a:()=>{setModal("newGroup");setShowMenu(false);}},
                {n:"channel",l:"قناة جديدة",a:()=>{setModal("newChannel");setShowMenu(false);}},
                {n:"saved",l:"رسائل محفوظة",a:()=>{const s=chats.find(c=>c.type==="saved");if(s)openChat(s.chatId||s.id);setShowMenu(false);}},
                {n:"support",l:"الدعم الفني",a:()=>{setModal("support");setShowMenu(false);}},
                {n:"settings",l:"الإعدادات",a:()=>{setPanel("settings");setShowMenu(false);}},
                ...(isOwner?[{n:"crown",l:"لوحة الإدارة",a:()=>{setPanel("admin");setShowMenu(false);}}]:[]),
              ].map(item=>(
                <button key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <Ic n={item.n} s={18} c={T.accentBtn}/>{item.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand */}
        <div style={{padding:"7px 14px 4px",display:"flex",alignItems:"center",gap:"7px"}}>
          <span style={{fontSize:"17px"}}>✈️</span>
          <span style={{color:T.accentBtn,fontWeight:"900",fontSize:"17px",letterSpacing:"1.5px"}}>تيرمين</span>
          {isOwner&&<Ic n="crown" s={14} c={T.gold}/>}
        </div>

        {/* Nav Pills */}
        <div style={{padding:"6px 10px",display:"flex",gap:"6px",borderBottom:`1px solid ${T.border}`}}>
          {[["chats","💬","المحادثات"],["settings","⚙️","الإعدادات"],...(isOwner?[["admin","👑","الإدارة"]]:[])].map(([k,ic,l])=>(
            <button key={k} onClick={()=>setPanel(k)} style={{flex:1,padding:"6px 4px",borderRadius:"8px",border:"none",background:panel===k?`${T.accentBtn}30`:"transparent",color:panel===k?T.accentBtn:T.textSec,cursor:"pointer",fontFamily:"inherit",fontSize:"11px",fontWeight:"600"}}>
              {ic} {l}
            </button>
          ))}
        </div>

        {/* Content */}
        {panel==="chats"&&(
          searchMode&&search ? renderSearchResults() : (
            <div style={{overflowY:"auto",flex:1}}>
              {!chats.length&&<div style={{padding:"40px 20px",textAlign:"center",color:T.textSec,fontSize:"14px"}}>لا توجد محادثات بعد</div>}
              {chats.map(chat=>{
                const name=chat.name||"محادثة";
                const isActive=activeChat===(chat.chatId||chat.id);
                return (
                  <div key={chat.chatId||chat.id} onClick={()=>openChat(chat.chatId||chat.id,chat)}
                    style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 12px",cursor:"pointer",background:isActive?T.accent:"transparent",borderBottom:`1px solid ${T.border}18`,transition:"background 0.15s"}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <Av name={name} color={chat.color||rColor(name)} size={48} online={chat.online} verified={chat.verified} photo={chat.photoURL}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"4px"}}>
                          {chat.type==="channel"&&<Ic n="channel" s={11} c={T.gold}/>}
                          {chat.type==="group"&&<Ic n="group" s={11} c={T.accentBtn}/>}
                          {(chat.type==="saved")&&<Ic n="saved" s={11} c={T.accentBtn}/>}
                          {chat.type==="bot"&&<Ic n="bot" s={11} c={T.gold}/>}
                          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"150px"}}>{name}</span>
                          {chat.verified&&<Ic n="check" s={11} c={T.verified}/>}
                        </span>
                        <span style={{color:T.textSec,fontSize:"11px",flexShrink:0}}>{chat.lastTime}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                        <span style={{color:T.textSec,fontSize:"12.5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"180px"}}>{chat.lastMessage}</span>
                        {chat.unread>0&&<span style={{background:T.unread,color:"#fff",borderRadius:"12px",minWidth:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",padding:"0 5px",flexShrink:0}}>{chat.unread>99?"99+":chat.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        {panel==="settings"&&renderSettings()}
        {panel==="admin"&&isOwner&&renderAdmin()}

        {/* FAB */}
        {panel==="chats"&&!searchMode&&(
          <div style={{padding:"10px 14px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setModal("newChat")} style={{background:T.accentBtn,border:"none",borderRadius:"50%",width:"46px",height:"46px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 14px rgba(82,136,193,0.45)",transition:"transform 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <Ic n="plus" s={22} c="#fff"/>
            </button>
          </div>
        )}
      </div>

      {/* ===== MAIN AREA ===== */}
      <div style={{flex:1,display:"flex",minWidth:0}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          {renderChat()}
        </div>

        {/* Info Panel */}
        {showInfo&&activeChatData&&(
          <div style={{width:"270px",background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0}}>
            <div style={{padding:"13px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>المعلومات</span>
              <Btn onClick={()=>setShowInfo(false)}><Ic n="close" s={17}/></Btn>
            </div>
            <div style={{padding:"20px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",borderBottom:`1px solid ${T.border}`}}>
              <Av name={activeChatData.name} color={activeChatData.color||rColor(activeChatData.name)} size={70} verified={activeChatData.verified} photo={activeChatData.photoURL}/>
              <div style={{textAlign:"center"}}>
                <div style={{color:T.text,fontWeight:"700",fontSize:"16px",display:"flex",alignItems:"center",gap:"5px",justifyContent:"center"}}>
                  {activeChatData.name}
                  {activeChatData.verified&&<Ic n="check" s={14} c={T.verified}/>}
                </div>
                {activeChatData.username&&<div style={{color:T.textSec,fontSize:"12px"}}>@{activeChatData.username}</div>}
                {activeChatData.bio&&<div style={{color:T.textSec,fontSize:"12px",marginTop:"6px",lineHeight:"1.5"}}>{activeChatData.bio}</div>}
                <div style={{color:T.textSec,fontSize:"12px",marginTop:"4px"}}>
                  {activeChatData.type==="channel"?`📢 ${activeChatData.subscribers||0} مشترك`:activeChatData.type==="group"?`👥 ${activeChatData.members?.length||0} عضو`:""}
                </div>
              </div>
            </div>
            {/* Channel owner controls */}
            {activeChatData.type==="channel"&&activeChatData.ownerId===user?.uid&&(
              <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`}}>
                <div style={{color:T.textSec,fontSize:"11px",fontWeight:"700",marginBottom:"10px"}}>إدارة القناة</div>
                {[{l:"تعديل اسم القناة",a:()=>setModal("editChat")},{l:"تعديل النبذة",a:()=>setModal("editChat")},{l:"تغيير صورة القناة",a:()=>{}},{l:"إدارة الأعضاء",a:()=>{}},{l:"إعدادات القناة",a:()=>{}}].map(b=>(
                  <button key={b.l} onClick={b.a} style={{display:"block",width:"100%",padding:"9px 12px",marginBottom:"6px",background:`${T.accentBtn}15`,border:`1px solid ${T.accentBtn}25`,borderRadius:"9px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontSize:"13px",textAlign:"right"}}>{b.l}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== CONTEXT MENU ===== */}
      {ctxMenu&&(
        <div style={{position:"fixed",top:ctxMenu.y,left:ctxMenu.x,background:"#1c2d3d",borderRadius:"11px",padding:"5px 0",boxShadow:"0 8px 28px rgba(0,0,0,0.55)",zIndex:600,minWidth:"155px",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
          {[
            {l:"↩ ردّ",a:()=>{setReplyTo(ctxMenu.msg);setCtxMenu(null);}},
            {l:"⎘ نسخ",a:()=>{navigator.clipboard?.writeText(ctxMenu.msg?.text||"");setCtxMenu(null);}},
            {l:"🔖 حفظ",a:async()=>{
              const saved=chats.find(c=>c.type==="saved");
              if(saved){const id=uid();await set(ref(db,`messages/${saved.chatId||saved.id}/${id}`),{...ctxMenu.msg,id,chatId:saved.chatId||saved.id,createdAt:Date.now()+1});}
              setCtxMenu(null);
            }},
            ...(ctxMenu.msg?.from===user?.uid?[{l:"🗑 حذف",a:async()=>{if(activeChat)await remove(ref(db,`messages/${activeChat}/${ctxMenu.msg.id}`));setCtxMenu(null);},d:true}]:[]),
          ].map(item=>(
            <button key={item.l} onClick={item.a} style={{display:"block",width:"100%",padding:"10px 16px",background:"none",border:"none",color:item.d?T.danger:T.text,textAlign:"right",cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>{item.l}</button>
          ))}
        </div>
      )}

      {/* ===== MODALS ===== */}
      {modal==="newChat"&&(
        <Modal title="محادثة جديدة" onClose={()=>setModal(null)}>
          <div style={{color:T.textSec,fontSize:"13px",marginBottom:"14px"}}>ابحث عن مستخدم باسم المستخدم:</div>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <FInput value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} placeholder="@username" icon="user" autoFocus/>
            <div style={{maxHeight:"300px",overflowY:"auto"}}>
              {searchResults.filter(r=>r.resultType==="user").map(u=>(
                <div key={u.uid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",cursor:"pointer",borderRadius:"10px",marginBottom:"4px",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={async()=>{
                    setSearch("");setSearchMode(false);
                    const chatId=`pm_${[user.uid,u.uid].sort().join("_")}`;
                    const snap=await get(ref(db,`chats/${chatId}`));
                    if(!snap.exists()){
                      await set(ref(db,`chats/${chatId}`),{id:chatId,type:"private",name:u.displayName,members:[user.uid,u.uid],createdAt:Date.now(),color:u.color||rColor(u.displayName),photoURL:u.photoURL||""});
                      await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now()});
                      await set(ref(db,`userChats/${u.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now()});
                    }
                    setModal(null);
                    openChat(chatId,{id:chatId,type:"private",name:u.displayName,color:u.color,photoURL:u.photoURL});
                  }}>
                  <Av name={u.displayName} color={u.color||rColor(u.displayName)} size={38} verified={u.verified}/>
                  <div>
                    <div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{u.displayName}</div>
                    <div style={{color:T.textSec,fontSize:"12px"}}>@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {modal==="newGroup"&&(
        <Modal title="مجموعة جديدة" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <FInput label="اسم المجموعة" value={newForm.name} onChange={e=>setNewForm(p=>({...p,name:e.target.value}))} placeholder="اسم المجموعة..." autoFocus/>
            <FInput label="اسم المستخدم (اختياري)" value={newForm.username} onChange={e=>setNewForm(p=>({...p,username:e.target.value}))} placeholder="group_username"/>
            <FInput label="النبذة (اختياري)" value={newForm.bio} onChange={e=>setNewForm(p=>({...p,bio:e.target.value}))} placeholder="وصف المجموعة..."/>
            <PBtn onClick={()=>createGroup("group")}>إنشاء المجموعة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="newChannel"&&(
        <Modal title="قناة جديدة" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <FInput label="اسم القناة" value={newForm.name} onChange={e=>setNewForm(p=>({...p,name:e.target.value}))} placeholder="اسم القناة..." autoFocus/>
            <FInput label="اسم المستخدم" value={newForm.username} onChange={e=>setNewForm(p=>({...p,username:e.target.value}))} placeholder="channel_username"/>
            <FInput label="النبذة" value={newForm.bio} onChange={e=>setNewForm(p=>({...p,bio:e.target.value}))} placeholder="وصف القناة..."/>
            <PBtn onClick={()=>createGroup("channel")}>إنشاء القناة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="editProfile"&&(
        <Modal title="تعديل الملف الشخصي" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <Av name={editProfile.displayName||userData?.displayName} color={userData?.color||rColor(userData?.displayName||"")} size={72} verified={userData?.verified} photo={userData?.photoURL}/>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"12px"}}>
              <FInput label="الاسم الشخصي" value={editProfile.displayName} onChange={e=>setEditProfile(p=>({...p,displayName:e.target.value}))} placeholder="اسمك..."/>
              <FInput label="اسم المستخدم" value={editProfile.username} onChange={e=>setEditProfile(p=>({...p,username:e.target.value}))} placeholder="username"/>
              <FInput label="النبذة الشخصية" value={editProfile.bio} onChange={e=>setEditProfile(p=>({...p,bio:e.target.value}))} placeholder="أخبرنا عن نفسك..."/>
            </div>
            <PBtn onClick={saveSettings}>💾 حفظ التغييرات</PBtn>
          </div>
        </Modal>
      )}

      {modal==="support"&&(
        <Modal title="الدعم الفني" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{background:`${T.accentBtn}15`,borderRadius:"12px",padding:"14px",border:`1px solid ${T.accentBtn}30`}}>
              <div style={{color:T.accentBtn,fontWeight:"700",fontSize:"13.5px",marginBottom:"4px"}}>🤖 دعم ذكي + بشري</div>
              <div style={{color:T.textSec,fontSize:"12.5px",lineHeight:"1.6"}}>سيرد عليك الذكاء الاصطناعي فوراً. إذا احتجت دعماً بشرياً، اطلب التحويل وسيتواصل معك فريق تيرمين.</div>
            </div>
            <SupportWidget user={user} userData={userData} sendSupport={sendSupport} onClose={()=>setModal(null)} db={db} chats={chats} openChat={openChat}/>
          </div>
        </Modal>
      )}

      {modal==="twoFactor"&&(
        <Modal title="التحقق بخطوتين" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{background:userData?.twoFactor?`${T.gold}15`:`${T.danger}15`,borderRadius:"12px",padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:"32px",marginBottom:"8px"}}>{userData?.twoFactor?"🔒":"🔓"}</div>
              <div style={{color:T.text,fontWeight:"700",fontSize:"14px"}}>التحقق بخطوتين {userData?.twoFactor?"مفعّل":"معطّل"}</div>
              <div style={{color:T.textSec,fontSize:"12.5px",marginTop:"6px",lineHeight:"1.6"}}>عند تفعيله، سيتم إرسال رمز تحقق عبر بوت TSAXP عند محاولة تسجيل الدخول من جهاز جديد</div>
            </div>
            <PBtn onClick={async()=>{
              const newVal=!userData?.twoFactor;
              await update(ref(db,`users/${user.uid}`),{twoFactor:newVal});
              const snap=await get(ref(db,`users/${user.uid}`));
              if(snap.exists())setUserData(snap.val());
              // Send notification to bot
              const botChatId=`bot_${user.uid}`;
              const nid=uid();
              await set(ref(db,`messages/${botChatId}/${nid}`),{id:nid,chatId:botChatId,text:`🔐 تم ${newVal?"تفعيل":"إلغاء"} التحقق بخطوتين\n🕐 ${nowFull()}\n\n${newVal?"✅ حسابك محمي الآن. سيتم إرسال رمز تحقق هنا عند تسجيل الدخول من جهاز جديد.":"⚠️ تم إلغاء التحقق بخطوتين. يُنصح بتفعيله لحماية حسابك."}`,from:BOT_ID,time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
              setModal(null);
              alert(`تم ${newVal?"تفعيل":"إلغاء"} التحقق بخطوتين ✅`);
            }} color={userData?.twoFactor?T.danger:T.gold}>
              {userData?.twoFactor?"🔓 تعطيل التحقق بخطوتين":"🔒 تفعيل التحقق بخطوتين"}
            </PBtn>
          </div>
        </Modal>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.accent};border-radius:4px}
        @keyframes msgIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        textarea{scrollbar-width:none}
        textarea::-webkit-scrollbar{display:none}
        input::placeholder,textarea::placeholder{color:${T.textSec}}
        input,textarea,button{-webkit-tap-highlight-color:transparent;font-family:'Segoe UI',Tahoma,sans-serif}
      `}</style>
    </div>
  );
}

// ===== SUPPORT WIDGET =====
function SupportWidget({user,userData,sendSupport,onClose,db,chats,openChat}) {
  const [msg,setMsg]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);

  const handle=async()=>{
    if(!msg.trim())return;
    setLoading(true);
    await sendSupport(msg);
    setSent(true);setLoading(false);
  };

  if(sent) return (
    <div style={{textAlign:"center",padding:"20px",display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
      <div style={{fontSize:"48px"}}>✅</div>
      <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>تم إرسال طلبك!</div>
      <div style={{color:T.textSec,fontSize:"13px",lineHeight:"1.6"}}>الذكاء الاصطناعي يعالج طلبك الآن.<br/>إذا احتجت دعماً بشرياً سيتواصل معك الفريق قريباً.</div>
      <button onClick={onClose} style={{background:T.accentBtn,border:"none",borderRadius:"10px",padding:"11px 24px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px"}}>حسناً</button>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="اكتب مشكلتك أو سؤالك هنا..." rows={4}
        style={{background:T.inputBg,border:`1px solid ${T.border}44`,borderRadius:"12px",padding:"12px 14px",color:T.text,fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none"}}
        onFocus={e=>e.target.style.borderColor=T.accentBtn} onBlur={e=>e.target.style.borderColor=`${T.border}44`}/>
      <PBtn onClick={handle} loading={loading}>📨 إرسال للدعم الفني</PBtn>
    </div>
  );
}
