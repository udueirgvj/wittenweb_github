import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, get, push, onValue, off, update, remove } from "firebase/database";

const firebaseConfig = { apiKey:"AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc", authDomain:"tttrt-b8c5a.firebaseapp.com", databaseURL:"https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app", projectId:"tttrt-b8c5a", storageBucket:"tttrt-b8c5a.firebasestorage.app", messagingSenderId:"975123752593", appId:"1:975123752593:web:e591e930af3a3e29568130" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const OWNER_USERNAME = "tsaxp";
const APP_BOT_ID = "bot_dfgfd_official";
const APP_BOT_USERNAME = "dfgfd";
const ACOLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722","#607D8B","#795548"];
const rColor = s => ACOLORS[(s||"A").charCodeAt(0)%ACOLORS.length];
const uidGen = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const nowStr = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const nowFull = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const fmtSize = b => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";

const T = { bg:"#17212b", sidebar:"#0e1621", panel:"#182533", accent:"#2b5278", accentBtn:"#5288c1", text:"#e8f4fd", textSec:"#6b8ca4", msgOut:"#2b5278", msgIn:"#182533", border:"#0d1822", inputBg:"#1c2d3d", hover:"#1c2d3d", online:"#4dd67a", unread:"#5288c1", danger:"#e05c5c", gold:"#f0a040", verified:"#5288c1", tabBar:"#1c2733" };

// ─ Icons ─
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
  file:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2"/></svg>,
  user:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="2"/></svg>,
  group:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  channel:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L8 8H3l4.5 4.5-2 7L12 16l6.5 3.5-2-7L21 8h-5L12 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  settings:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/></svg>,
  saved:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={c}/><path d="M21 15L16 10L5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/></svg>,
  eyeOff:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  bot:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="3" stroke={c} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="16" r="1.5" fill={c}/><circle cx="16" cy="16" r="1.5" fill={c}/></svg>,
  support:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  notification:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  contacts:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  edit:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4h6v2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  crown:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  privacy:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  data:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5" rx="9" ry="3" stroke={c} strokeWidth="2"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke={c} strokeWidth="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke={c} strokeWidth="2"/></svg>,
  theme:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={c} strokeWidth="2"/><line x1="12" y1="1" x2="12" y2="3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  lang:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="2"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={c} strokeWidth="2"/></svg>,
  faq:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  device:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke={c} strokeWidth="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
};
const Ic = ({n,s=20,c=T.textSec}) => SVG[n]?SVG[n](c,s):null;

// ─ Avatar ─
const Av = ({name,color,size=46,online=false,verified=false,photo=null,fraud=false,bot=false}) => (
  <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:photo?"transparent":(color||rColor(name||"?")),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:"800",color:"#fff",overflow:"hidden",border:fraud?`2px solid ${T.danger}`:"none"}}>
      {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
    </div>
    {online&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.26,height:size*0.26,borderRadius:"50%",background:T.online,border:`2px solid ${T.sidebar}`}}/>}
    {verified&&<div style={{position:"absolute",bottom:-2,left:-2,background:T.verified,borderRadius:"50%",width:size*0.32,height:size*0.32,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.sidebar}`}}><Ic n="check" s={size*0.18} c="#fff"/></div>}
    {bot&&<div style={{position:"absolute",bottom:-2,left:-2,background:"#2ecc71",borderRadius:"50%",width:size*0.32,height:size*0.32,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.sidebar}`}}><span style={{fontSize:size*0.16,color:"#fff"}}>🤖</span></div>}
  </div>
);

