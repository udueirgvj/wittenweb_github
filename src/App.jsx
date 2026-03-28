
import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, get, onValue, off, update, remove } from "firebase/database";

const firebaseConfig = { apiKey:"AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc", authDomain:"tttrt-b8c5a.firebaseapp.com", databaseURL:"https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app", projectId:"tttrt-b8c5a", storageBucket:"tttrt-b8c5a.firebasestorage.app", messagingSenderId:"975123752593", appId:"1:975123752593:web:e591e930af3a3e29568130" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const OWNER = "tsaxp";
const BOT_ID = "bot_dfgfd_official";
const SUPPORT_ID = "support_official";
const APP_CH_ID = "channel_termeen_official";
const BF_ID = "bot_botfather_official";
const APP_CH_SUBS = 55000000;

const COLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722","#607D8B","#795548"];
const rc = s => COLORS[(s||"A").charCodeAt(0)%COLORS.length];
const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const ts = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const tf = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const fsz = b => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const fsubs = n => n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(1)+"K":String(n);

const T = {
  bg:"#17212b", sb:"#0e1621", panel:"#182533", acc:"#2b5278",
  btn:"#5288c1", text:"#e8f4fd", dim:"#6b8ca4", out:"#2b5278",
  inp:"#182533", brd:"#0d1822", hov:"#1c2d3d", on:"#4dd67a",
  unr:"#5288c1", err:"#e05c5c", gold:"#f0a040", vrf:"#5288c1",
  tab:"#1c2733", inp2:"#1c2d3d"
};

// search score
function sc(item, q) {
  const n=(item.displayName||item.name||"").toLowerCase();
  const u=(item.username||"").toLowerCase();
  if(u===q||n===q) return 100;
  if(u.startsWith(q)) return 90-u.length;
  if(n.startsWith(q)) return 80-n.length;
  if(u.includes(q)) return 60;
  if(n.includes(q)) return 50;
  return 0;
}

// Parse @mentions
function MText({text, onMention, style}) {
  if(!text) return null;
  const parts = text.split(/(@[a-zA-Z][a-zA-Z0-9_]{3,})/g);
  return <span style={style}>{parts.map((p,i) => /^@[a-zA-Z][a-zA-Z0-9_]{3,}$/.test(p) ? <span key={i} onClick={e=>{e.stopPropagation();onMention&&onMention(p.slice(1));}} style={{color:"#6ab3f3",cursor:"pointer",fontWeight:"600"}}>{p}</span> : <span key={i}>{p}</span>)}</span>;
}

// Icons (minimal set, inline SVG)
const ic = {
  send: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke={c} strokeWidth="2"/><path d="M5 10C5 14.418 8.134 18 12 18C15.866 18 19 14.418 19 10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  attach: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05L12.25 20.24C10.5 21.99 7.75 21.99 6 20.24C4.25 18.49 4.25 15.74 6 13.99L14.5 5.49C15.67 4.32 17.58 4.32 18.75 5.49C19.92 6.66 19.92 8.57 18.75 9.74L10.24 18.24C9.66 18.82 8.72 18.82 8.13 18.24C7.55 17.66 7.55 16.72 8.13 16.13L15.92 8.34" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  srch: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2"/><path d="M21 21L16.65 16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  menu: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  back: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={c}/><circle cx="12" cy="12" r="1.5" fill={c}/><circle cx="12" cy="19" r="1.5" fill={c}/></svg>,
  close: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  chk: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chk2: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="18 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 6 13 17" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  file: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2"/></svg>,
  img: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={c}/><path d="M21 15L16 10L5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  set: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/></svg>,
  sv: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ch: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L8 8H3l4.5 4.5-2 7L12 16l6.5 3.5-2-7L21 8h-5L12 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gr: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  usr: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="2"/></svg>,
  bot: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="3" stroke={c} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="16" r="1.5" fill={c}/><circle cx="16" cy="16" r="1.5" fill={c}/></svg>,
  pls: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  pin: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 17v5M8 17h8M9 3h6l2 5-4 3v3H9V11L5 8l4-5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lk: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fl: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="22" x2="4" y2="15" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  dev: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke={c} strokeWidth="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  ntf: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ct: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  ed: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  tr: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  lk2: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/></svg>,
  eyeoff: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  pv: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sup: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  cr: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const Ic = ({n,s=20,c=T.dim}) => ic[n]?ic[n](c,s):null;

// Avatar
function Av({name,photo,size=46,online,verified,fraud,onClick}) {
  const bg = photo ? "transparent" : rc(name||"?");
  return (
    <div style={{position:"relative",flexShrink:0,cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:"800",color:"#fff",overflow:"hidden",border:fraud?`2px solid ${T.err}`:"none"}}>
        {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
      </div>
      {online&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.26,height:size*0.26,borderRadius:"50%",background:T.on,border:`2px solid ${T.sb}`}}/>}
      {verified&&<div style={{position:"absolute",bottom:-2,left:-2,background:T.vrf,borderRadius:"50%",width:size*0.32,height:size*0.32,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.sb}`}}><Ic n="chk" s={size*0.18} c="#fff"/></div>}
    </div>
  );
}

const Tog = ({on,go}) => (
  <button onClick={go} style={{width:"44px",height:"24px",borderRadius:"12px",background:on?T.btn:"#3a4a5a",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",transition:"right 0.2s",right:on?"3px":"23px"}}/>
  </button>
);

const Inp = ({label,val,set,ph,type="text",af,onKey}) => {
  const [sh,setSh]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
      {label&&<label style={{color:T.dim,fontSize:"12px",fontWeight:"600"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type==="password"&&sh?"text":type} autoFocus={af} onKeyDown={onKey}
          style={{background:T.inp2,border:`1px solid ${T.brd}44`,borderRadius:"12px",padding:`11px ${type==="password"?"40px":"14px"} 11px 14px`,color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}
          onFocus={e=>e.target.style.borderColor=T.btn} onBlur={e=>e.target.style.borderColor=`${T.brd}44`}/>
        {type==="password"&&<button onClick={()=>setSh(!sh)} style={{position:"absolute",left:"12px",background:"none",border:"none",cursor:"pointer"}}><Ic n={sh?"eyeoff":"eye"} s={16}/></button>}
      </div>
    </div>
  );
};

const Btn = ({kids,go,loading,color=T.btn,dis,st={}}) => (
  <button onClick={go} disabled={loading||dis} style={{background:color,border:"none",borderRadius:"12px",padding:"13px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:(loading||dis)?"not-allowed":"pointer",fontFamily:"inherit",width:"100%",opacity:(loading||dis)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",...st}}>
    {loading?<span style={{animation:"spin .8s linear infinite",display:"inline-block",fontSize:"18px"}}>⟳</span>:kids}
  </button>
);

// Modal
const Mdl = ({title,children,onClose,w="440px"}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}} onClick={onClose}>
    <div style={{background:"#1a2a3a",borderRadius:"18px",padding:"24px",width:w,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.7)",border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <h3 style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

// Profile sheet (Telegram style)
function ProfileSheet({p,onClose,onChat,me,chats}) {
  if(!p) return null;
  const isUser=!!p.uid;
  const mutual=isUser?chats.filter(c=>c.type==="group"&&Array.isArray(c.members)&&c.members.includes(p.uid)&&c.members.includes(me?.uid)):[];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.sb,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"relative",height:"220px",background:p.photoURL?"transparent":(p.color||rc(p.name||p.displayName||"?")),overflow:"hidden",flexShrink:0}}>
          {p.photoURL&&<img src={p.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
          {!p.photoURL&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"80px",fontWeight:"900",color:"rgba(255,255,255,0.7)"}}>{(p.name||p.displayName||"?").charAt(0).toUpperCase()}</div>}
          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.75))",padding:"20px 16px 12px"}}>
            <div style={{color:"#fff",fontSize:"20px",fontWeight:"800",display:"flex",alignItems:"center",gap:"7px"}}>
              {p.name||p.displayName}
              {(p.verified||p.isOfficial)&&<span style={{background:T.vrf,borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ic n="chk" s={12} c="#fff"/></span>}
              {p.isFraud&&<span style={{background:T.err,color:"#fff",fontSize:"10px",padding:"2px 6px",borderRadius:"5px"}}>احتيال</span>}
            </div>
            {p.username&&<div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px"}}>@{p.username}</div>}
          </div>
          <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",background:"rgba(0,0,0,0.4)",border:"none",borderRadius:"50%",width:"32px",height:"32px",color:"#fff",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:"10px"}}>
          {(p.bio)&&<div style={{background:T.panel,borderRadius:"12px",padding:"12px"}}><div style={{color:T.dim,fontSize:"11px",marginBottom:"4px"}}>النبذة</div><div style={{color:T.text,fontSize:"14px",lineHeight:"1.5"}}>{p.bio}</div></div>}
          {p.username&&<div style={{background:T.panel,borderRadius:"12px",padding:"12px"}}><div style={{color:T.dim,fontSize:"11px",marginBottom:"4px"}}>اسم المستخدم</div><div style={{color:T.btn,fontSize:"14px",fontWeight:"600"}}>@{p.username}</div></div>}
          {isUser&&p.type!=="channel"&&p.type!=="group"&&<div style={{background:T.panel,borderRadius:"12px",padding:"12px"}}><div style={{color:T.dim,fontSize:"11px",marginBottom:"4px"}}>آخر ظهور</div><div style={{color:T.text,fontSize:"13px"}}>{p.lastSeen?new Date(p.lastSeen).toLocaleDateString("ar-SA"):"—"}</div></div>}
          {p.type==="channel"&&<div style={{background:T.panel,borderRadius:"12px",padding:"12px"}}><div style={{color:T.dim,fontSize:"11px",marginBottom:"4px"}}>المشتركون</div><div style={{color:T.text,fontSize:"14px",fontWeight:"700"}}>{fsubs(p.subscribers||0)}</div></div>}
          {mutual.length>0&&<div style={{background:T.panel,borderRadius:"12px",padding:"12px"}}><div style={{color:T.dim,fontSize:"11px",marginBottom:"8px"}}>مجموعات مشتركة ({mutual.length})</div>{mutual.slice(0,3).map(g=><div key={g.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 0"}}><Av name={g.name} size={30}/><div style={{color:T.text,fontSize:"13px"}}>{g.name}</div></div>)}</div>}
          {isUser&&p.uid!==me?.uid&&onChat&&(
            <button onClick={()=>{onChat(p);onClose();}} style={{padding:"13px",background:T.btn,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:"pointer",fontFamily:"inherit",marginTop:"4px"}}>💬 إرسال رسالة</button>
          )}
          {(p.type==="channel"||p.type==="group")&&onChat&&(
            <button onClick={()=>{onChat(p);onClose();}} style={{padding:"13px",background:T.btn,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:"pointer",fontFamily:"inherit",marginTop:"4px"}}>👁 فتح {p.type==="channel"?"القناة":"المجموعة"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Report sheet
function ReportSheet({onClose,onReport}) {
  const [sel,setSel]=useState("");
  const [note,setNote]=useState("");
  const reasons=["محتوى جنسي أو للبالغين","نشاطات إرهابية أو عنف","احتيال أو نصب","رسائل مزعجة","محتوى مسيء أو تحرش","انتهاك حقوق الملكية","محتوى مضلل","شيء آخر"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1a2a3a",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",padding:"20px",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <span style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>🚩 إرسال بلاغ</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"14px"}}>
          {reasons.map(r=>(
            <button key={r} onClick={()=>setSel(r)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",borderRadius:"11px",border:`1px solid ${sel===r?T.btn:T.brd}30`,background:sel===r?`${T.btn}15`:"transparent",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",textAlign:"right"}}>
              <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`2px solid ${sel===r?T.btn:T.dim}`,background:sel===r?T.btn:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{sel===r&&<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#fff"}}/>}</div>
              {r}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="تفاصيل إضافية..." rows={3}
          style={{width:"100%",background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
        <button onClick={()=>{if(sel){onReport(sel,note);}}} disabled={!sel} style={{width:"100%",padding:"13px",background:sel?T.err:`${T.err}40`,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:sel?"pointer":"not-allowed",fontFamily:"inherit"}}>🚩 إرسال البلاغ</button>
      </div>
    </div>
  );
}

// Sessions panel
function SessionsPanel({user}) {
  const [sess,setSess]=useState([]);
  useEffect(()=>{
    if(!user) return;
    const r=ref(db,`sessions/${user.uid}`);
    onValue(r,snap=>{if(snap.exists())setSess(Object.values(snap.val()));else setSess([]);});
    return()=>off(r);
  },[user]);

  const remove2=async sid=>{
    if(!window.confirm("إزالة هذه الجلسة؟")) return;
    await remove(ref(db,`sessions/${user.uid}/${sid}`));
  };

  return (
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
      <div style={{color:T.dim,fontSize:"12px"}}>الجلسات النشطة ({sess.length})</div>
      {sess.map(s=>(
        <div key={s.id} style={{background:T.panel,borderRadius:"14px",padding:"14px",border:`1px solid ${s.current?T.btn:T.brd}30`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}><Ic n="dev" s={15} c={s.current?T.btn:T.dim}/>{s.device}{s.current&&<span style={{background:`${T.on}20`,color:T.on,fontSize:"10px",padding:"1px 6px",borderRadius:"5px",fontWeight:"700"}}>حالي</span>}</div>
              <div style={{color:T.dim,fontSize:"12px",marginTop:"3px"}}>{s.browser||"متصفح"} · {s.loginTime?new Date(s.loginTime).toLocaleDateString("ar-SA"):""}</div>
            </div>
            {!s.current&&<button onClick={()=>remove2(s.id)} style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"8px",padding:"6px 12px",color:T.err,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>إزالة</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings
function SettingsPanel({user,ud,setUd,isOwner,openSup,setModal}) {
  const [sub,setSub]=useState(null);
  const [notifs,setNotifs]=useState({pm:true,gr:true,ch:false,snd:true});
  const [priv,setPriv]=useState({phone:"nobody",photo:"everyone"});
  const pRef=useRef(null);

  const uploadPic=file=>{
    if(!file||!user) return;
    const r=new FileReader();
    r.onload=async e=>{await update(ref(db,`users/${user.uid}`),{photoURL:e.target.result});const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUd(s.val());};
    r.readAsDataURL(file);
  };

  if(sub==="sessions") return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px",borderBottom:`1px solid ${T.brd}`,flexShrink:0}}>
        <button onClick={()=>setSub(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="back" s={20}/></button>
        <span style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>الجلسات النشطة</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}}><SessionsPanel user={user}/></div>
    </div>
  );

  const SECS=[
    {t:"الحساب",items:[
      {ic:"usr",l:"تعديل الملف الشخصي",a:()=>setModal("editProfile")},
      {ic:"dev",l:"الجلسات النشطة",d:"عرض وإدارة الجلسات",a:()=>setSub("sessions")},
      {ic:"lk2",l:"التحقق بخطوتين",d:ud?.twoFactor?"مفعّل ✅":"معطّل",a:()=>setModal("twoFactor")},
    ]},
    {t:"الإشعارات",custom:()=>(
      <div style={{background:T.sb}}>
        {[{k:"pm",l:"الرسائل الخاصة"},{k:"gr",l:"المجموعات"},{k:"ch",l:"القنوات"},{k:"snd",l:"الأصوات"}].map(it=>(
          <div key={it.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.brd}15`}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}><div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="ntf" s={18} c={T.btn}/></div><span style={{color:T.text,fontSize:"14.5px"}}>{it.l}</span></div>
            <Tog on={notifs[it.k]} go={()=>setNotifs(p=>({...p,[it.k]:!p[it.k]}))}/>
          </div>
        ))}
      </div>
    )},
    {t:"الخصوصية والأمان",items:[
      {ic:"pv",l:"رقم الهاتف",d:priv.phone==="nobody"?"لا أحد":"جهات الاتصال",a:()=>setPriv(p=>({...p,phone:p.phone==="nobody"?"contacts":"nobody"}))},
      {ic:"pv",l:"الصورة الشخصية",d:priv.photo==="everyone"?"الجميع":"جهات الاتصال",a:()=>setPriv(p=>({...p,photo:p.photo==="everyone"?"contacts":"everyone"}))},
    ]},
    {t:"الدعم",items:[{ic:"sup",l:"الدعم الفني",a:openSup}]},
    ...(isOwner?[{t:"الإدارة",items:[{ic:"cr",l:"لوحة تحكم المالك",a:()=>window.open("/admin","_blank")}]}]:[]),
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"}}>
      <input ref={pRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPic(e.target.files[0])} onClick={e=>e.target.value=""}/>
      <div style={{background:`linear-gradient(160deg,${T.acc},#12243a)`,padding:"24px 16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",flexShrink:0}}>
        <div style={{position:"relative",cursor:"pointer"}} onClick={()=>pRef.current?.click()}>
          <Av name={ud?.displayName||""} photo={ud?.photoURL} size={80} verified={ud?.verified}/>
          <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.acc}`,fontSize:"13px"}}>📷</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#fff",fontSize:"19px",fontWeight:"800",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>{ud?.displayName}{ud?.verified&&<Ic n="chk" s={15} c="#fff"/>}{isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}</div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px"}}>@{ud?.username}</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"12px",marginTop:"3px"}}>{ud?.bio||"لا توجد نبذة"}</div>
        </div>
      </div>
      {SECS.map(g=>(
        <div key={g.t} style={{marginBottom:"6px"}}>
          <div style={{color:T.dim,fontSize:"12px",fontWeight:"700",padding:"12px 16px 5px"}}>{g.t}</div>
          {g.custom?g.custom():g.items.map(it=>(
            <div key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:T.sb,cursor:it.a?"pointer":"default",borderBottom:`1px solid ${T.brd}15`}}
              onMouseEnter={e=>{if(it.a)e.currentTarget.style.background=T.hov;}} onMouseLeave={e=>e.currentTarget.style.background=T.sb}>
              <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic n={it.ic} s={18} c={T.btn}/></div>
              <div style={{flex:1}}><div style={{color:T.text,fontSize:"14.5px"}}>{it.l}</div>{it.d&&<div style={{color:T.dim,fontSize:"12px"}}>{it.d}</div>}</div>
              {it.a&&<Ic n="back" s={14} c={T.dim}/>}
            </div>
          ))}
        </div>
      ))}
      <div style={{padding:"16px",textAlign:"center"}}>
        <button onClick={()=>signOut(auth)} style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"12px",padding:"13px",color:T.err,cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px",width:"100%"}}>🚪 تسجيل الخروج</button>
        <div style={{color:T.dim,fontSize:"11px",marginTop:"12px"}}>✈️ تيرمين v4.3</div>
      </div>
    </div>
  );
}

// Auth Screen
function AuthScreen() {
  const [mode,setMode]=useState("login");
  const [dn,setDn]=useState(""); const [un,setUn]=useState(""); const [em,setEm]=useState(""); const [pw,setPw]=useState("");
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");

  const validate=()=>{
    if(mode==="register"){
      if(!dn.trim()){setErr("أدخل اسمك");return false;}
      if(un.trim().length<5){setErr("اسم المستخدم 5 أحرف على الأقل");return false;}
      if(/^\d/.test(un)){setErr("اسم المستخدم لا يبدأ برقم");return false;}
      if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(un)){setErr("اسم مستخدم صالح: حروف وأرقام، يبدأ بحرف");return false;}
      if(pw.length<6){setErr("كلمة المرور 6 أحرف على الأقل");return false;}
    }
    if(!em.trim()||!pw){setErr("أدخل البريد وكلمة المرور");return false;}
    return true;
  };

  const reg=async()=>{
    if(!validate()) return;
    setLoading(true);setErr("");
    try {
      const chk=await get(ref(db,`usernames/${un.toLowerCase()}`));
      if(chk.exists()){setErr(`اسم المستخدم @${un} مأخوذ مسبقاً`);setLoading(false);return;}
      const cr=await createUserWithEmailAndPassword(auth,em,pw);
      await updateProfile(cr.user,{displayName:dn});
      const id=cr.user.uid;
      const ud={uid:id,displayName:dn,username:un.toLowerCase(),email:em,bio:"",photoURL:"",verified:false,isBanned:false,isFraud:false,isRestricted:false,twoFactor:false,twoFactorPass:"",createdAt:Date.now(),lastSeen:Date.now(),color:rc(dn)};
      await set(ref(db,`users/${id}`),ud);
      await set(ref(db,`usernames/${un.toLowerCase()}`),id);
      // Create session
      const sid=uid();
      await set(ref(db,`sessions/${id}/${sid}`),{id:sid,device:"متصفح الويب",browser:"Chrome",loginTime:Date.now(),current:true});
      // Saved chat
      const sv=`saved_${id}`;
      await set(ref(db,`chats/${sv}`),{id:sv,type:"saved",name:"الرسائل المحفوظة",members:[id],createdAt:Date.now()});
      await set(ref(db,`userChats/${id}/${sv}`),{chatId:sv,lastMessage:"",lastTime:"",unread:0,order:Date.now()-3,type:"saved",name:"الرسائل المحفوظة",color:"#5288c1"});
      // DFGFD bot
      const bc=`bot_${id}`;
      await set(ref(db,`chats/${bc}`),{id:bc,type:"official_bot",name:"DFGFD",username:"dfgfd",isOfficial:true,verified:true,members:[id,BOT_ID],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`userChats/${id}/${bc}`),{chatId:bc,lastMessage:"مرحباً بك ✈️",lastTime:ts(),unread:1,order:Date.now()-2,type:"official_bot",name:"DFGFD",verified:true,color:"#5288c1"});
      const wm=uid();
      await set(ref(db,`messages/${bc}/${wm}`),{id:wm,chatId:bc,text:`✈️ مرحباً ${dn}!\n\nأنا DFGFD، المساعد الرسمي لتيرمين.\n🆔 معرّفك: @${un.toLowerCase()}\n\nجميع بياناتك آمنة ومشفّرة 🔒`,from:BOT_ID,senderName:"DFGFD",time:ts(),type:"text",isOfficialBot:true,createdAt:Date.now()});
      // Support chat
      const sc2=`support_${id}`;
      await set(ref(db,`chats/${sc2}`),{id:sc2,type:"support",name:"الدعم الفني",isOfficial:true,members:[id,SUPPORT_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${id}/${sc2}`),{chatId:sc2,lastMessage:"",lastTime:"",unread:0,order:Date.now()-1,type:"support",name:"الدعم الفني",color:"#4CAF50"});
    } catch(e){
      const m={"auth/email-already-in-use":"البريد مستخدم","auth/invalid-email":"بريد غير صالح","auth/weak-password":"كلمة مرور ضعيفة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  const login=async()=>{
    if(!validate()) return;
    setLoading(true);setErr("");
    try {
      const cr=await signInWithEmailAndPassword(auth,em,pw);
      const id=cr.user.uid;
      await update(ref(db,`users/${id}`),{lastSeen:Date.now()});
      const sid=uid();
      await set(ref(db,`sessions/${id}/${sid}`),{id:sid,device:"متصفح الويب",browser:"Chrome",loginTime:Date.now(),current:true});
      const nm=uid();
      await set(ref(db,`messages/bot_${id}/${nm}`),{id:nm,chatId:`bot_${id}`,text:`🔔 تسجيل دخول جديد\n📱 جهاز: متصفح الويب\n🕐 ${tf()}\n\nإذا لم تكن أنت، غيّر كلمة مرورك فوراً!`,from:BOT_ID,senderName:"DFGFD",time:ts(),type:"text",isOfficialBot:true,createdAt:Date.now()});
    } catch(e){
      const m={"auth/invalid-credential":"بيانات غير صحيحة","auth/user-not-found":"الحساب غير موجود","auth/wrong-password":"كلمة مرور خاطئة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"64px",marginBottom:"12px"}}>✈️</div>
          <div style={{color:T.text,fontSize:"28px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
          <div style={{color:T.dim,fontSize:"13px",marginTop:"6px"}}>تواصل أسرع · أسهل · أكثر أماناً</div>
        </div>
        <div style={{display:"flex",background:T.panel,borderRadius:"14px",padding:"4px",marginBottom:"22px",gap:"4px"}}>
          {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{flex:1,padding:"10px",borderRadius:"11px",border:"none",background:mode===k?T.btn:"transparent",color:mode===k?"#fff":T.dim,fontWeight:"700",fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <div style={{background:T.sb,borderRadius:"18px",padding:"24px",border:`1px solid ${T.brd}`,display:"flex",flexDirection:"column",gap:"13px"}}>
          {mode==="register"&&<Inp label="الاسم الشخصي" val={dn} set={setDn} ph="اسمك الكامل" af/>}
          {mode==="register"&&<Inp label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" val={un} set={setUn} ph="myusername"/>}
          <Inp label="البريد الإلكتروني" val={em} set={setEm} ph="example@email.com" type="email" af={mode==="login"}/>
          <Inp label="كلمة المرور" val={pw} set={setPw} ph="••••••••" type="password" onKey={e=>e.key==="Enter"&&(mode==="login"?login():reg())}/>
          {err&&<div style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"10px",padding:"10px",color:T.err,fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
          <Btn kids={mode==="login"?"🔐 تسجيل الدخول":"✨ إنشاء حساب"} go={mode==="login"?login:reg} loading={loading}/>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} input::placeholder{color:${T.dim}}`}</style>
    </div>
  );
}

// MAIN APP
export default function App() {
  const [user,setUser]=useState(null);
  const [ud,setUd]=useState(null);
  const [authLoad,setAuthLoad]=useState(true);
  const [chats,setChats]=useState([]);
  const [actChat,setActChat]=useState(null);
  const [actData,setActData]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [inp,setInp]=useState("");
  const [q,setQ]=useState("");
  const [qRes,setQRes]=useState([]);
  const [qMode,setQMode]=useState(false);
  const [cache,setCache]=useState({users:[],chats:[]});
  const [showMenu,setShowMenu]=useState(false);
  const [showSB,setShowSB]=useState(true);
  const [showEmoji,setShowEmoji]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [attMenu,setAttMenu]=useState(false);
  const [reply,setReply]=useState(null);
  const [editing,setEditing]=useState(null);
  const [ctx,setCtx]=useState(null);
  const [modal,setModal]=useState(null);
  const [tab,setTab]=useState("chats");
  const [mobile,setMobile]=useState(window.innerWidth<900);
  const [nf,setNf]=useState({name:"",username:"",bio:""});
  const [ep,setEp]=useState({dn:"",un:"",bio:"",photo:""});
  const [isOwner,setIsOwner]=useState(false);
  const [chSet,setChSet]=useState(null);
  const [pinned,setPinned]=useState(null);
  const [prof,setProf]=useState(null);
  const [repTarget,setRepTarget]=useState(null);
  const [reactions,setReactions]=useState({});
  const [twoFAPass,setTwoFAPass]=useState("");

  const endRef=useRef(null);
  const inpRef=useRef(null);
  const fRef=useRef(null);
  const iRef=useRef(null);
  // Use ref for message listener to avoid stale closures
  const msgRef=useRef(null);
  const rxRef=useRef(null);

  // Init app channel
  useEffect(()=>{
    get(ref(db,`chats/${APP_CH_ID}`)).then(s=>{
      if(!s.exists()){
        set(ref(db,`chats/${APP_CH_ID}`),{id:APP_CH_ID,type:"channel",name:"تيرمين الرسمية",username:"termeen",bio:"القناة الرسمية ✈️",verified:true,isOfficial:true,ownerId:"system",subscribers:APP_CH_SUBS,subscribersList:[],members:["system"],createdAt:Date.now(),photoURL:""});
        set(ref(db,"chatUsernames/termeen"),APP_CH_ID);
      }
    });
  },[]);

  // Auth
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async u=>{
      if(u){
        setUser(u);
        const s=await get(ref(db,`users/${u.uid}`));
        if(s.exists()){
          const d=s.val();
          if(d.isBanned){await signOut(auth);setUser(null);setUd(null);setAuthLoad(false);alert("تم حظر حسابك");return;}
          setUd(d);
          setEp({dn:d.displayName||"",un:d.username||"",bio:d.bio||"",photo:d.photoURL||""});
          setIsOwner(d.username===OWNER);
        }
      } else {setUser(null);setUd(null);setIsOwner(false);}
      setAuthLoad(false);
    });
    const r=()=>setMobile(window.innerWidth<900);
    window.addEventListener("resize",r);
    return()=>{unsub();window.removeEventListener("resize",r);};
  },[]);

  // Load chats (stable listener)
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
        try {
          const cs=await get(ref(db,`chats/${cid}`));
          if(!cs.exists()) return null;
          return {...cs.val(),...uc,id:cid};
        } catch { return null; }
      }));
      setChats(list.filter(Boolean).sort((a,b)=>(b.order||0)-(a.order||0)));
    });
    return()=>off(r);
  },[user]);

  // Load messages (use ref pattern to prevent duplicate listeners)
  useEffect(()=>{
    // Clean up previous listeners
    if(msgRef.current){off(msgRef.current);msgRef.current=null;}
    if(rxRef.current){off(rxRef.current);rxRef.current=null;}
    setMsgs([]);setPinned(null);setReactions({});
    if(!actChat) return;
    // Messages listener
    const mr=ref(db,`messages/${actChat}`);
    msgRef.current=mr;
    onValue(mr,snap=>{
      if(!snap.exists()){setMsgs([]);setPinned(null);return;}
      const list=Object.values(snap.val()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
      setMsgs(list);
      setPinned(list.find(m=>m.pinned)||null);
    });
    // Reactions listener
    const rr=ref(db,`reactions/${actChat}`);
    rxRef.current=rr;
    onValue(rr,snap=>setReactions(snap.exists()?snap.val():{}));
    return()=>{
      if(msgRef.current){off(msgRef.current);msgRef.current=null;}
      if(rxRef.current){off(rxRef.current);rxRef.current=null;}
    };
  },[actChat]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // Preload cache for instant search
  useEffect(()=>{
    if(!user) return;
    const load=async()=>{
      const [u,c]=await Promise.all([get(ref(db,"users")),get(ref(db,"chats"))]);
      setCache({users:u.exists()?Object.values(u.val()):[],chats:c.exists()?Object.values(c.val()):[]});
    };
    load();
    const t=setInterval(load,60000);
    return()=>clearInterval(t);
  },[user]);

  // Instant search from cache
  useEffect(()=>{
    if(!q.trim()||!qMode){setQRes([]);return;}
    const qv=q.toLowerCase().replace("@","").trim();
    const res=[];
    cache.users.forEach(u=>{if(u.uid!==user?.uid){const s=sc(u,qv);if(s>0)res.push({...u,rt:"user",_s:s});}});
    cache.chats.forEach(c=>{if(!["channel","group","official_bot"].includes(c.type))return;const s=sc(c,qv);if(s>0)res.push({...c,rt:c.type,_s:s});});
    res.sort((a,b)=>b._s-a._s);
    setQRes(res.slice(0,25));
  },[q,qMode,cache,user]);

  const openChat=useCallback(async(cid,dataOverride=null)=>{
    setActChat(cid);
    setShowInfo(false);setReply(null);setEditing(null);setShowMenu(false);setAttMenu(false);
    setQMode(false);setQ("");setModal(null);setCtx(null);
    if(mobile) setShowSB(false);
    try {
      const s=await get(ref(db,`chats/${cid}`));
      setActData(s.exists()?s.val():dataOverride);
    } catch { setActData(dataOverride); }
    if(user) await update(ref(db,`userChats/${user.uid}/${cid}`),{unread:0}).catch(()=>{});
    setTab("chats");
    setTimeout(()=>inpRef.current?.focus(),80);
  },[mobile,user]);

  const openSup=useCallback(async()=>{
    if(!user) return;
    const sid=`support_${user.uid}`;
    const s=await get(ref(db,`chats/${sid}`));
    if(!s.exists()){
      const cd={id:sid,type:"support",name:"الدعم الفني",isOfficial:true,members:[user.uid,SUPPORT_ID],createdAt:Date.now()};
      await set(ref(db,`chats/${sid}`),cd);
      await set(ref(db,`userChats/${user.uid}/${sid}`),{chatId:sid,lastMessage:"",lastTime:"",unread:0,order:Date.now(),type:"support",name:"الدعم الفني",color:"#4CAF50"});
    }
    openChat(sid,{id:sid,type:"support",name:"الدعم الفني"});
  },[user,openChat]);

  const sendMsg=useCallback(async(ot=null,type="text",extra={})=>{
    const text=editing?inp.trim():(ot??inp.trim());
    if(!text&&!extra.imageUrl&&!extra.fileName) return;
    if(!actChat||!user||!ud) return;
    if(actData?.type==="channel"&&actData?.ownerId!==user.uid) return;
    if(editing){
      await update(ref(db,`messages/${actChat}/${editing.id}`),{text,edited:true});
      setEditing(null);setInp("");inpRef.current?.focus();return;
    }
    const mid=uid();
    const msg={id:mid,chatId:actChat,text:text||"",from:user.uid,senderName:ud.displayName,senderUsername:ud.username,senderPhoto:ud.photoURL||"",senderColor:ud.color||rc(ud.displayName),time:ts(),type,createdAt:Date.now(),
      replyTo:reply?{text:reply.text,sender:reply.senderName||"أنا",msgId:reply.id}:null,...extra};
    await set(ref(db,`messages/${actChat}/${mid}`),msg);
    const prev=type==="image"?"📷 صورة":type==="file"?`📎 ${msg.fileName}`:text;
    await update(ref(db,`userChats/${user.uid}/${actChat}`),{lastMessage:prev,lastTime:ts(),order:Date.now()});
    if(actData?.members){
      for(const mid2 of actData.members){
        if(mid2!==user.uid&&!mid2.startsWith("bot_")&&mid2!==SUPPORT_ID&&mid2!==BOT_ID){
          const mc=await get(ref(db,`userChats/${mid2}/${actChat}`)).catch(()=>null);
          const uc=mc?.exists()?mc.val().unread||0:0;
          await update(ref(db,`userChats/${mid2}/${actChat}`),{lastMessage:prev,lastTime:ts(),unread:uc+1,order:Date.now()}).catch(()=>{});
        }
      }
    }
    // AI for support
    if(actData?.type==="support"){
      setTimeout(async()=>{
        try {
          const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"أنت مساعد دعم فني لتطبيق تيرمين. أجب باللغة العربية. في نهاية ردك اكتب: 'اضغط زر التحويل للدعم البشري إذا أردت.'",messages:[{role:"user",content:text}]})});
          const d=await res.json();
          const rt=d.content?.[0]?.text||"شكراً! سيتم الرد قريباً.";
          const aid=uid();
          await set(ref(db,`messages/${actChat}/${aid}`),{id:aid,chatId:actChat,text:rt,from:SUPPORT_ID,senderName:"الدعم الفني",time:ts(),type:"text",isSupport:true,createdAt:Date.now()+500});
          await update(ref(db,`userChats/${user.uid}/${actChat}`),{lastMessage:rt.slice(0,50),lastTime:ts(),order:Date.now()+1});
          const tid=`ticket_${user.uid}`;
          await set(ref(db,`support/${tid}/info`),{userId:user.uid,username:ud.username,displayName:ud.displayName,status:"open",createdAt:Date.now()});
          await set(ref(db,`support/${tid}/messages/${uid()}`),{text,from:user.uid,time:ts(),createdAt:Date.now()});
          await set(ref(db,`support/${tid}/messages/${uid()}`),{text:rt,from:"ai_bot",time:ts(),createdAt:Date.now()+500});
        }catch{}
      },1200);
    }
    // BotFather
    if(actData?.type==="official_bot"&&actData?.username==="botfather") bfMsg(text,actChat);
    setInp("");setReply(null);setShowEmoji(false);
    inpRef.current?.focus();
  },[inp,actChat,user,ud,reply,actData,editing]);

  const bfMsg=useCallback(async(text,cid)=>{
    const t=text.trim().toLowerCase();
    let rep="";
    if(t==="/start"||t==="مرحبا"){rep="مرحباً! أنا BotFather ✈️\n\n/newbot — إنشاء بوت جديد\n/mybots — بوتاتك";}
    else if(t.endsWith("bot")||t.endsWith("_bot")){
      const bu=t.replace("@","").toLowerCase();
      if(bu.length<5){rep="الاسم قصير جداً! 5 أحرف على الأقل.";}
      else {
        const tk=`${Date.now()}:AAF${Math.random().toString(36).slice(2,20).toUpperCase()}`;
        const bid=uid();
        await set(ref(db,`bots/${bid}`),{id:bid,username:bu,name:bu,token:tk,creatorId:user?.uid,createdAt:Date.now()});
        if(user?.uid) await set(ref(db,`userBots/${user.uid}/${bid}`),{id:bid,username:bu,token:tk,createdAt:Date.now()});
        rep=`✅ تم إنشاء البوت!\n\n🤖 @${bu}\n🔑 التوكن:\n${tk}\n\n⚠️ احتفظ بالتوكن في مكان آمن!`;
      }
    }
    else if(t==="/mybots"){
      if(user?.uid){const s=await get(ref(db,`userBots/${user.uid}`));if(s.exists()){const bs=Object.values(s.val());rep=`🤖 بوتاتك (${bs.length}):\n\n${bs.map(b=>`• @${b.username}\n  ${b.token?.slice(0,20)}...`).join("\n\n")}`;}else rep="لا توجد بوتات. اكتب /newbot";}
    }
    else rep="أرسل /start للبدء\n/newbot — بوت جديد\n/mybots — بوتاتك";
    if(rep){setTimeout(async()=>{const rid=uid();await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:rep,from:BF_ID,senderName:"BotFather",time:ts(),type:"text",isOfficialBot:true,createdAt:Date.now()+600});await update(ref(db,`userChats/${user?.uid}/${cid}`),{lastMessage:rep.slice(0,40),lastTime:ts(),order:Date.now()+1});},800);}
  },[user]);

  const escalate=useCallback(async()=>{
    if(!actChat||!user) return;
    const tn=`TKT-${Date.now().toString().slice(-6)}`;
    const mid2=uid();
    await set(ref(db,`messages/${actChat}/${mid2}`),{id:mid2,chatId:actChat,text:`📋 تم إرسال طلبك للدعم البشري.\n🎫 رقم الطلب: ${tn}\nسيتم الرد قريباً ✅`,from:SUPPORT_ID,senderName:"الدعم الفني",time:ts(),type:"system_info",isSupport:true,createdAt:Date.now()});
    await update(ref(db,`support/ticket_${user.uid}/info`),{status:"awaiting_human",ticketNum:tn}).catch(()=>{});
  },[actChat,user]);

  const addRx=useCallback(async(msgId,emoji)=>{
    if(!user||!actChat) return;
    const rp=`reactions/${actChat}/${msgId}/${emoji}`;
    const s=await get(ref(db,rp)).catch(()=>null);
    if(s?.exists()){
      const us=s.val();
      if(us[user.uid]) await remove(ref(db,`${rp}/${user.uid}`));
      else await set(ref(db,`${rp}/${user.uid}`),true);
    } else await set(ref(db,`${rp}/${user.uid}`),true);
    setCtx(null);
  },[user,actChat]);

  const pinMsg=useCallback(async(msg)=>{
    if(!actChat) return;
    const s=await get(ref(db,`messages/${actChat}`)).catch(()=>null);
    if(s?.exists()) await Promise.all(Object.values(s.val()).filter(m=>m.pinned).map(m=>update(ref(db,`messages/${actChat}/${m.id}`),{pinned:false})));
    await update(ref(db,`messages/${actChat}/${msg.id}`),{pinned:true});
    setCtx(null);
  },[actChat]);

  const sendReport=useCallback(async(reason,note)=>{
    if(!user||!repTarget) return;
    const rid=uid();
    await set(ref(db,`reports/${rid}`),{id:rid,reason,note,reporterId:user.uid,reporterUsername:ud?.username,targetId:repTarget.id,targetChatId:actChat,createdAt:Date.now(),status:"pending"});
    setRepTarget(null);
    alert("✅ تم إرسال البلاغ. شكراً!");
  },[user,ud,repTarget,actChat]);

  const handleFile=useCallback((file,isImg)=>{
    if(!file) return;
    const r=new FileReader();
    r.onload=e=>{
      if(isImg) sendMsg("","image",{imageUrl:e.target.result,fileName:file.name,fileSize:file.size});
      else sendMsg("","file",{fileName:file.name,fileSize:file.size,fileData:e.target.result});
    };
    r.readAsDataURL(file);
    setAttMenu(false);
  },[sendMsg]);

  const saveProfile=useCallback(async()=>{
    if(!user) return;
    if(ep.un!==ud?.username){
      if(ep.un.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
      if(/^\d/.test(ep.un)){alert("لا يبدأ برقم");return;}
      const [u1,c1]=await Promise.all([get(ref(db,`usernames/${ep.un.toLowerCase()}`)),get(ref(db,`chatUsernames/${ep.un.toLowerCase()}`))]);
      if((u1.exists()&&u1.val()!==user.uid)||c1.exists()){alert(`اسم المستخدم @${ep.un} مأخوذ مسبقاً`);return;}
      if(ud?.username) await remove(ref(db,`usernames/${ud.username}`));
      await set(ref(db,`usernames/${ep.un.toLowerCase()}`),user.uid);
    }
    await update(ref(db,`users/${user.uid}`),{displayName:ep.dn,username:ep.un.toLowerCase(),bio:ep.bio,photoURL:ep.photo});
    await updateProfile(user,{displayName:ep.dn});
    const s=await get(ref(db,`users/${user.uid}`));
    if(s.exists())setUd(s.val());
    setModal(null);
  },[user,ud,ep]);

  const createConvo=useCallback(async type=>{
    if(!nf.name.trim()||!user||!ud) return;
    if(!nf.username.trim()){alert("يجب إدخال اسم مستخدم");return;}
    if(nf.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
    if(/^\d/.test(nf.username)){alert("لا يبدأ برقم");return;}
    if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(nf.username)){alert("حروف وأرقام فقط، يبدأ بحرف");return;}
    const un2=nf.username.toLowerCase();
    const [u1,c1]=await Promise.all([get(ref(db,`usernames/${un2}`)),get(ref(db,`chatUsernames/${un2}`))]);
    if(u1.exists()){alert(`@${nf.username} مأخوذ مسبقاً`);return;}
    if(c1.exists()){alert(`@${nf.username} مستخدم في قناة أو مجموعة`);return;}
    const cid=uid();
    const cd={id:cid,type,name:nf.name.trim(),username:un2,bio:nf.bio||"",photoURL:"",ownerId:user.uid,members:[user.uid],admins:[user.uid],verified:false,createdAt:Date.now(),...(type==="channel"?{subscribers:1,subscribersList:[user.uid]}:{})};
    await set(ref(db,`chats/${cid}`),cd);
    await set(ref(db,`chatUsernames/${un2}`),cid);
    await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"تم الإنشاء",lastTime:ts(),unread:0,order:Date.now(),...cd});
    await set(ref(db,`messages/${cid}/${uid()}`),{id:uid(),chatId:cid,text:`🎉 تم إنشاء ${type==="channel"?"القناة":"المجموعة"} "${nf.name}"`,from:"system",time:ts(),type:"system",createdAt:Date.now()});
    setModal(null);setNf({name:"",username:"",bio:""});
    openChat(cid,cd);
  },[nf,user,ud,openChat]);

  const joinCh=useCallback(async chat=>{
    if(!user) return;
    const cid=chat.id||chat.chatId;
    if(chats.find(c=>(c.id||c.chatId)===cid)){openChat(cid,chat);return;}
    const subs=[...(chat.subscribersList||[])];
    if(!subs.includes(user.uid)) subs.push(user.uid);
    const mems=[...(chat.members||[])];
    if(!mems.includes(user.uid)) mems.push(user.uid);
    await update(ref(db,`chats/${cid}`),{subscribers:subs.length,subscribersList:subs,members:mems});
    await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:chat.lastMessage||"",lastTime:ts(),unread:0,order:Date.now(),...chat,id:cid});
    openChat(cid,{...chat,subscribers:subs.length,members:mems});
  },[user,chats,openChat]);

  const openPM=useCallback(async tu=>{
    if(!user||!tu?.uid||tu.uid===user.uid) return;
    const cid=`pm_${[user.uid,tu.uid].sort().join("_")}`;
    const s=await get(ref(db,`chats/${cid}`)).catch(()=>null);
    if(!s?.exists()){
      const cd={id:cid,type:"private",name:tu.displayName||tu.name,members:[user.uid,tu.uid],createdAt:Date.now(),color:tu.color||rc(tu.displayName||tu.name||"?"),photoURL:tu.photoURL||""};
      await set(ref(db,`chats/${cid}`),cd);
      await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
      await set(ref(db,`userChats/${tu.uid}/${cid}`),{chatId:cid,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
    }
    setQMode(false);setQ("");setModal(null);setProf(null);
    openChat(cid,s?.exists()?s.val():{id:cid,type:"private",name:tu.displayName||tu.name,color:tu.color,photoURL:tu.photoURL});
  },[user,openChat]);

  const openMention=useCallback(async un2=>{
    const [us,cs]=await Promise.all([get(ref(db,`usernames/${un2.toLowerCase()}`)),get(ref(db,`chatUsernames/${un2.toLowerCase()}`))]).catch(()=>[null,null]);
    if(us?.exists()){const s=await get(ref(db,`users/${us.val()}`));if(s.exists())setProf(s.val());}
    else if(cs?.exists()){const s=await get(ref(db,`chats/${cs.val()}`));if(s.exists())setProf(s.val());}
  },[]);

  const openBF=useCallback(async()=>{
    if(!user) return;
    const cid=`botfather_${user.uid}`;
    const s=await get(ref(db,`chats/${cid}`)).catch(()=>null);
    if(!s?.exists()){
      const cd={id:cid,type:"official_bot",name:"BotFather",username:"botfather",isOfficial:true,verified:true,members:[user.uid,BF_ID],createdAt:Date.now(),photoURL:""};
      await set(ref(db,`chats/${cid}`),cd);
      await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"أنشئ بوتك الآن",lastTime:ts(),unread:1,order:Date.now(),type:"official_bot",name:"BotFather",verified:true,color:"#9C27B0"});
      const wm=uid();await set(ref(db,`messages/${cid}/${wm}`),{id:wm,chatId:cid,text:"مرحباً! أنا BotFather ✈️\n\n/newbot — بوت جديد (الاسم ينتهي بـ bot)\n/mybots — بوتاتك",from:BF_ID,senderName:"BotFather",time:ts(),type:"text",isOfficialBot:true,createdAt:Date.now()});
    }
    openChat(cid,{id:cid,type:"official_bot",name:"BotFather",username:"botfather",verified:true});
    setModal(null);setShowMenu(false);
  },[user,openChat]);

  const saveChSettings=useCallback(async()=>{
    if(!chSet) return;
    await update(ref(db,`chats/${chSet.id}`),{name:chSet.name,bio:chSet.bio||"",username:(chSet.username||"").toLowerCase(),photoURL:chSet.photoURL||""});
    if(chSet.username) await set(ref(db,`chatUsernames/${chSet.username.toLowerCase()}`),chSet.id);
    const s=await get(ref(db,`chats/${chSet.id}`));
    if(s.exists())setActData(s.val());
    setModal(null);alert("✅ تم الحفظ");
  },[chSet]);

  const EMOJIS=["😀","😂","😍","😊","🥳","😎","🤩","😭","❤️","🔥","💯","⭐","🎉","👍","👋","🙏","💪","✅","🚀","💎","🌈","🍕","☕","🎮","📸","🔑","😅","🤔","💬","📱","🎯","🏆"];
  const RXEMOJIS=["❤️","👍","😂","😮","😢","🔥","🎉","👎"];

  const isCh=actData?.type==="channel";
  const isGr=actData?.type==="group";
  const isOB=actData?.type==="official_bot";
  const isSv=actData?.type==="saved";
  const isSup=actData?.type==="support";
  const isMine=actData?.ownerId===user?.uid;
  const isAdmin=isMine||(actData?.admins||[]).includes(user?.uid);
  const canSend=!isCh||(isCh&&isMine);
  const chatName=actData?.name||"محادثة";

  // Context menu items
  const ctxItems=ctx?[
    {l:"↩ ردّ",a:()=>{setReply(ctx.msg);setCtx(null);}},
    {l:"⎘ نسخ",a:()=>{navigator.clipboard?.writeText(ctx.msg?.text||"");setCtx(null);}},
    ...(ctx.msg?.from===user?.uid&&!ctx.msg?.isOfficialBot?[{l:"✏️ تعديل",a:()=>{setEditing(ctx.msg);setInp(ctx.msg.text||"");setCtx(null);setTimeout(()=>inpRef.current?.focus(),50);}}]:[]),
    ...(isAdmin||ctx.msg?.from===user?.uid?[{l:"📌 تثبيت",a:()=>pinMsg(ctx.msg)}]:[]),
    {l:"🔗 نسخ الرابط",a:()=>{navigator.clipboard?.writeText(`Termin/${actData?.username||actChat}/${ctx.msg?.id}`);setCtx(null);alert("تم نسخ الرابط!");}},
    {l:"🔖 حفظ",a:async()=>{const sv=chats.find(c=>c.type==="saved");if(sv){const nid=uid();await set(ref(db,`messages/${sv.chatId||sv.id}/${nid}`),{...ctx.msg,id:nid,chatId:sv.chatId||sv.id,createdAt:Date.now()+1});}setCtx(null);}},
    ...(isCh||isGr||isOB?[{l:"🚩 بلاغ",a:()=>{setRepTarget(ctx.msg);setCtx(null);},d:true}]:[]),
    ...(ctx.msg?.from===user?.uid?[{l:"🗑 حذف",a:async()=>{if(actChat)await remove(ref(db,`messages/${actChat}/${ctx.msg.id}`)).catch(()=>{});setCtx(null);},d:true}]:[]),
  ]:[];

  if(authLoad) return (
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
      <div style={{fontSize:"56px",animation:"spin 1.2s linear infinite"}}>✈️</div>
      <div style={{color:T.text,fontSize:"22px",fontWeight:"900"}}>تيرمين</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );

  if(!user) return <AuthScreen/>;

  // Search results
  const renderSearch=()=>(
    <div style={{overflowY:"auto",flex:1}}>
      {!qRes.length&&q.trim()&&<div style={{padding:"40px",textAlign:"center",color:T.dim,fontSize:"14px"}}>لا توجد نتائج لـ "{q}"</div>}
      {qRes.map((r,i)=>{
        const isU=r.rt==="user";
        const isCH=r.rt==="channel";
        const isB=r.rt==="official_bot";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.brd}18`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>{
              if(isU) openPM(r);
              else if(isCH) joinCh(r);
              else openChat(r.id,r);
              setQMode(false);setQ("");
            }}>
            <Av name={r.name||r.displayName} photo={r.photoURL} size={46} verified={r.verified||r.isOfficial} fraud={r.isFraud}
              onClick={e=>{e.stopPropagation();setProf(r);}}/>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"5px"}}>
                {isCH&&<Ic n="ch" s={12} c={T.gold}/>}
                {r.rt==="group"&&<Ic n="gr" s={12} c={T.btn}/>}
                {isB&&<span>🤖</span>}
                {r.name||r.displayName}
                {(r.verified||r.isOfficial)&&<span style={{background:T.vrf,borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ic n="chk" s={10} c="#fff"/></span>}
                {r.isFraud&&<span style={{color:T.err,fontSize:"10px",background:`${T.err}20`,padding:"1px 5px",borderRadius:"5px"}}>احتيال</span>}
              </div>
              <div style={{color:T.dim,fontSize:"12px"}}>@{r.username} · {isCH?`${fsubs(r.subscribers||0)} مشترك`:r.rt==="group"?`${r.members?.length||0} عضو`:"مستخدم"}</div>
            </div>
            {isCH&&!chats.find(c=>(c.id||c.chatId)===r.id)&&(
              <button onClick={e=>{e.stopPropagation();joinCh(r);}} style={{background:`${T.btn}20`,border:`1px solid ${T.btn}40`,borderRadius:"8px",padding:"6px 12px",color:T.btn,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>انضمام</button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",overflow:"hidden"}}
      onClick={()=>{setShowMenu(false);setAttMenu(false);setCtx(null);setShowEmoji(false);}}>

      {prof&&<ProfileSheet p={prof} onClose={()=>setProf(null)} onChat={prof.uid?openPM:(prof.type==="channel"||prof.type==="group")?()=>openChat(prof.id,prof):null} me={user} chats={chats}/>}
      {repTarget&&<ReportSheet onClose={()=>setRepTarget(null)} onReport={sendReport}/>}

      {/* SIDEBAR */}
      <div style={{width:showSB?(mobile?"100%":"360px"):"0",minWidth:0,background:T.sb,borderLeft:`1px solid ${T.brd}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"width 0.25s",position:mobile?"absolute":"relative",height:"100%",zIndex:mobile?20:1}}>
        {/* Top */}
        <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${T.brd}`,background:T.sb,position:"relative",zIndex:50}}>
          {tab==="chats"&&(<>
            <button onClick={e=>{e.stopPropagation();setShowMenu(!showMenu);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="menu" s={20}/></button>
            <div style={{flex:1,display:"flex",alignItems:"center",background:T.inp2,borderRadius:"22px",padding:"7px 14px",gap:"8px"}} onClick={()=>setQMode(true)}>
              <Ic n="srch" s={15}/>
              <input value={q} onChange={e=>{setQ(e.target.value);setQMode(true);}} onFocus={()=>setQMode(true)} placeholder="بحث فوري..." style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14px",flex:1,direction:"rtl",fontFamily:"inherit"}}/>
              {q&&<button onClick={()=>{setQ("");setQMode(false);}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
            </div>
          </>)}
          {tab!=="chats"&&<div style={{flex:1,color:T.text,fontSize:"16px",fontWeight:"800",paddingRight:"6px"}}>{tab==="settings"?"الإعدادات":"جهات الاتصال"}</div>}
          {showMenu&&(
            <div style={{position:"absolute",top:"54px",right:"8px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:300,minWidth:"210px",border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
              {[
                {n:"usr",l:"محادثة جديدة",a:()=>{setModal("newChat");setShowMenu(false);}},
                {n:"gr",l:"مجموعة جديدة",a:()=>{setModal("newGroup");setShowMenu(false);}},
                {n:"ch",l:"قناة جديدة",a:()=>{setModal("newCh");setShowMenu(false);}},
                {n:"bot",l:"BotFather",a:openBF},
                {n:"sv",l:"رسائل محفوظة",a:()=>{const sv=chats.find(c=>c.type==="saved");if(sv)openChat(sv.chatId||sv.id,sv);setShowMenu(false);}},
                {n:"sup",l:"الدعم الفني",a:()=>{openSup();setShowMenu(false);}},
                {n:"set",l:"الإعدادات",a:()=>{setTab("settings");setShowMenu(false);}},
                ...(isOwner?[{n:"cr",l:"لوحة الإدارة",a:()=>{window.open("/admin","_blank");setShowMenu(false);}}]:[]),
              ].map(it=>(
                <button key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <Ic n={it.n} s={18} c={T.btn}/>{it.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {tab==="chats"&&!qMode&&<div style={{padding:"5px 14px 2px",display:"flex",alignItems:"center",gap:"7px"}}><span style={{fontSize:"15px"}}>✈️</span><span style={{color:T.btn,fontWeight:"900",fontSize:"15px",letterSpacing:"1.5px"}}>تيرمين</span>{isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}</div>}

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {tab==="settings"&&<SettingsPanel user={user} ud={ud} setUd={setUd} isOwner={isOwner} openSup={openSup} setModal={setModal}/>}
          {tab==="contacts"&&(
            <div style={{padding:"12px"}}>
              {chats.filter(c=>c.type==="private").map(c=>(
                <div key={c.id||c.chatId} onClick={()=>openChat(c.chatId||c.id,c)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"12px",cursor:"pointer",marginBottom:"4px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={c.name} photo={c.photoURL} size={44}/>
                  <div style={{color:T.text,fontWeight:"600",fontSize:"14px"}}>{c.name}</div>
                </div>
              ))}
              {!chats.filter(c=>c.type==="private").length&&<div style={{padding:"30px",textAlign:"center",color:T.dim,fontSize:"13px"}}>لا توجد جهات اتصال</div>}
            </div>
          )}
          {tab==="chats"&&(qMode&&q?renderSearch():(
            <div>
              {!chats.length&&<div style={{padding:"40px",textAlign:"center",color:T.dim,fontSize:"14px"}}>لا توجد محادثات بعد<br/><span style={{fontSize:"12px",marginTop:"8px",display:"block"}}>اضغط ☰ لبدء محادثة جديدة</span></div>}
              {chats.map(chat=>{
                const cid=chat.id||chat.chatId;
                const active=actChat===cid;
                const name=chat.name||"محادثة";
                const isOB2=chat.type==="official_bot";
                const isSup2=chat.type==="support";
                return (
                  <div key={cid} onClick={()=>openChat(cid,chat)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 14px",cursor:"pointer",background:active?T.acc:"transparent",borderBottom:`1px solid ${T.brd}18`}}
                    onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.hov;}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                    <Av name={name} photo={chat.photoURL} size={52} online={chat.type==="private"} verified={chat.verified||isOB2}
                      onClick={e=>{e.stopPropagation();setProf({...chat,displayName:name});}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:T.text,fontWeight:"600",fontSize:"15px",display:"flex",alignItems:"center",gap:"4px"}}>
                          {chat.type==="channel"&&<Ic n="ch" s={11} c={T.gold}/>}
                          {chat.type==="group"&&<Ic n="gr" s={11} c={T.btn}/>}
                          {chat.type==="saved"&&<Ic n="sv" s={11} c={T.btn}/>}
                          {isOB2&&<span style={{fontSize:"11px"}}>✈️</span>}
                          {isSup2&&<span style={{fontSize:"11px"}}>🆘</span>}
                          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"150px"}}>{name}</span>
                          {(chat.verified||isOB2)&&<span style={{background:T.vrf,borderRadius:"50%",width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic n="chk" s={8} c="#fff"/></span>}
                        </span>
                        <span style={{color:T.dim,fontSize:"11px",flexShrink:0}}>{chat.lastTime}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                        <span style={{color:T.dim,fontSize:"13px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"180px"}}>{chat.lastMessage}</span>
                        {chat.unread>0&&<span style={{background:T.unr,color:"#fff",borderRadius:"12px",minWidth:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",padding:"0 5px",flexShrink:0}}>{chat.unread>99?"99+":chat.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* FAB */}
        {tab==="chats"&&!qMode&&(
          <div style={{padding:"8px 14px 5px",borderTop:`1px solid ${T.brd}`,display:"flex",justifyContent:"flex-end",background:T.sb}}>
            <button onClick={e=>{e.stopPropagation();setModal("fab");}} style={{background:T.btn,border:"none",borderRadius:"50%",width:"46px",height:"46px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 14px rgba(82,136,193,0.45)"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <Ic n="pls" s={22} c="#fff"/>
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div style={{display:"flex",background:T.tab,borderTop:`1px solid ${T.brd}`,padding:"6px 0"}}>
          {[{k:"chats",n:"menu",l:"المحادثات"},{k:"contacts",n:"ct",l:"جهات الاتصال"},{k:"settings",n:"set",l:"الإعدادات"}].map(t=>(
            <button key={t.k} onClick={()=>{setTab(t.k);setQMode(false);setQ("");}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",cursor:"pointer",padding:"6px 4px"}}>
              <Ic n={t.n} s={22} c={tab===t.k?T.btn:T.dim}/>
              <span style={{color:tab===t.k?T.btn:T.dim,fontSize:"10px",fontWeight:tab===t.k?"700":"400"}}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {!actChat?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"40px"}}>
            <div style={{fontSize:"72px"}}>✈️</div>
            <div style={{textAlign:"center"}}><div style={{color:T.text,fontSize:"26px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div><div style={{color:T.dim,fontSize:"13px",marginTop:"6px"}}>اختر محادثة للبدء</div></div>
          </div>
        ):(
          <>
            {/* Header */}
            <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",background:T.sb,borderBottom:`1px solid ${T.brd}`,flexShrink:0}}>
              {mobile&&<button onClick={()=>{setShowSB(true);setActChat(null);setActData(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><Ic n="back" s={22}/></button>}
              <div style={{display:"flex",alignItems:"center",gap:"11px",flex:1,cursor:"pointer"}} onClick={()=>setProf(actData)}>
                <Av name={chatName} photo={actData?.photoURL} size={40} online={actData?.type==="private"} verified={actData?.verified||isOB}/>
                <div>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"15px",display:"flex",alignItems:"center",gap:"5px"}}>
                    {chatName}
                    {(actData?.verified||isOB)&&<span style={{background:T.vrf,borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ic n="chk" s={10} c="#fff"/></span>}
                  </div>
                  <div style={{color:T.dim,fontSize:"12px"}}>{isSv?"رسائلك المحفوظة":isSup?"الدعم":isOB?"✈️ مساعد رسمي":isGr?`${actData?.members?.length||0} عضو`:isCh?`${fsubs(actData?.subscribers||0)} مشترك`:""}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"2px"}}>
                {!isOB&&!isSv&&!isSup&&<button style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke={T.dim} strokeWidth="2"/></svg></button>}
                <button onClick={e=>{e.stopPropagation();if(isCh&&isMine){setChSet({...actData});setModal("chSet");}else setShowInfo(!showInfo);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="more" s={20}/></button>
              </div>
            </div>

            {/* Pinned */}
            {pinned&&(
              <div style={{padding:"8px 14px",background:T.panel,borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={()=>document.getElementById(`m_${pinned.id}`)?.scrollIntoView({behavior:"smooth"})}>
                <Ic n="pin" s={16} c={T.btn}/>
                <div style={{flex:1,minWidth:0}}><div style={{color:T.btn,fontSize:"11px",fontWeight:"700"}}>رسالة مثبّتة</div><div style={{color:T.dim,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pinned.text}</div></div>
                {isAdmin&&<button onClick={e=>{e.stopPropagation();update(ref(db,`messages/${actChat}/${pinned.id}`),{pinned:false}).catch(()=>{});}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
              </div>
            )}

            {/* Reply/Edit banner */}
            {(reply||editing)&&(
              <div style={{padding:"7px 16px",background:T.panel,borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"3px",height:"30px",background:editing?T.gold:T.btn,borderRadius:"2px",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:editing?T.gold:T.btn,fontSize:"11.5px",fontWeight:"700"}}>{editing?"✏️ تعديل":(reply?.senderName||"أنت")}</div>
                  <div style={{color:T.dim,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{editing?editing.text:reply?.text}</div>
                </div>
                <button onClick={()=>{setReply(null);setEditing(null);setInp("");}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={15}/></button>
              </div>
            )}

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px",background:T.bg,display:"flex",flexDirection:"column",gap:"2px"}}>
              {!msgs.length&&<div style={{margin:"auto",textAlign:"center",color:T.dim}}><div style={{fontSize:"40px",marginBottom:"10px"}}>{isSv?"🔖":isSup?"🆘":isOB?"✈️":"👋"}</div><div style={{fontSize:"14px"}}>{isSv?"لا توجد رسائل محفوظة":isSup?"اكتب مشكلتك وسيرد الذكاء الاصطناعي فوراً":"ابدأ المحادثة!"}</div></div>}
              {msgs.map((msg,idx)=>{
                const isMe=msg.from===user?.uid;
                const isSys=msg.type==="system"||msg.type==="system_info";
                const isB=msg.isOfficialBot||msg.from===BOT_ID||msg.from===BF_ID;
                const isSP=msg.isSupport||msg.from===SUPPORT_ID;
                const showSender=!isMe&&isGr&&(idx===0||msgs[idx-1]?.from!==msg.from);
                const msgRx=reactions[msg.id]||{};
                if(isSys) return <div key={msg.id} id={`m_${msg.id}`} style={{textAlign:"center",margin:"6px 0"}}><span style={{background:`${T.btn}20`,color:T.dim,borderRadius:"12px",padding:"4px 14px",fontSize:"12px"}}>{msg.text}</span></div>;
                return (
                  <div key={msg.id} id={`m_${msg.id}`} style={{display:"flex",justifyContent:isMe?"flex-start":"flex-end",marginBottom:"2px",animation:"mi .2s ease"}}
                    onContextMenu={e=>{e.preventDefault();e.stopPropagation();setCtx({x:Math.min(e.clientX,window.innerWidth-200),y:Math.min(e.clientY,window.innerHeight-280),msg});}}>
                    <div style={{maxWidth:"72%"}}>
                      <div style={{padding:"8px 11px 5px",borderRadius:isMe?"16px 16px 16px 4px":"16px 16px 4px 16px",background:isMe?T.out:isB||isSP?"#1a3040":T.inp,boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
                        {showSender&&<div style={{color:msg.senderColor||T.btn,fontSize:"12px",fontWeight:"700",marginBottom:"3px",cursor:"pointer"}} onClick={()=>{const u2=cache.users.find(u=>u.uid===msg.from);if(u2)setProf(u2);}}>{msg.senderName}</div>}
                        {(isB||isSP)&&!isMe&&<div style={{color:T.gold,fontSize:"11px",fontWeight:"700",marginBottom:"3px",display:"flex",alignItems:"center",gap:"4px"}}><span style={{background:T.vrf,borderRadius:"50%",width:13,height:13,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ic n="chk" s={8} c="#fff"/></span>⭐ {msg.senderName}</div>}
                        {msg.replyTo&&<div style={{background:"rgba(255,255,255,0.07)",borderRadius:"8px",padding:"5px 10px",marginBottom:"6px",borderRight:`3px solid ${T.btn}`}}><div style={{color:T.btn,fontSize:"11px",fontWeight:"700"}}>{msg.replyTo.sender}</div><div style={{color:T.dim,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{msg.replyTo.text}</div></div>}
                        {msg.type==="image"&&<div style={{marginBottom:"4px"}}><img src={msg.imageUrl} alt="" style={{maxWidth:"240px",maxHeight:"280px",borderRadius:"10px",display:"block",width:"100%",objectFit:"cover"}}/>{msg.text&&<div style={{color:T.text,fontSize:"14px",marginTop:"5px"}}>{msg.text}</div>}</div>}
                        {msg.type==="file"&&<a href={msg.fileData} download={msg.fileName} style={{display:"flex",alignItems:"center",gap:"10px",textDecoration:"none",background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 12px",marginBottom:"4px"}}><Ic n="file" s={26} c={T.btn}/><div><div style={{color:T.text,fontSize:"13px",fontWeight:"600",wordBreak:"break-all"}}>{msg.fileName}</div><div style={{color:T.dim,fontSize:"11px"}}>{fsz(msg.fileSize)}</div></div></a>}
                        {(msg.type==="text"||!msg.type)&&<MText text={msg.text} onMention={openMention} style={{color:T.text,fontSize:"14.5px",lineHeight:"1.55",wordBreak:"break-word",whiteSpace:"pre-wrap",display:"block"}}/>}
                        <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:"4px",marginTop:"3px"}}>
                          <span style={{color:T.dim,fontSize:"10.5px"}}>{msg.time}{msg.edited&&" (معدّل)"}</span>
                          {isMe&&<Ic n="chk2" s={13} c={T.btn}/>}
                          {msg.pinned&&<Ic n="pin" s={11} c={T.gold}/>}
                        </div>
                      </div>
                      {/* Reactions */}
                      {Object.keys(msgRx).length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginTop:"4px",justifyContent:isMe?"flex-start":"flex-end"}}>
                          {Object.entries(msgRx).map(([emoji,users])=>{
                            const cnt=Object.keys(users).length;
                            const mine=users[user?.uid];
                            return cnt>0?<button key={emoji} onClick={()=>addRx(msg.id,emoji)} style={{background:mine?`${T.btn}30`:"rgba(255,255,255,0.08)",border:`1px solid ${mine?T.btn:"rgba(255,255,255,0.12)"}`,borderRadius:"12px",padding:"3px 8px",cursor:"pointer",fontSize:"13px",color:T.text,display:"flex",alignItems:"center",gap:"4px"}}>{emoji}<span style={{fontSize:"11px",color:mine?T.btn:T.dim}}>{cnt}</span></button>:null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>

            {/* Support escalate */}
            {isSup&&<div style={{padding:"8px 14px",background:T.panel,borderTop:`1px solid ${T.brd}`,display:"flex",justifyContent:"center"}}><button onClick={escalate} style={{background:"rgba(77,214,122,0.15)",border:"1px solid rgba(77,214,122,0.4)",borderRadius:"10px",padding:"8px 20px",color:T.on,cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>📞 التحويل للدعم البشري</button></div>}

            {/* Input */}
            {canSend?(
              <div style={{padding:"9px 12px",background:T.sb,borderTop:`1px solid ${T.brd}`,flexShrink:0,position:"relative"}}>
                {showEmoji&&(
                  <div style={{position:"absolute",bottom:"62px",right:"12px",background:"#1a2a3a",borderRadius:"14px",padding:"12px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200,border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
                    {EMOJIS.map(e=><button key={e} onClick={()=>{setInp(p=>p+e);inpRef.current?.focus();}} style={{background:"none",border:"none",fontSize:"21px",cursor:"pointer",padding:"4px",borderRadius:"7px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hov} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
                  </div>
                )}
                {attMenu&&(
                  <div style={{position:"absolute",bottom:"62px",right:"52px",background:"#1c2d3d",borderRadius:"14px",padding:"10px 14px",display:"flex",gap:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:200,border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
                    {[{n:"img",l:"صورة",c:"#4CAF50",a:()=>{iRef.current?.click();setAttMenu(false);}},{n:"file",l:"ملف",c:"#2196F3",a:()=>{fRef.current?.click();setAttMenu(false);}}].map(b=>(
                      <button key={b.l} onClick={b.a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",background:"none",border:"none",cursor:"pointer",padding:"10px 12px",borderRadius:"10px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <Ic n={b.n} s={26} c={b.c}/><span style={{color:T.dim,fontSize:"11px"}}>{b.l}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <button onClick={e=>{e.stopPropagation();setShowEmoji(!showEmoji);setAttMenu(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",fontSize:"20px",flexShrink:0}}>😊</button>
                  {!isSv&&!isOB&&<button onClick={e=>{e.stopPropagation();setAttMenu(!attMenu);setShowEmoji(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="attach" s={20}/></button>}
                  <div style={{flex:1,background:T.inp2,borderRadius:"22px",padding:"8px 14px",border:editing?`1px solid ${T.gold}`:"none"}}>
                    <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}if(e.key==="Escape"){setEditing(null);setReply(null);setInp("");}}}
                      placeholder={isSv?"احفظ ملاحظاتك...":isCh?"نشر في القناة...":isSup?"اكتب مشكلتك...":isOB?"أرسل أمراً...":editing?"تعديل الرسالة...":"اكتب رسالة..."} rows={1}
                      style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14.5px",width:"100%",direction:"rtl",fontFamily:"inherit",resize:"none",lineHeight:"1.5",maxHeight:"90px",overflowY:"auto"}}/>
                  </div>
                  <button onClick={()=>inp.trim()&&sendMsg()} style={{background:inp.trim()?T.btn:T.inp2,border:"none",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",boxShadow:inp.trim()?"0 4px 12px rgba(82,136,193,0.4)":"none"}}>
                    <Ic n={inp.trim()?"send":"mic"} s={19} c={inp.trim()?"#fff":T.dim}/>
                  </button>
                </div>
                <input ref={iRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],true)} onClick={e=>e.target.value=""}/>
                <input ref={fRef} type="file" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],false)} onClick={e=>e.target.value=""}/>
              </div>
            ):(
              <div style={{padding:"13px",background:T.sb,borderTop:`1px solid ${T.brd}`,textAlign:"center",color:T.dim,fontSize:"13px"}}>📢 فقط صاحب القناة يمكنه النشر</div>
            )}
          </>
        )}
      </div>

      {/* Context menu */}
      {ctx&&(
        <div style={{position:"fixed",top:ctx.y,left:ctx.x,background:"#1c2d3d",borderRadius:"13px",padding:"5px 0",boxShadow:"0 8px 28px rgba(0,0,0,0.55)",zIndex:600,minWidth:"180px",border:`1px solid ${T.brd}`,maxHeight:"380px",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",gap:"4px",padding:"8px 10px",borderBottom:`1px solid ${T.brd}20`}}>
            {RXEMOJIS.map(e=><button key={e} onClick={()=>addRx(ctx.msg?.id,e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",padding:"3px 4px",borderRadius:"8px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hov} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
          </div>
          {ctxItems.map(it=>(
            <button key={it.l} onClick={it.a} style={{display:"block",width:"100%",padding:"10px 16px",background:"none",border:"none",color:it.d?T.err:T.text,textAlign:"right",cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>{it.l}</button>
          ))}
        </div>
      )}

      {/* FAB menu */}
      {modal==="fab"&&(
        <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setModal(null)}>
          <div style={{position:"absolute",bottom:"80px",left:"20px",background:"#1c2d3d",borderRadius:"14px",padding:"8px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.brd}`,minWidth:"200px"}} onClick={e=>e.stopPropagation()}>
            {[{ic:"usr",l:"محادثة جديدة",a:()=>setModal("newChat")},{ic:"gr",l:"مجموعة جديدة",a:()=>setModal("newGroup")},{ic:"ch",l:"قناة جديدة",a:()=>setModal("newCh")},{ic:"bot",l:"BotFather",a:openBF}].map(it=>(
              <button key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <Ic n={it.ic} s={18} c={T.btn}/>{it.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal==="newChat"&&(
        <Mdl title="محادثة جديدة" onClose={()=>setModal(null)}>
          <input value={q} onChange={e=>{setQ(e.target.value);setQMode(true);}} placeholder="@username أو الاسم" autoFocus
            style={{background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",marginBottom:"12px",boxSizing:"border-box"}}/>
          <div style={{maxHeight:"300px",overflowY:"auto"}}>
            {qRes.filter(r=>r.rt==="user"&&r.uid!==user?.uid).map(u2=>(
              <div key={u2.uid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",cursor:"pointer",borderRadius:"10px",marginBottom:"4px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>openPM(u2)}>
                <Av name={u2.displayName} photo={u2.photoURL} size={38} verified={u2.verified}/>
                <div><div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{u2.displayName}</div><div style={{color:T.dim,fontSize:"12px"}}>@{u2.username}</div></div>
              </div>
            ))}
          </div>
        </Mdl>
      )}

      {(modal==="newGroup"||modal==="newCh")&&(
        <Mdl title={modal==="newGroup"?"مجموعة جديدة":"قناة جديدة"} onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <Inp label={modal==="newGroup"?"اسم المجموعة":"اسم القناة"} val={nf.name} set={v=>setNf(p=>({...p,name:v}))} ph={modal==="newGroup"?"اسم المجموعة...":"اسم القناة..."} af/>
            <Inp label="اسم المستخدم (يبدأ بحرف، 5+ أحرف) *مطلوب*" val={nf.username} set={v=>setNf(p=>({...p,username:v}))} ph={modal==="newGroup"?"group_name":"channel_name"}/>
            <Inp label="النبذة (اختياري)" val={nf.bio} set={v=>setNf(p=>({...p,bio:v}))} ph="وصف..."/>
            <Btn kids={modal==="newGroup"?"إنشاء المجموعة":"إنشاء القناة"} go={()=>createConvo(modal==="newGroup"?"group":"channel")}/>
          </div>
        </Mdl>
      )}

      {modal==="editProfile"&&(
        <Mdl title="تعديل الملف الشخصي" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setEp(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}};i.click();}}>
              <Av name={ep.dn||ud?.displayName} photo={ep.photo} size={72}/>
              <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
              <Inp label="الاسم الشخصي" val={ep.dn} set={v=>setEp(p=>({...p,dn:v}))} ph="اسمك..."/>
              <Inp label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" val={ep.un} set={v=>setEp(p=>({...p,un:v}))} ph="username"/>
              <Inp label="النبذة" val={ep.bio} set={v=>setEp(p=>({...p,bio:v}))} ph="أخبرنا عن نفسك..."/>
            </div>
            <Btn kids="💾 حفظ التغييرات" go={saveProfile}/>
          </div>
        </Mdl>
      )}

      {modal==="chSet"&&chSet&&(
        <Mdl title="إعدادات القناة" onClose={()=>setModal(null)} w="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=async ev=>{await update(ref(db,`chats/${chSet.id}`),{photoURL:ev.target.result});setChSet(p=>({...p,photoURL:ev.target.result}));};r.readAsDataURL(f);}};i.click();}}>
                <Av name={chSet.name} photo={chSet.photoURL} size={72}/>
                <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
              </div>
              <span style={{color:T.dim,fontSize:"12px"}}>اضغط لرفع صورة القناة من هاتفك</span>
            </div>
            <Inp label="اسم القناة" val={chSet.name} set={v=>setChSet(p=>({...p,name:v}))} ph="اسم القناة..."/>
            <Inp label="اسم المستخدم (@)" val={chSet.username||""} set={v=>setChSet(p=>({...p,username:v}))} ph="channel_username"/>
            <Inp label="النبذة" val={chSet.bio||""} set={v=>setChSet(p=>({...p,bio:v}))} ph="وصف القناة..."/>
            <Btn kids="💾 حفظ إعدادات القناة" go={saveChSettings}/>
          </div>
        </Mdl>
      )}

      {modal==="twoFactor"&&(
        <Mdl title="التحقق بخطوتين" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>{ud?.twoFactor?"🔒":"🔓"}</div>
            <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>التحقق بخطوتين {ud?.twoFactor?"مفعّل":"معطّل"}</div>
            {!ud?.twoFactor&&(
              <div style={{width:"100%"}}>
                <Inp label="اختر كلمة مرور للتحقق (ستُطلب عند الدخول من جهاز جديد)" val={twoFAPass} set={setTwoFAPass} ph="كلمة مرور التحقق..." type="password"/>
              </div>
            )}
            <div style={{color:T.dim,fontSize:"13px",lineHeight:"1.7"}}>عند التفعيل، يُطلب منك كلمة مرور التحقق عند الدخول من جهاز جديد</div>
            <Btn color={ud?.twoFactor?T.err:T.gold} kids={ud?.twoFactor?"🔓 إلغاء التفعيل":"🔒 تفعيل التحقق بخطوتين"} go={async()=>{
              const nv=!ud?.twoFactor;
              if(nv&&!twoFAPass.trim()){alert("يجب إدخال كلمة مرور للتحقق");return;}
              await update(ref(db,`users/${user.uid}`),{twoFactor:nv,twoFactorPass:nv?twoFAPass:""});
              const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUd(s.val());
              const nm=uid();
              await set(ref(db,`messages/bot_${user.uid}/${nm}`),{id:nm,chatId:`bot_${user.uid}`,text:`🔐 تم ${nv?"تفعيل":"إلغاء"} التحقق بخطوتين\n🕐 ${tf()}`,from:BOT_ID,senderName:"DFGFD",time:ts(),type:"text",isOfficialBot:true,createdAt:Date.now()});
              setTwoFAPass("");setModal(null);
            }}/>
          </div>
        </Mdl>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.acc};border-radius:4px}
        @keyframes mi{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        textarea{scrollbar-width:none}textarea::-webkit-scrollbar{display:none}
        input::placeholder,textarea::placeholder{color:${T.dim}}
        input,textarea,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}
