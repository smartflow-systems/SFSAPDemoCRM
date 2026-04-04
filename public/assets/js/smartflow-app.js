document.addEventListener("DOMContentLoaded",()=>{fetch("/data/posts.json",{cache:"no-store"})
 .then(r=>r.json()).then(posts=>{const w=document.querySelector("#latest-posts"); if(!w)return;
 w.textContent=""; posts.slice(0,3).forEach(p=>{const a=document.createElement("a");
 a.className="card"; a.href=p.url; a.target="_blank"; a.rel="noopener";
 const h4=document.createElement("h4"); h4.textContent=p.title; a.appendChild(h4);
 const small=document.createElement("small"); small.className="muted"; small.textContent=p.date; a.appendChild(small);
 const para=document.createElement("p"); para.textContent=p.snippet||""; a.appendChild(para); w.appendChild(a);});})
 .catch(()=>{});});