// ─ Modal ─
const Modal = ({title,children,onClose,width="440px"}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}} onClick={onClose}>
    <div style={{background:"#1a2a3a",borderRadius:"18px",padding:"24px",width,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.7)",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <h3 style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",borderRadius:"50%"}}><Ic n="close" s={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

// ─ Form Input ─
const FInput = ({label,value,onChange,placeholder,type="text",autoFocus=false,onKeyDown}) => {
  const [show,setShow]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
      {label&&<label style={{color:T.textSec,fontSize:"12px",fontWeight:"600"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input value={value} onChange={onChange} placeholder={placeholder} type={type==="password"&&show?"text":type} autoFocus={autoFocus} onKeyDown={onKeyDown}
          style={{background:T.inputBg,border:`1px solid ${T.border}44`,borderRadius:"12px",padding:`11px ${type==="password"?"40px":"14px"} 11px 14px`,color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",boxSizing:"border-box",transition:"border 0.2s"}}
          onFocus={e=>e.target.style.borderColor=T.accentBtn} onBlur={e=>e.target.style.borderColor=`${T.border}44`}/>
        {type==="password"&&<button onClick={()=>setShow(!show)} style={{position:"absolute",left:"12px",background:"none",border:"none",cursor:"pointer"}}><Ic n={show?"eyeOff":"eye"} s={16}/></button>}
      </div>
    </div>
  );
};

const PBtn = ({children,onClick,loading=false,color=T.accentBtn,disabled=false,style={}}) => (
  <button onClick={onClick} disabled={loading||disabled} style={{background:color,border:"none",borderRadius:"12px",padding:"13px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:(loading||disabled)?"not-allowed":"pointer",fontFamily:"inherit",width:"100%",opacity:(loading||disabled)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"opacity 0.2s",...style}}>
    {loading?<span style={{animation:"spin 0.8s linear infinite",display:"inline-block",fontSize:"18px"}}>⟳</span>:children}
  </button>
);

const Toggle = ({checked,onChange}) => (
  <button onClick={onChange} style={{width:"44px",height:"24px",borderRadius:"12px",background:checked?T.accentBtn:"#3a4a5a",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",transition:"right 0.2s",right:checked?"3px":"23px"}}/>
  </button>
);

// ─ Auth Screen ─
function AuthScreen() {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({displayName:"",username:"",email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const F = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const validate = () => {
    if(mode==="register"){
      if(!form.displayName.trim()){setErr("أدخل اسمك الشخصي");return false;}
      if(!form.username.trim()){setErr("أدخل اسم المستخدم");return false;}
      if(form.username.trim().length<5){setErr("اسم المستخدم يجب أن يكون 5 أحرف على الأقل");return false;}
      if(/^\d/.test(form.username)){setErr("اسم المستخدم لا يبدأ برقم");return false;}
      if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(form.username)){setErr("اسم المستخدم: حروف وأرقام وشرطة سفلية، يبدأ بحرف");return false;}
      if(form.password.length<6){setErr("كلمة المرور 6 أحرف على الأقل");return false;}
    }
    if(!form.email.trim()){setErr("أدخل البريد الإلكتروني");return false;}
    if(!form.password){setErr("أدخل كلمة المرور");return false;}
    return true;
  };

  const handleRegister = async () => {
    if(!validate())return;
    setLoading(true);setErr("");
    try {
      const usSnap = await get(ref(db,`usernames/${form.username.toLowerCase()}`));
      if(usSnap.exists()){setErr("اسم المستخدم مستخدم بالفعل");setLoading(false);return;}
      const cred = await createUserWithEmailAndPassword(auth,form.email,form.password);
      await updateProfile(cred.user,{displayName:form.displayName});
      const uid2 = cred.user.uid;
      const userData = {uid:uid2,displayName:form.displayName,username:form.username.toLowerCase(),email:form.email,bio:"",photoURL:"",verified:false,isBanned:false,isRestricted:false,isFraud:false,twoFactor:false,createdAt:Date.now(),lastSeen:Date.now(),color:rColor(form.displayName)};
      await set(ref(db,`users/${uid2}`),userData);
      await set(ref(db,`usernames/${form.username.toLowerCase()}`),uid2);
      // Saved messages
      const savedId=`saved_${uid2}`;
      await set(ref(db,`chats/${savedId}`),{id:savedId,type:"saved",name:"الرسائل المحفوظة",members:[uid2],createdAt:Date.now()});
      await set(ref(db,`userChats/${uid2}/${savedId}`),{chatId:savedId,lastMessage:"احفظ رسائلك هنا",lastTime:nowStr(),unread:0,order:Date.now()-2,type:"saved",name:"الرسائل المحفوظة",color:"#5288c1"});
      // Bot chat
      const botChatId=`bot_${uid2}`;
      await set(ref(db,`chats/${botChatId}`),{id:botChatId,type:"bot",name:"DFGFD",username:APP_BOT_USERNAME,isOfficial:true,members:[uid2,APP_BOT_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${uid2}/${botChatId}`),{chatId:botChatId,lastMessage:"مرحباً بك في تيرمين ✈️",lastTime:nowStr(),unread:1,order:Date.now()-1,type:"bot",name:"DFGFD",color:"#5288c1"});
      const wid=uidGen();
      await set(ref(db,`messages/${botChatId}/${wid}`),{id:wid,chatId:botChatId,text:`✈️ مرحباً ${form.displayName}!\n\nأنا DFGFD، المساعد الرسمي لتطبيق تيرمين.\n\nيمكنك استخدام التطبيق بكل أمان وجميع بياناتك مشفّرة.\n\n🆔 معرّفك: @${form.username.toLowerCase()}\n\nإذا احتجت أي مساعدة أو حدثت أي تغييرات في حسابك ستصلك الإشعارات هنا! 🔔`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
    } catch(e){
      const m={"auth/email-already-in-use":"البريد مستخدم بالفعل","auth/invalid-email":"بريد غير صالح","auth/weak-password":"كلمة المرور ضعيفة","auth/network-request-failed":"خطأ في الاتصال"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if(!validate())return;
    setLoading(true);setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth,form.email,form.password);
      await update(ref(db,`users/${cred.user.uid}`),{lastSeen:Date.now()});
    } catch(e){
      const m={"auth/invalid-credential":"بيانات الدخول غير صحيحة","auth/user-not-found":"لا يوجد حساب","auth/wrong-password":"كلمة المرور خاطئة","auth/network-request-failed":"خطأ في الاتصال"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"64px",marginBottom:"12px",filter:"drop-shadow(0 8px 24px rgba(82,136,193,0.4))"}}>✈️</div>
          <div style={{color:T.text,fontSize:"28px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
          <div style={{color:T.textSec,fontSize:"13px",marginTop:"6px"}}>تواصل أسرع · أسهل · أكثر أماناً</div>
        </div>
        <div style={{display:"flex",background:T.panel,borderRadius:"14px",padding:"4px",marginBottom:"22px",gap:"4px"}}>
          {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{flex:1,padding:"10px",borderRadius:"11px",border:"none",background:mode===k?T.accentBtn:"transparent",color:mode===k?"#fff":T.textSec,fontWeight:"700",fontSize:"14px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        <div style={{background:T.sidebar,borderRadius:"18px",padding:"24px",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:"13px"}}>
          {mode==="register"&&<FInput label="الاسم الشخصي" value={form.displayName} onChange={F("displayName")} placeholder="اسمك الكامل" autoFocus/>}
          {mode==="register"&&<FInput label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" value={form.username} onChange={F("username")} placeholder="myusername"/>}
          <FInput label="البريد الإلكتروني" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" autoFocus={mode==="login"}/>
          <FInput label="كلمة المرور" value={form.password} onChange={F("password")} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())}/>
          {err&&<div style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"10px",padding:"10px",color:T.danger,fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
          <PBtn onClick={mode==="login"?handleLogin:handleRegister} loading={loading}>{mode==="login"?"🔐 تسجيل الدخول":"✨ إنشاء حساب"}</PBtn>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} input::placeholder{color:${T.textSec}}`}</style>
    </div>
  );
}

// ─ Settings Panel (full Telegram sections) ─
function SettingsPanel({user,userData,setUserData,isOwner,setModal}) {
  const [tab,setTab]=useState("main");
  const photoRef=useRef(null);

  const uploadPhoto = useCallback(file => {
    if(!file||!user) return;
    const r=new FileReader();
    r.onload=async e=>{
      await update(ref(db,`users/${user.uid}`),{photoURL:e.target.result});
      const s=await get(ref(db,`users/${user.uid}`));
      if(s.exists())setUserData(s.val());
    };
    r.readAsDataURL(file);
  },[user,setUserData]);

  const SECTIONS=[
    {title:"الحساب",items:[
      {ic:"user",l:"تعديل الملف الشخصي",sub:userData?.bio||"اضغط لتعديل",a:()=>setModal("editProfile")},
      {ic:"device",l:"الأجهزة النشطة",sub:"جهاز واحد"},
      {ic:"lock",l:"التحقق بخطوتين",sub:userData?.twoFactor?"مفعّل":"معطّل",a:()=>setModal("twoFactor")},
    ]},
    {title:"الإشعارات والأصوات",items:[
      {ic:"notification",l:"الرسائل الخاصة",sub:"تنبيه + صوت"},
      {ic:"notification",l:"المجموعات",sub:"فقط الإشارات"},
      {ic:"notification",l:"القنوات",sub:"صامت"},
    ]},
    {title:"الخصوصية والأمان",items:[
      {ic:"privacy",l:"رقم الهاتف",sub:"لا أحد"},
      {ic:"privacy",l:"الصورة الشخصية",sub:"الجميع"},
      {ic:"privacy",l:"الرسائل الأخيرة",sub:"جهات الاتصال"},
      {ic:"privacy",l:"حالة الاتصال",sub:"الجميع"},
    ]},
    {title:"البيانات والتخزين",items:[
      {ic:"data",l:"استخدام البيانات",sub:""},
      {ic:"data",l:"إدارة مساحة التخزين",sub:""},
    ]},
    {title:"المظهر",items:[
      {ic:"theme",l:"الوضع الداكن",sub:"مفعّل"},
      {ic:"theme",l:"حجم الخط",sub:"متوسط"},
      {ic:"theme",l:"لون الرسائل",sub:"أزرق"},
    ]},
    {title:"اللغة",items:[
      {ic:"lang",l:"لغة التطبيق",sub:"العربية"},
    ]},
    {title:"الدعم والمساعدة",items:[
      {ic:"support",l:"الدعم الفني",a:()=>setModal("support")},
      {ic:"faq",l:"الأسئلة الشائعة",sub:""},
      {ic:"privacy",l:"سياسة الخصوصية",sub:""},
    ]},
    ...(isOwner?[{title:"الإدارة",items:[{ic:"crown",l:"لوحة تحكم المالك",sub:"tsaxp",a:()=>window.open("/admin","_blank")}]}]:[]),
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
      <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])} onClick={e=>e.target.value=""}/>
      {/* Profile Hero */}
      <div style={{background:`linear-gradient(160deg,${T.accent},#12243a)`,padding:"24px 16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",flexShrink:0}}>
        <div style={{position:"relative",cursor:"pointer"}} onClick={()=>photoRef.current?.click()}>
          <Av name={userData?.displayName||""} color={userData?.color||rColor(userData?.displayName||"")} size={80} verified={userData?.verified} photo={userData?.photoURL}/>
          <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.accent}`}}>📷</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#fff",fontSize:"19px",fontWeight:"800",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
            {userData?.displayName}
            {userData?.verified&&<Ic n="check" s={15} c="#fff"/>}
            {isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px"}}>@{userData?.username}</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"12px",marginTop:"3px"}}>{userData?.bio||"لا توجد نبذة"}</div>
        </div>
      </div>
      {/* Sections */}
      {SECTIONS.map(group=>(
        <div key={group.title} style={{marginBottom:"6px"}}>
          <div style={{color:T.textSec,fontSize:"12px",fontWeight:"700",padding:"12px 16px 5px",letterSpacing:"0.5px"}}>{group.title}</div>
          {group.items.map(item=>(
            <div key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:T.sidebar,cursor:item.a?"pointer":"default",borderBottom:`1px solid ${T.border}15`,transition:"background 0.15s"}}
              onMouseEnter={e=>{if(item.a)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>e.currentTarget.style.background=T.sidebar}>
              <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.accentBtn}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ic n={item.ic} s={18} c={T.accentBtn}/>
              </div>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontSize:"14.5px"}}>{item.l}</div>
                {item.sub&&<div style={{color:T.textSec,fontSize:"12px"}}>{item.sub}</div>}
              </div>
              {item.a&&<Ic n="back" s={14} c={T.textSec}/>}
            </div>
          ))}
        </div>
      ))}
      <div style={{padding:"16px",textAlign:"center"}}>
        <button onClick={()=>signOut(auth)} style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"12px",padding:"13px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px",width:"100%"}}>🚪 تسجيل الخروج</button>
        <div style={{color:T.textSec,fontSize:"11px",marginTop:"12px"}}>✈️ تيرمين v4.0</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user,setUser]=useState(null);
  const [userData,setUserData]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [chats,setChats]=useState([]);
  const [activeChat,setActiveChat]=useState(null);
  const [activeChatData,setActiveChatData]=useState(null);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [search,setSearch]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searchMode,setSearchMode]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showSidebar,setShowSidebar]=useState(true);
  const [showEmoji,setShowEmoji]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [attachMenu,setAttachMenu]=useState(false);
  const [replyTo,setReplyTo]=useState(null);
  const [ctxMenu,setCtxMenu]=useState(null);
  const [modal,setModal]=useState(null);
  const [bottomTab,setBottomTab]=useState("chats");
  const [isMobile,setIsMobile]=useState(window.innerWidth<900);
  const [newForm,setNewForm]=useState({name:"",username:"",bio:"",photo:""});
  const [editProfile,setEditProfile]=useState({displayName:"",username:"",bio:"",photo:""});
  const [isOwner,setIsOwner]=useState(false);
  const [channelSettings,setChannelSettings]=useState(null);
  const [msgListUnsub,setMsgListUnsub]=useState(null);

  const endRef=useRef(null);
  const inputRef=useRef(null);
  const fileRef=useRef(null);
  const imgRef=useRef(null);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async u=>{
      if(u){
        setUser(u);
        const snap=await get(ref(db,`users/${u.uid}`));
        if(snap.exists()){
          const d=snap.val();
          if(d.isBanned){await signOut(auth);setUser(null);setUserData(null);setAuthLoading(false);alert("تم حظر حسابك");return;}
          setUserData(d);
          setEditProfile({displayName:d.displayName||"",username:d.username||"",bio:d.bio||"",photo:d.photoURL||""});
          setIsOwner(d.username===OWNER_USERNAME);
        }
      } else {setUser(null);setUserData(null);setIsOwner(false);}
      setAuthLoading(false);
    });
    const onResize=()=>setIsMobile(window.innerWidth<900);
    window.addEventListener("resize",onResize);
    return()=>{unsub();window.removeEventListener("resize",onResize);};
  },[]);

  // Load chats with dedup
  useEffect(()=>{
    if(!user) return;
    const r=ref(db,`userChats/${user.uid}`);
    const unsub=onValue(r,async snap=>{
      if(!snap.exists()){setChats([]);return;}
      const raw=snap.val();
      const seen=new Set();
      const list=await Promise.all(Object.values(raw).map(async uc=>{
        const cid=uc.chatId;
        if(!cid||seen.has(cid)) return null;
        seen.add(cid);
        const cs=await get(ref(db,`chats/${cid}`));
        if(!cs.exists()) return null;
        return {...cs.val(),...uc,id:cid};
      }));
      setChats(list.filter(Boolean).sort((a,b)=>(b.order||0)-(a.order||0)));
    });
    return()=>off(r);
  },[user]);

  // Load messages
  useEffect(()=>{
    if(msgListUnsub){msgListUnsub();setMsgListUnsub(null);}
    if(!activeChat) return;
    const r=ref(db,`messages/${activeChat}`);
    const unsub=onValue(r,snap=>{
      if(!snap.exists()){setMessages([]);return;}
      setMessages(Object.values(snap.val()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)));
    });
    setMsgListUnsub(()=>unsub);
    return()=>off(r);
  },[activeChat]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  // Search
  useEffect(()=>{
    if(!search.trim()||!searchMode){setSearchResults([]);return;}
    const q=search.toLowerCase().replace("@","");
    const doSearch=async()=>{
      const results=[];
      const uSnap=await get(ref(db,"users"));
      if(uSnap.exists()) Object.values(uSnap.val()).forEach(u=>{
        if((u.username||"").includes(q)||(u.displayName||"").toLowerCase().includes(q)) results.push({...u,resultType:"user"});
      });
      const cSnap=await get(ref(db,"chats"));
      if(cSnap.exists()) Object.values(cSnap.val()).forEach(c=>{
        if(["channel","group","bot"].includes(c.type)&&((c.username||"").includes(q)||(c.name||"").toLowerCase().includes(q))) results.push({...c,resultType:c.type});
      });
      setSearchResults(results.slice(0,20));
    };
    const t=setTimeout(doSearch,300);
    return()=>clearTimeout(t);
  },[search,searchMode]);

  const openChat=useCallback(async(chatId,chatDataOverride=null)=>{
    setActiveChat(chatId);
    setShowInfo(false);setReplyTo(null);setShowMenu(false);setAttachMenu(false);setSearchMode(false);setSearch("");
    if(isMobile) setShowSidebar(false);
    const snap=await get(ref(db,`chats/${chatId}`));
    setActiveChatData(snap.exists()?snap.val():chatDataOverride);
    if(user) await update(ref(db,`userChats/${user.uid}/${chatId}`),{unread:0});
    setBottomTab("chats");
    setTimeout(()=>inputRef.current?.focus(),80);
  },[isMobile,user]);

  const sendMessage=useCallback(async(overText=null,type="text",extra={})=>{
    const text=overText??input.trim();
    if(!text&&!extra.imageUrl&&!extra.fileName) return;
    if(!activeChat||!user||!userData) return;
    if(activeChatData?.type==="channel"&&activeChatData?.ownerId!==user.uid) return;
    const msgId=uidGen();
    const msg={id:msgId,chatId:activeChat,text:text||"",from:user.uid,senderName:userData.displayName,senderUsername:userData.username,senderPhoto:userData.photoURL||"",senderColor:userData.color||rColor(userData.displayName),time:nowStr(),type,createdAt:Date.now(),replyTo:replyTo?{text:replyTo.text,sender:replyTo.senderName||"أنا",msgId:replyTo.id}:null,...extra};
    await set(ref(db,`messages/${activeChat}/${msgId}`),msg);
    const preview=type==="image"?"📷 صورة":type==="file"?`📎 ${msg.fileName}`:text;
    await update(ref(db,`userChats/${user.uid}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),order:Date.now()});
    if(activeChatData?.members){
      for(const mid of activeChatData.members){
        if(mid!==user.uid&&!mid.startsWith("bot_")){
          const mc=await get(ref(db,`userChats/${mid}/${activeChat}`));
          const u2c=mc.exists()?mc.val().unread||0:0;
          await update(ref(db,`userChats/${mid}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),unread:u2c+1,order:Date.now()});
        }
      }
    }
    setInput("");setReplyTo(null);setShowEmoji(false);
    inputRef.current?.focus();
  },[input,activeChat,user,userData,replyTo,activeChatData]);

  const handleFile=useCallback((file,isImg)=>{
    if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{
      if(isImg) sendMessage("","image",{imageUrl:e.target.result,fileName:file.name,fileSize:file.size});
      else sendMessage("","file",{fileName:file.name,fileSize:file.size,fileData:e.target.result});
    };
    reader.readAsDataURL(file);
    setAttachMenu(false);
  },[sendMessage]);

  const saveProfile=useCallback(async()=>{
    if(!user) return;
    if(editProfile.username!==userData?.username){
      if(editProfile.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
      if(/^\d/.test(editProfile.username)){alert("اسم المستخدم لا يبدأ برقم");return;}
      if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(editProfile.username)){alert("اسم المستخدم: حروف وأرقام فقط، يبدأ بحرف");return;}
      const usSnap=await get(ref(db,`usernames/${editProfile.username.toLowerCase()}`));
      if(usSnap.exists()&&usSnap.val()!==user.uid){alert("اسم المستخدم مستخدم بالفعل");return;}
      if(userData?.username) await remove(ref(db,`usernames/${userData.username}`));
      await set(ref(db,`usernames/${editProfile.username.toLowerCase()}`),user.uid);
      // Notify user via bot
      const botId=`bot_${user.uid}`;
      const nid=uidGen();
      await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`🔄 تم تغيير اسم المستخدم\nمن: @${userData?.username}\nإلى: @${editProfile.username}\n🕐 ${nowFull()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
    }
    const updates={displayName:editProfile.displayName,username:editProfile.username.toLowerCase(),bio:editProfile.bio,photoURL:editProfile.photo};
    await update(ref(db,`users/${user.uid}`),updates);
    await updateProfile(user,{displayName:editProfile.displayName});
    const snap=await get(ref(db,`users/${user.uid}`));
    if(snap.exists())setUserData(snap.val());
    setModal(null);
  },[user,userData,editProfile]);

  const createConvo=useCallback(async(type)=>{
    if(!newForm.name.trim()||!user||!userData) return;
    if(newForm.username){
      if(newForm.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
      if(/^\d/.test(newForm.username)){alert("اسم المستخدم لا يبدأ برقم");return;}
      const ex=await get(ref(db,`chatUsernames/${newForm.username.toLowerCase()}`));
      if(ex.exists()){alert("اسم المستخدم مستخدم لقناة/مجموعة أخرى");return;}
    }
    const chatId=uidGen();
    const chatData={id:chatId,type,name:newForm.name.trim(),username:(newForm.username||chatId.slice(0,8)).toLowerCase(),bio:newForm.bio||"",photoURL:"",ownerId:user.uid,members:[user.uid],admins:[user.uid],verified:false,createdAt:Date.now(),...(type==="channel"?{subscribers:1,subscribersList:[user.uid]}:{})};
    await set(ref(db,`chats/${chatId}`),chatData);
    if(newForm.username) await set(ref(db,`chatUsernames/${newForm.username.toLowerCase()}`),chatId);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"تم الإنشاء",lastTime:nowStr(),unread:0,order:Date.now(),...chatData});
    const wid=uidGen();
    await set(ref(db,`messages/${chatId}/${wid}`),{id:wid,chatId,text:`🎉 تم إنشاء ${type==="channel"?"القناة":"المجموعة"} "${newForm.name}"`,from:"system",time:nowStr(),type:"system",createdAt:Date.now()});
    setModal(null);setNewForm({name:"",username:"",bio:"",photo:""});
    openChat(chatId,chatData);
  },[newForm,user,userData,openChat]);

  const joinChannel=useCallback(async chat=>{
    if(!user) return;
    const chatId=chat.id||chat.chatId;
    const already=chats.find(c=>(c.id||c.chatId)===chatId);
    if(already){openChat(chatId,chat);return;}
    const newList=[...(chat.subscribersList||[])];
    if(!newList.includes(user.uid)) newList.push(user.uid);
    const newMembers=[...(chat.members||[])];
    if(!newMembers.includes(user.uid)) newMembers.push(user.uid);
    await update(ref(db,`chats/${chatId}`),{subscribers:newList.length,subscribersList:newList,members:newMembers});
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:chat.lastMessage||"",lastTime:nowStr(),unread:0,order:Date.now(),...chat,id:chatId});
    openChat(chatId,{...chat,subscribers:newList.length,members:newMembers});
  },[user,chats,openChat]);

  const openPrivateChat=useCallback(async targetUser=>{
    if(!user||targetUser.uid===user.uid) return;
    const chatId=`pm_${[user.uid,targetUser.uid].sort().join("_")}`;
    const snap=await get(ref(db,`chats/${chatId}`));
    if(!snap.exists()){
      const cd={id:chatId,type:"private",name:targetUser.displayName,members:[user.uid,targetUser.uid],createdAt:Date.now(),color:targetUser.color||rColor(targetUser.displayName),photoURL:targetUser.photoURL||""};
      await set(ref(db,`chats/${chatId}`),cd);
      await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
      await set(ref(db,`userChats/${targetUser.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
    }
    setSearchMode(false);setSearch("");setModal(null);
    openChat(chatId,snap.exists()?snap.val():{id:chatId,type:"private",name:targetUser.displayName,color:targetUser.color,photoURL:targetUser.photoURL});
  },[user,openChat]);

  const updateChannelSettings=useCallback(async()=>{
    if(!channelSettings) return;
    await update(ref(db,`chats/${channelSettings.id}`),{name:channelSettings.name,bio:channelSettings.bio||"",username:(channelSettings.username||"").toLowerCase(),photoURL:channelSettings.photoURL||"",permissions:channelSettings.permissions||{}});
    if(channelSettings.username) await set(ref(db,`chatUsernames/${channelSettings.username.toLowerCase()}`),channelSettings.id);
    const snap=await get(ref(db,`chats/${channelSettings.id}`));
    if(snap.exists()){setActiveChatData(snap.val());if(activeChat===channelSettings.id)setActiveChatData(snap.val());}
    setModal(null);
    alert("✅ تم حفظ إعدادات القناة");
  },[channelSettings,activeChat]);

  const EMOJIS=["😀","😂","😍","😊","🥳","😎","🤩","😭","😤","🥺","❤️","🔥","💯","⭐","🎉","👍","👋","🙏","💪","✅","🚀","💡","🎵","🌟","😅","🤔","💬","📱","🎯","🏆","💎","🌈","🎁","🍕","☕","🌸","🦋","🎮","📸","🔑"];

  const isChannel=activeChatData?.type==="channel";
  const isGroup=activeChatData?.type==="group";
  const isBot=activeChatData?.type==="bot";
  const isSaved=activeChatData?.type==="saved";
  const isMine=activeChatData?.ownerId===user?.uid;
  const canSend=!isChannel||(isChannel&&isMine);

  if(authLoading) return (
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
      <div style={{fontSize:"56px",animation:"spin 1.2s linear infinite"}}>✈️</div>
      <div style={{color:T.text,fontSize:"22px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );

  if(!user) return <AuthScreen/>;

  // ─ Search Results ─
  const renderSearch=()=>(
    <div style={{overflowY:"auto",flex:1}}>
      {!searchResults.length&&search.trim()&&<div style={{padding:"40px",textAlign:"center",color:T.textSec,fontSize:"14px"}}>لا توجد نتائج لـ "{search}"</div>}
      {searchResults.map((r,i)=>{
        const isU=r.resultType==="user";
        const isCh=r.resultType==="channel";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.border}18`,transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>{if(isU)openPrivateChat(r);else if(isCh)joinChannel(r);else openChat(r.id,r);}}>
            <Av name={r.name||r.displayName} color={r.color||rColor(r.name||r.displayName)} size={46} verified={r.verified} photo={r.photoURL} fraud={r.isFraud} bot={r.resultType==="bot"}/>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"5px"}}>
                {isCh&&<Ic n="channel" s={12} c={T.gold}/>}
                {r.resultType==="group"&&<Ic n="group" s={12} c={T.accentBtn}/>}
                {r.name||r.displayName}
                {r.verified&&<Ic n="check" s={12} c={T.verified}/>}
                {r.isFraud&&<span style={{color:T.danger,fontSize:"10px",background:`${T.danger}20`,padding:"1px 5px",borderRadius:"5px"}}>احتيال</span>}
              </div>
              <div style={{color:T.textSec,fontSize:"12px"}}>@{r.username} · {isCh?`${r.subscribers||0} مشترك`:r.resultType==="group"?`${r.members?.length||0} عضو`:"مستخدم"}</div>
            </div>
            {isCh&&!chats.find(c=>(c.id||c.chatId)===r.id)&&(
              <button onClick={e=>{e.stopPropagation();joinChannel(r);}} style={{background:`${T.accentBtn}20`,border:`1px solid ${T.accentBtn}40`,borderRadius:"8px",padding:"6px 12px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>انضمام</button>
            )}
          </div>
        );
      })}
    </div>
  );

  // ─ Chat Area ─
  const chatName=activeChatData?.name||"محادثة";
  const chatType=activeChatData?.type;

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",overflow:"hidden"}}
      onClick={()=>{setShowMenu(false);setAttachMenu(false);setCtxMenu(null);setShowEmoji(false);}}>

      {/* ─ SIDEBAR ─ */}
      <div style={{width:showSidebar?(isMobile?"100%":"360px"):"0",minWidth:0,background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"width 0.25s",position:isMobile?"absolute":"relative",height:"100%",zIndex:isMobile?20:1}}>

        {/* Top Bar */}
        <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${T.border}`,background:T.sidebar,position:"relative",zIndex:50}}>
          {bottomTab==="chats"&&(<>
            <button onClick={e=>{e.stopPropagation();setShowMenu(!showMenu);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="menu" s={20}/></button>
            <div style={{flex:1,display:"flex",alignItems:"center",background:T.inputBg,borderRadius:"22px",padding:"7px 14px",gap:"8px",cursor:"text"}} onClick={()=>setSearchMode(true)}>
              <Ic n="search" s={15}/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} onFocus={()=>setSearchMode(true)} placeholder="بحث..." style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14px",flex:1,direction:"rtl",fontFamily:"inherit"}}/>
              {searchMode&&search&&<button onClick={()=>{setSearch("");setSearchMode(false);}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
            </div>
          </>)}
          {bottomTab!=="chats"&&<div style={{flex:1,color:T.text,fontSize:"16px",fontWeight:"800",paddingRight:"6px"}}>{bottomTab==="settings"?"الإعدادات":bottomTab==="contacts"?"جهات الاتصال":""}</div>}

          {/* Dropdown */}
          {showMenu&&(
            <div style={{position:"absolute",top:"54px",right:"8px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:300,minWidth:"210px",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
              {[
                {n:"user",l:"محادثة جديدة",a:()=>{setModal("newChat");setShowMenu(false);}},
                {n:"group",l:"مجموعة جديدة",a:()=>{setModal("newGroup");setShowMenu(false);}},
                {n:"channel",l:"قناة جديدة",a:()=>{setModal("newChannel");setShowMenu(false);}},
                {n:"saved",l:"رسائل محفوظة",a:()=>{const s=chats.find(c=>c.type==="saved");if(s)openChat(s.chatId||s.id,s);setShowMenu(false);}},
                {n:"support",l:"الدعم الفني",a:()=>{setModal("support");setShowMenu(false);}},
                {n:"settings",l:"الإعدادات",a:()=>{setBottomTab("settings");setShowMenu(false);}},
                ...(isOwner?[{n:"crown",l:"لوحة الإدارة",a:()=>{window.open("/admin","_blank");setShowMenu(false);}}]:[]),
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
        {bottomTab==="chats"&&!searchMode&&(
          <div style={{padding:"5px 14px 2px",display:"flex",alignItems:"center",gap:"7px"}}>
            <span style={{fontSize:"15px"}}>✈️</span>
            <span style={{color:T.accentBtn,fontWeight:"900",fontSize:"15px",letterSpacing:"1.5px"}}>تيرمين</span>
            {isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}
          </div>
        )}

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {bottomTab==="settings"&&<SettingsPanel user={user} userData={userData} setUserData={setUserData} isOwner={isOwner} setModal={setModal}/>}
          {bottomTab==="contacts"&&(
            <div style={{overflowY:"auto",padding:"12px"}}>
              <div style={{color:T.textSec,fontSize:"13px",fontWeight:"600",padding:"8px 4px"}}>جهات الاتصال</div>
              {chats.filter(c=>c.type==="private").map(c=>(
                <div key={c.id||c.chatId} onClick={()=>openChat(c.chatId||c.id,c)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"12px",cursor:"pointer",marginBottom:"4px",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={c.name} color={c.color||rColor(c.name)} size={44}/>
                  <div style={{color:T.text,fontWeight:"600",fontSize:"14px"}}>{c.name}</div>
                </div>
              ))}
              {!chats.filter(c=>c.type==="private").length&&<div style={{padding:"30px",textAlign:"center",color:T.textSec,fontSize:"13px"}}>لا توجد جهات اتصال</div>}
            </div>
          )}
          {bottomTab==="chats"&&(searchMode&&search?renderSearch():(
            <div>
              {!chats.length&&<div style={{padding:"40px",textAlign:"center",color:T.textSec,fontSize:"14px"}}>لا توجد محادثات بعد</div>}
              {chats.map(chat=>{
                const cid=chat.id||chat.chatId;
                const isActive=activeChat===cid;
                const name=chat.name||"محادثة";
                return (
                  <div key={cid} onClick={()=>openChat(cid,chat)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 14px",cursor:"pointer",background:isActive?T.accent:"transparent",borderBottom:`1px solid ${T.border}18`,transition:"background 0.15s"}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <Av name={name} color={chat.color||rColor(name)} size={52} online={chat.type==="private"} verified={chat.verified} photo={chat.photoURL} bot={chat.type==="bot"}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:T.text,fontWeight:"600",fontSize:"15px",display:"flex",alignItems:"center",gap:"4px"}}>
                          {chat.type==="channel"&&<Ic n="channel" s={11} c={T.gold}/>}
                          {chat.type==="group"&&<Ic n="group" s={11} c={T.accentBtn}/>}
                          {chat.type==="saved"&&<Ic n="saved" s={11} c={T.accentBtn}/>}
                          {chat.type==="bot"&&<Ic n="bot" s={11} c={T.gold}/>}
                          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"150px"}}>{name}</span>
                          {chat.verified&&<Ic n="check" s={11} c={T.verified}/>}
                        </span>
                        <span style={{color:T.textSec,fontSize:"11px",flexShrink:0}}>{chat.lastTime}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                        <span style={{color:T.textSec,fontSize:"13px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"180px"}}>{chat.lastMessage}</span>
                        {chat.unread>0&&<span style={{background:T.unread,color:"#fff",borderRadius:"12px",minWidth:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",padding:"0 5px",flexShrink:0}}>{chat.unread>99?"99+":chat.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* FAB */}
        {bottomTab==="chats"&&!searchMode&&(
          <div style={{padding:"8px 14px 5px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end",background:T.sidebar}}>
            <button onClick={e=>{e.stopPropagation();setModal("fabMenu");}} style={{background:T.accentBtn,border:"none",borderRadius:"50%",width:"46px",height:"46px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 14px rgba(82,136,193,0.45)",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <Ic n="plus" s={22} c="#fff"/>
            </button>
          </div>
        )}

        {/* Bottom Tab Bar */}
        <div style={{display:"flex",background:T.tabBar,borderTop:`1px solid ${T.border}`,padding:"6px 0"}}>
          {[{k:"chats",n:"menu",l:"المحادثات"},{k:"contacts",n:"contacts",l:"جهات الاتصال"},{k:"settings",n:"settings",l:"الإعدادات"}].map(tab=>(
            <button key={tab.k} onClick={()=>{setBottomTab(tab.k);setSearchMode(false);setSearch("");}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",cursor:"pointer",padding:"6px 4px"}}>
              <Ic n={tab.n} s={22} c={bottomTab===tab.k?T.accentBtn:T.textSec}/>
              <span style={{color:bottomTab===tab.k?T.accentBtn:T.textSec,fontSize:"10px",fontWeight:bottomTab===tab.k?"700":"400"}}>{tab.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─ MAIN AREA ─ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {!activeChat?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"40px"}}>
            <div style={{fontSize:"72px",filter:"drop-shadow(0 8px 24px rgba(82,136,193,0.3))"}}>✈️</div>
            <div style={{textAlign:"center"}}>
              <div style={{color:T.text,fontSize:"26px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
              <div style={{color:T.textSec,fontSize:"13px",marginTop:"6px"}}>اختر محادثة للبدء</div>
            </div>
          </div>
        ):(
          <>
            {/* Chat Header */}
            <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",background:T.sidebar,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
              {isMobile&&<button onClick={()=>{setShowSidebar(true);setActiveChat(null);setActiveChatData(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><Ic n="back" s={22}/></button>}
              <div style={{display:"flex",alignItems:"center",gap:"11px",flex:1,cursor:"pointer"}} onClick={()=>setShowInfo(!showInfo)}>
                <Av name={chatName} color={activeChatData?.color||rColor(chatName)} size={40} online={chatType==="private"} verified={activeChatData?.verified} photo={activeChatData?.photoURL} bot={isBot}/>
                <div>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"15px",display:"flex",alignItems:"center",gap:"5px"}}>
                    {chatName}
                    {activeChatData?.verified&&<Ic n="check" s={13} c={T.verified}/>}
                    {isBot&&<span style={{color:T.gold,fontSize:"10px",background:`${T.gold}20`,padding:"1px 5px",borderRadius:"6px",fontWeight:"700"}}>بوت</span>}
                  </div>
                  <div style={{color:T.textSec,fontSize:"12px"}}>
                    {isSaved?"رسائلك المحفوظة":isBot?"مساعد رسمي ✈️":isGroup?`${activeChatData?.members?.length||0} عضو`:isChannel?`${activeChatData?.subscribers||0} مشترك`:""}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:"2px"}}>
                {!isBot&&!isSaved&&<button style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="call" s={20}/></button>}
                <button style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="search" s={20}/></button>
                <button onClick={e=>{e.stopPropagation();if(isChannel&&isMine){setChannelSettings({...activeChatData});setModal("channelSettings");}else setShowInfo(!showInfo);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="more" s={20}/></button>
              </div>
            </div>

            {/* Reply Banner */}
            {replyTo&&(
              <div style={{padding:"7px 16px",background:T.panel,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"3px",height:"30px",background:T.accentBtn,borderRadius:"2px",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.accentBtn,fontSize:"11.5px",fontWeight:"700"}}>{replyTo.senderName||"أنت"}</div>
                  <div style={{color:T.textSec,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{replyTo.text}</div>
                </div>
                <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={15}/></button>
              </div>
            )}

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px",background:T.bg,display:"flex",flexDirection:"column",gap:"2px"}}>
              {!messages.length&&<div style={{margin:"auto",textAlign:"center",color:T.textSec}}><div style={{fontSize:"40px",marginBottom:"10px"}}>{isSaved?"🔖":isBot?"🤖":"👋"}</div><div style={{fontSize:"14px"}}>{isSaved?"لا توجد رسائل محفوظة":isBot?"ابدأ المحادثة مع البوت":"ابدأ المحادثة!"}</div></div>}
              {messages.map((msg,idx)=>{
                const isMe=msg.from===user?.uid;
                const isSystem=msg.type==="system";
                const isBotMsg=msg.isBot||msg.from===APP_BOT_ID||msg.from==="ai_bot";
                const showSender=!isMe&&isGroup&&(idx===0||messages[idx-1]?.from!==msg.from);
                if(isSystem) return <div key={msg.id} style={{textAlign:"center",margin:"6px 0"}}><span style={{background:`${T.accentBtn}20`,color:T.textSec,borderRadius:"12px",padding:"4px 14px",fontSize:"12px"}}>{msg.text}</span></div>;
                return (
                  <div key={msg.id} style={{display:"flex",justifyContent:isMe?"flex-start":"flex-end",marginBottom:"1px",animation:"msgIn 0.2s ease"}}
                    onContextMenu={e=>{e.preventDefault();setCtxMenu({x:e.clientX,y:e.clientY,msg});}}>
                    <div style={{maxWidth:"72%",padding:"8px 11px 5px",borderRadius:isMe?"16px 16px 16px 4px":"16px 16px 4px 16px",background:isMe?T.msgOut:isBotMsg?"#1a3040":T.msgIn,boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
                      {showSender&&<div style={{color:T.accentBtn,fontSize:"12px",fontWeight:"700",marginBottom:"3px"}}>{msg.senderName}</div>}
                      {isBotMsg&&!isMe&&<div style={{color:T.gold,fontSize:"11px",fontWeight:"700",marginBottom:"3px"}}>⭐ {msg.senderName||"DFGFD"}</div>}
                      {msg.replyTo&&<div style={{background:"rgba(255,255,255,0.07)",borderRadius:"8px",padding:"5px 10px",marginBottom:"6px",borderRight:`3px solid ${T.accentBtn}`}}><div style={{color:T.accentBtn,fontSize:"11px",fontWeight:"700"}}>{msg.replyTo.sender}</div><div style={{color:T.textSec,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{msg.replyTo.text}</div></div>}
                      {msg.type==="image"&&<div style={{marginBottom:"4px"}}><img src={msg.imageUrl} alt="" style={{maxWidth:"240px",maxHeight:"280px",borderRadius:"10px",display:"block",width:"100%",objectFit:"cover"}}/>{msg.text&&<div style={{color:T.text,fontSize:"14px",marginTop:"5px"}}>{msg.text}</div>}</div>}
                      {msg.type==="file"&&<a href={msg.fileData} download={msg.fileName} style={{display:"flex",alignItems:"center",gap:"10px",textDecoration:"none",background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 12px",marginBottom:"4px"}}><Ic n="file" s={26} c={T.accentBtn}/><div><div style={{color:T.text,fontSize:"13px",fontWeight:"600",wordBreak:"break-all"}}>{msg.fileName}</div><div style={{color:T.textSec,fontSize:"11px"}}>{fmtSize(msg.fileSize)}</div></div></a>}
                      {(msg.type==="text"||!msg.type)&&<div style={{color:T.text,fontSize:"14.5px",lineHeight:"1.55",wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</div>}
                      <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:"3px",marginTop:"3px"}}><span style={{color:T.textSec,fontSize:"10.5px"}}>{msg.time}</span>{isMe&&<Ic n="checks" s={13} c={T.accentBtn}/>}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>

            {/* Input */}
            {canSend?(
              <div style={{padding:"9px 12px",background:T.sidebar,borderTop:`1px solid ${T.border}`,flexShrink:0,position:"relative"}}>
                {showEmoji&&(
                  <div style={{position:"absolute",bottom:"62px",right:"12px",background:"#1a2a3a",borderRadius:"14px",padding:"12px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                    {EMOJIS.map(e=><button key={e} onClick={()=>{setInput(p=>p+e);inputRef.current?.focus();}} style={{background:"none",border:"none",fontSize:"21px",cursor:"pointer",padding:"4px",borderRadius:"7px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hover} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
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
                  <button onClick={e=>{e.stopPropagation();setShowEmoji(!showEmoji);setAttachMenu(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",fontSize:"20px",flexShrink:0}}>😊</button>
                  {!isSaved&&!isBot&&<button onClick={e=>{e.stopPropagation();setAttachMenu(!attachMenu);setShowEmoji(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="attach" s={20}/></button>}
                  <div style={{flex:1,background:T.inputBg,borderRadius:"22px",padding:"8px 14px"}}>
                    <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder={isSaved?"احفظ ملاحظاتك...":isChannel?"نشر في القناة...":"اكتب رسالة..."} rows={1}
                      style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14.5px",width:"100%",direction:"rtl",fontFamily:"inherit",resize:"none",lineHeight:"1.5",maxHeight:"90px",overflowY:"auto"}}/>
                  </div>
                  <button onClick={()=>input.trim()&&sendMessage()} style={{background:input.trim()?T.accentBtn:T.inputBg,border:"none",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",boxShadow:input.trim()?"0 4px 12px rgba(82,136,193,0.4)":"none"}}>
                    <Ic n={input.trim()?"send":"mic"} s={19} c={input.trim()?"#fff":T.textSec}/>
                  </button>
                </div>
                <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],true)} onClick={e=>e.target.value=""}/>
                <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],false)} onClick={e=>e.target.value=""}/>
              </div>
            ):(
              <div style={{padding:"13px",background:T.sidebar,borderTop:`1px solid ${T.border}`,textAlign:"center",color:T.textSec,fontSize:"13px"}}>📢 فقط صاحب القناة يمكنه النشر</div>
            )}

            {/* Info Panel */}
            {showInfo&&activeChatData&&(
              <div style={{position:isMobile?"absolute":"relative",right:0,top:0,bottom:0,width:"260px",background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0,zIndex:isMobile?50:1}}>
                <div style={{padding:"13px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>المعلومات</span>
                  <button onClick={()=>setShowInfo(false)} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={17}/></button>
                </div>
                <div style={{padding:"20px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",borderBottom:`1px solid ${T.border}`}}>
                  <Av name={activeChatData.name} color={activeChatData.color||rColor(activeChatData.name)} size={70} verified={activeChatData.verified} photo={activeChatData.photoURL}/>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:T.text,fontWeight:"700",fontSize:"16px",display:"flex",alignItems:"center",gap:"5px",justifyContent:"center"}}>{activeChatData.name}{activeChatData.verified&&<Ic n="check" s={14} c={T.verified}/>}</div>
                    {activeChatData.username&&<div style={{color:T.textSec,fontSize:"12px"}}>@{activeChatData.username}</div>}
                    {activeChatData.bio&&<div style={{color:T.textSec,fontSize:"12px",marginTop:"6px",lineHeight:"1.5"}}>{activeChatData.bio}</div>}
                    <div style={{color:T.textSec,fontSize:"12px",marginTop:"4px"}}>{isChannel?`📢 ${activeChatData.subscribers||0} مشترك`:isGroup?`👥 ${activeChatData.members?.length||0} عضو`:""}</div>
                  </div>
                </div>
                {isChannel&&isMine&&(
                  <div style={{padding:"12px 14px"}}>
                    <button onClick={()=>{setChannelSettings({...activeChatData});setModal("channelSettings");}} style={{width:"100%",padding:"10px",background:`${T.accentBtn}15`,border:`1px solid ${T.accentBtn}25`,borderRadius:"10px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",fontWeight:"600",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px"}}><Ic n="settings" s={15} c={T.accentBtn}/> إدارة القناة</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─ Context Menu ─ */}
      {ctxMenu&&(
        <div style={{position:"fixed",top:Math.min(ctxMenu.y,window.innerHeight-160),left:Math.min(ctxMenu.x,window.innerWidth-180),background:"#1c2d3d",borderRadius:"11px",padding:"5px 0",boxShadow:"0 8px 28px rgba(0,0,0,0.55)",zIndex:600,minWidth:"160px",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
          {[
            {l:"↩ ردّ",a:()=>{setReplyTo(ctxMenu.msg);setCtxMenu(null);}},
            {l:"⎘ نسخ",a:()=>{navigator.clipboard?.writeText(ctxMenu.msg?.text||"");setCtxMenu(null);}},
            {l:"🔖 حفظ",a:async()=>{const s=chats.find(c=>c.type==="saved");if(s){const id=uidGen();await set(ref(db,`messages/${s.chatId||s.id}/${id}`),{...ctxMenu.msg,id,chatId:s.chatId||s.id,createdAt:Date.now()+1});}setCtxMenu(null);}},
            ...(ctxMenu.msg?.from===user?.uid?[{l:"🗑 حذف",a:async()=>{if(activeChat)await remove(ref(db,`messages/${activeChat}/${ctxMenu.msg.id}`));setCtxMenu(null);},d:true}]:[]),
          ].map(item=>(
            <button key={item.l} onClick={item.a} style={{display:"block",width:"100%",padding:"10px 16px",background:"none",border:"none",color:item.d?T.danger:T.text,textAlign:"right",cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>{item.l}</button>
          ))}
        </div>
      )}

      {/* ─ FAB Menu ─ */}
      {modal==="fabMenu"&&(
        <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setModal(null)}>
          <div style={{position:"absolute",bottom:"80px",left:"20px",background:"#1c2d3d",borderRadius:"14px",padding:"8px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.border}`,minWidth:"200px"}} onClick={e=>e.stopPropagation()}>
            {[{ic:"user",l:"محادثة جديدة",a:()=>setModal("newChat")},{ic:"group",l:"مجموعة جديدة",a:()=>setModal("newGroup")},{ic:"channel",l:"قناة جديدة",a:()=>setModal("newChannel")}].map(item=>(
              <button key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <Ic n={item.ic} s={18} c={T.accentBtn}/>{item.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─ Modals ─ */}
      {modal==="newChat"&&(
        <Modal title="محادثة جديدة" onClose={()=>setModal(null)}>
          <div style={{color:T.textSec,fontSize:"13px",marginBottom:"12px"}}>ابحث عن مستخدم:</div>
          <input value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} placeholder="@username أو الاسم" autoFocus
            style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",marginBottom:"12px",boxSizing:"border-box"}}/>
          <div style={{maxHeight:"300px",overflowY:"auto"}}>
            {searchResults.filter(r=>r.resultType==="user"&&r.uid!==user?.uid).map(u2=>(
              <div key={u2.uid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",cursor:"pointer",borderRadius:"10px",marginBottom:"4px",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>openPrivateChat(u2)}>
                <Av name={u2.displayName} color={u2.color||rColor(u2.displayName)} size={38} verified={u2.verified} photo={u2.photoURL}/>
                <div><div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{u2.displayName}</div><div style={{color:T.textSec,fontSize:"12px"}}>@{u2.username}</div></div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal==="newGroup"&&(
        <Modal title="مجموعة جديدة" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <FInput label="اسم المجموعة" value={newForm.name} onChange={e=>setNewForm(p=>({...p,name:e.target.value}))} placeholder="اسم المجموعة..." autoFocus/>
            <FInput label="اسم المستخدم (5 أحرف على الأقل)" value={newForm.username} onChange={e=>setNewForm(p=>({...p,username:e.target.value}))} placeholder="group_name"/>
            <FInput label="النبذة (اختياري)" value={newForm.bio} onChange={e=>setNewForm(p=>({...p,bio:e.target.value}))} placeholder="وصف المجموعة..."/>
            <PBtn onClick={()=>createConvo("group")}>إنشاء المجموعة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="newChannel"&&(
        <Modal title="قناة جديدة" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <FInput label="اسم القناة" value={newForm.name} onChange={e=>setNewForm(p=>({...p,name:e.target.value}))} placeholder="اسم القناة..." autoFocus/>
            <FInput label="اسم المستخدم (5 أحرف على الأقل)" value={newForm.username} onChange={e=>setNewForm(p=>({...p,username:e.target.value}))} placeholder="channel_name"/>
            <FInput label="النبذة (اختياري)" value={newForm.bio} onChange={e=>setNewForm(p=>({...p,bio:e.target.value}))} placeholder="وصف القناة..."/>
            <PBtn onClick={()=>createConvo("channel")}>إنشاء القناة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="editProfile"&&(
        <Modal title="تعديل الملف الشخصي" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setEditProfile(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}};inp.click();}}>
              <Av name={editProfile.displayName||userData?.displayName} color={userData?.color||rColor(userData?.displayName||"")} size={72} photo={editProfile.photo}/>
              <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center"}}>📷</div>
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
              <FInput label="الاسم الشخصي" value={editProfile.displayName} onChange={e=>setEditProfile(p=>({...p,displayName:e.target.value}))} placeholder="اسمك..."/>
              <FInput label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" value={editProfile.username} onChange={e=>setEditProfile(p=>({...p,username:e.target.value}))} placeholder="username"/>
              <FInput label="النبذة الشخصية" value={editProfile.bio} onChange={e=>setEditProfile(p=>({...p,bio:e.target.value}))} placeholder="أخبرنا عن نفسك..."/>
            </div>
            <PBtn onClick={saveProfile}>💾 حفظ التغييرات</PBtn>
          </div>
        </Modal>
      )}

      {modal==="channelSettings"&&channelSettings&&(
        <Modal title="إعدادات القناة" onClose={()=>setModal(null)} width="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=async ev=>{await update(ref(db,`chats/${channelSettings.id}`),{photoURL:ev.target.result});setChannelSettings(p=>({...p,photoURL:ev.target.result}));};r.readAsDataURL(f);}};inp.click();}}>
                <Av name={channelSettings.name} color={rColor(channelSettings.name)} size={72} photo={channelSettings.photoURL}/>
                <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center"}}>📷</div>
              </div>
              <span style={{color:T.textSec,fontSize:"12px"}}>اضغط لتغيير صورة القناة</span>
            </div>
            <FInput label="اسم القناة" value={channelSettings.name} onChange={e=>setChannelSettings(p=>({...p,name:e.target.value}))} placeholder="اسم القناة..."/>
            <FInput label="اسم المستخدم (@)" value={channelSettings.username||""} onChange={e=>setChannelSettings(p=>({...p,username:e.target.value}))} placeholder="channel_username"/>
            <FInput label="النبذة" value={channelSettings.bio||""} onChange={e=>setChannelSettings(p=>({...p,bio:e.target.value}))} placeholder="وصف القناة..."/>
            <div style={{background:T.inputBg,borderRadius:"12px",padding:"14px",border:`1px solid ${T.border}`}}>
              <div style={{color:T.textSec,fontSize:"12px",fontWeight:"700",marginBottom:"12px"}}>صلاحيات القناة</div>
              {[{k:"canComment",l:"السماح بالتعليقات"},{k:"canReactions",l:"السماح بالتفاعلات"},{k:"isPrivate",l:"قناة خاصة (غير قابلة للبحث)"}].map(perm=>(
                <div key={perm.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <span style={{color:T.text,fontSize:"14px"}}>{perm.l}</span>
                  <Toggle checked={!!(channelSettings.permissions||{})[perm.k]} onChange={()=>setChannelSettings(p=>({...p,permissions:{...(p.permissions||{}),[perm.k]:!((p.permissions||{})[perm.k])}}))}/>
                </div>
              ))}
            </div>
            <PBtn onClick={updateChannelSettings}>💾 حفظ إعدادات القناة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="support"&&(
        <Modal title="الدعم الفني" onClose={()=>setModal(null)}>
          <SupportWidget user={user} userData={userData} db={db} onClose={()=>setModal(null)}/>
        </Modal>
      )}

      {modal==="twoFactor"&&(
        <Modal title="التحقق بخطوتين" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>{userData?.twoFactor?"🔒":"🔓"}</div>
            <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>التحقق بخطوتين {userData?.twoFactor?"مفعّل":"معطّل"}</div>
            <div style={{color:T.textSec,fontSize:"13px",lineHeight:"1.7"}}>عند التفعيل، يُرسل رمز تحقق لبوت DFGFD عند الدخول من جهاز جديد</div>
            <PBtn color={userData?.twoFactor?T.danger:T.gold} onClick={async()=>{
              const nv=!userData?.twoFactor;
              await update(ref(db,`users/${user.uid}`),{twoFactor:nv});
              const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUserData(s.val());
              const botId=`bot_${user.uid}`;const nid=uidGen();
              await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`🔐 تم ${nv?"تفعيل":"إلغاء"} التحقق بخطوتين\n🕐 ${nowFull()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isBot:true,createdAt:Date.now()});
              setModal(null);
            }}>{userData?.twoFactor?"🔓 إلغاء التفعيل":"🔒 تفعيل"}</PBtn>
          </div>
        </Modal>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.accent};border-radius:4px}
        @keyframes msgIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        textarea{scrollbar-width:none}textarea::-webkit-scrollbar{display:none}
        input::placeholder,textarea::placeholder{color:${T.textSec}}
        input,textarea,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}

function SupportWidget({user,userData,db,onClose}) {
  const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false); const [sent,setSent]=useState(false);
  const nowStr2=()=>new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
  const uid2=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
  const send=async()=>{
    if(!msg.trim()||!user)return;
    setLoading(true);
    const tId=`ticket_${user.uid}`;const msgId=uid2();
    await set(ref(db,`support/${tId}/info`),{userId:user.uid,username:userData?.username,displayName:userData?.displayName,status:"open",createdAt:Date.now()});
    await set(ref(db,`support/${tId}/messages/${msgId}`),{id:msgId,text:msg.trim(),from:user.uid,time:nowStr2(),createdAt:Date.now()});
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:"أنت مساعد دعم فني لتطبيق تيرمين. أجب باللغة العربية بشكل مفيد ومختصر.",messages:[{role:"user",content:msg.trim()}]})});
      const data=await res.json();
      const aiText=data.content?.[0]?.text||"شكراً لتواصلك! سيتم الرد قريباً.";
      const aiId=uid2();
      await set(ref(db,`support/${tId}/messages/${aiId}`),{id:aiId,text:aiText,from:"ai_bot",time:nowStr2(),createdAt:Date.now()+1});
    }catch{}
    setSent(true);setLoading(false);
  };
  if(sent)return<div style={{textAlign:"center",padding:"20px",display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}><div style={{fontSize:"48px"}}>✅</div><div style={{color:"#e8f4fd",fontWeight:"700",fontSize:"15px"}}>تم إرسال طلبك!</div><button onClick={onClose} style={{background:"#5288c1",border:"none",borderRadius:"10px",padding:"11px 24px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px"}}>حسناً</button></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="اكتب مشكلتك أو سؤالك..." rows={4} style={{background:"#1c2d3d",border:"1px solid #0d182244",borderRadius:"12px",padding:"12px 14px",color:"#e8f4fd",fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none"}} onFocus={e=>e.target.style.borderColor="#5288c1"} onBlur={e=>e.target.style.borderColor="#0d182244"}/>
      <PBtn onClick={send} loading={loading}>📨 إرسال للدعم الفني</PBtn>
    </div>
  );
}
