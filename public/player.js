/* CineHD Hindi Streaming — player.js v2
   Hindi-first with working multi-language embed servers
*/

const TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const TMDB     = "https://api.themoviedb.org/3";
const IMG      = "https://image.tmdb.org/t/p/w342";

// ── Language code map for embed URLs
const LANG_MAP = {
  hindi:   { hl:"hi", label:"Hindi",   flag:"🇮🇳" },
  tamil:   { hl:"ta", label:"Tamil",   flag:"🇮🇳" },
  telugu:  { hl:"te", label:"Telugu",  flag:"🇮🇳" },
  english: { hl:"en", label:"English", flag:"🇬🇧" },
  french:  { hl:"fr", label:"French",  flag:"🇫🇷" },
  spanish: { hl:"es", label:"Spanish", flag:"🇪🇸" },
  arab:    { hl:"ar", label:"Arabic",  flag:"🇸🇦" },
  brazil:  { hl:"pt", label:"Brazil",  flag:"🇧🇷" },
  russian: { hl:"ru", label:"Russian", flag:"🇷🇺" },
  german:  { hl:"de", label:"German",  flag:"🇩🇪" },
  italian: { hl:"it", label:"Italian", flag:"🇮🇹" },
  japan:   { hl:"ja", label:"Japan",   flag:"🇯🇵" },
  korean:  { hl:"ko", label:"Korean",  flag:"🇰🇷" },
  chinese: { hl:"zh", label:"Chinese", flag:"🇨🇳" },
  turkish: { hl:"tr", label:"Turkish", flag:"🇹🇷" },
  thai:    { hl:"th", label:"Thai",    flag:"🇹🇭" },
};

// ── Servers — direct iframe (no proxy needed)
// multiembed.mov supports &hl= for language selection
// vidsrc.xyz supports &ds_lang= for dubbed language
const SERVERS = [
  {
    id:"multi_hi", name:"MbPly Multi-Lang", badge:"🇮🇳", primary:true,
    url:({id,type,s,e,hl}) => type==="tv"
      ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}&hl=${hl}`
      : `https://multiembed.mov/?video_id=${id}&tmdb=1&hl=${hl}`,
  },
  {
    id:"vidsrc_xyz", name:"ZetPly Multi-Lang", badge:"HD",
    url:({id,type,s,e,hl}) => type==="tv"
      ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}&ds_lang=${hl}`
      : `https://vidsrc.xyz/embed/movie?tmdb=${id}&ds_lang=${hl}`,
  },
  {
    id:"embed_su", name:"OrVid Multi-Lang", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://embed.su/embed/tv/${id}/${s}/${e}`
      : `https://embed.su/embed/movie/${id}`,
  },
  {
    id:"vidlink", name:"VidLink HD", badge:"4K",
    url:({id,type,s,e}) => type==="tv"
      ? `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true`
      : `https://vidlink.pro/movie/${id}?autoplay=true`,
  },
  {
    id:"vidsrc_me", name:"VidSrc.me", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
      : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id:"twoembed", name:"2Embed", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
      : `https://www.2embed.cc/embed/${id}`,
  },
  {
    id:"autoembed", name:"AutoEmbed", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://player.autoembed.co/embed/tv/${id}/${s}/${e}`
      : `https://player.autoembed.co/embed/movie/${id}`,
  },
  {
    id:"smash", name:"SmashyStream", badge:"HD",
    url:({id}) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
];

const SCAN_NAMES = [
  "MbPly","ZetPly","OrVid","VidLink",
  "2Embed","AutoEmbed","SmashyStream","VidSrc.me",
  "VidSrc.xyz","MovPlay","CineHD","StreamX",
];

// ── State
let media   = null;
let selSvr  = "multi_hi";   // default: multiembed with Hindi
let selLang = "hindi";       // default: Hindi
let bm      = false;
let scanT   = null;
let wl      = safeGet("wl",[]);

function safeGet(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}}
function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

// ── Page / Modal helpers
const $    = id => document.getElementById(id);
const show = id => { document.querySelectorAll(".page").forEach(p=>p.classList.remove("active")); $(id).classList.add("active"); scrollTo(0,0); };
const open = id => $(id).classList.add("open");
const shut = id => $(id).classList.remove("open");

// ── Build embed URL — DIRECT iframe, no proxy
function embedUrl(srv, m, langCode) {
  const hl = LANG_MAP[langCode]?.hl || "hi";
  return srv.url({
    id: m.id,
    type: m.type,
    s: m.season  || 1,
    e: m.episode || 1,
    hl,
  });
}

// ── Load server into iframe
function loadServer(srvId, lang) {
  if (!media) return;
  const srv = SERVERS.find(s => s.id === srvId);
  if (!srv) return;
  selSvr  = srvId;
  selLang = lang || selLang;

  $("vOverlay").style.display  = "none";
  $("vLoading").style.display  = "flex";
  $("loadText").textContent    = `Loading ${srv.name}...`;

  $("videoFrame").src = embedUrl(srv, media, selLang);

  setTimeout(() => { $("vLoading").style.display = "none"; }, 5000);
  shut("serverModal");
  buildServers();
}

// ── Open player
async function openPlayer(tmdb_id, type) {
  show("playerPage");
  $("videoFrame").src           = "about:blank";
  $("vOverlay").style.display   = "flex";
  $("vLoading").style.display   = "none";
  $("mTitle").textContent       = "Loading...";
  $("nwTitle").textContent      = "Loading...";
  $("overview").textContent     = "";

  try {
    const ep  = type === "tv" ? "tv" : "movie";
    const res = await fetch(`${TMDB}/${ep}/${tmdb_id}?api_key=${TMDB_KEY}`);
    const d   = await res.json();

    const title  = d.title || d.name || "Unknown";
    const year   = (d.release_date || d.first_air_date || "").slice(0,4);
    const genres = (d.genres||[]).map(g=>g.name).join(", ").toUpperCase();

    media = { id:tmdb_id, type, title, year, genres, season:1, episode:1 };

    $("mTitle").textContent    = title;
    $("mMeta").textContent     = `${type==="tv"?"SERIES":"MOVIE"}${genres?" • "+genres:""}`;
    $("nwTitle").textContent   = title;
    $("overview").textContent  = d.overview || "";
    $("langTitle").textContent = title;
    $("langMeta").textContent  = type==="tv"?"SERIES":"MOVIE";
    $("scanTitle").textContent = title;

    bm = wl.some(w => w.id === tmdb_id);
    $("bmBtn").classList.toggle("on", bm);

    // Auto-load Hindi server
    loadServer(selSvr, selLang);
  } catch(e) {
    $("mTitle").textContent   = "Load Error";
    $("overview").textContent = "Internet connection check करें।";
  }
}

// ── Server list HTML
function buildServers() {
  $("serverList").innerHTML = SERVERS.map(s => `
    <div class="s-item ${s.id===selSvr?"sel":""}" onclick="loadServer('${s.id}')">
      <div class="s-radio"><div class="s-dot"></div></div>
      <div class="s-info">
        <div class="s-name">${s.name}${s.primary?'<span class="hindi-tag">हिंदी</span>':""}</div>
        <div class="s-status">● Ready</div>
      </div>
      <span class="s-badge">${s.badge}</span>
    </div>`).join("");
}

// ── Language grid HTML
function buildLangs() {
  $("langGrid").innerHTML = Object.entries(LANG_MAP).map(([code, l]) => `
    <div class="l-item ${code===selLang?"on":""} ${["hindi","tamil","telugu"].includes(code)?"hi-first":""}"
         onclick="pickLang('${code}')">
      <span class="l-flag">${l.flag}</span>
      <span class="l-name">${l.label}</span>
      ${code==="hindi"?'<span class="l-primary">🇮🇳 Main</span>':""}
    </div>`).join("");
}

// ── Pick language → reload with same server but new lang
function pickLang(code) {
  selLang = code;
  buildLangs();
  if (media) {
    setTimeout(() => {
      // For languages with hl support, use multiembed
      // For others, keep current server
      const useMulti = ["hindi","tamil","telugu","english","french","spanish","arab","brazil","russian","german","italian","japan","korean","chinese","turkish","thai"].includes(code);
      const srvId = useMulti ? "multi_hi" : selSvr;
      loadServer(srvId, code);
      shut("langModal");
    }, 300);
  } else {
    setTimeout(() => shut("langModal"), 300);
  }
}

// ── Smart Scan
function runScan() {
  if (scanT) clearInterval(scanT);
  let done=0, ci=0;
  const T=41;
  $("progFill").style.width  = "0%";
  $("analyzed").textContent  = "0 ANALYZED";
  $("remaining").textContent = T+" REMAINING";
  $("scanStatus").textContent= "Scanning high-speed servers...";
  $("scanGrid").innerHTML    = "";

  scanT = setInterval(() => {
    done++;
    $("progFill").style.width  = Math.round(done/T*100)+"%";
    $("analyzed").textContent  = done+" ANALYZED";
    $("remaining").textContent = Math.max(0,T-done)+" REMAINING";
    if (done%3===0 && ci<SCAN_NAMES.length) {
      const c = document.createElement("div");
      c.className = "sc-card";
      c.innerHTML = `<div class="sc-check">✓</div><div class="sc-name">${SCAN_NAMES[ci]}</div>`;
      $("scanGrid").appendChild(c);
      ci++;
    }
    if (done>=T){ clearInterval(scanT); $("scanStatus").textContent=`✅ ${ci} servers found!`; }
  }, 110);
}

// ── TMDb fetch helpers
async function tmdbSearch(q) {
  const r = await fetch(`${TMDB}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=false`);
  const d = await r.json();
  return (d.results||[]).filter(x => x.media_type==="movie"||x.media_type==="tv");
}

async function tmdbCat(cat) {
  const urls = {
    trending : `${TMDB}/trending/all/week?api_key=${TMDB_KEY}`,
    bollywood: `${TMDB}/discover/movie?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc`,
    webseries: `${TMDB}/discover/tv?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc`,
    dubbed   : `${TMDB}/trending/movie/week?api_key=${TMDB_KEY}`,
  };
  const r = await fetch(urls[cat]);
  const d = await r.json();
  return (d.results||[]).slice(0,18).map(x=>({...x, media_type:x.media_type||(x.first_air_date?"tv":"movie")}));
}

// ── Render
function renderGrid(items, label) {
  const g=$("searchResults"), e=$("emptyMsg");
  e.style.display="none";
  if (!items.length){ g.innerHTML=""; e.style.display="flex"; return; }

  const lb = label ? `<div class="sec-title" style="grid-column:1/-1">${label}</div>` : "";
  const BLANK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150'%3E%3Crect fill='%23181d2c' width='100' height='150'/%3E%3Ctext fill='%237a8499' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='26'%3E🎬%3C/text%3E%3C/svg%3E`;

  g.innerHTML = lb + items.map(x => {
    const title = (x.title||x.name||"Unknown").replace(/"/g,"&quot;");
    const year  = (x.release_date||x.first_air_date||"").slice(0,4);
    const poster= x.poster_path ? IMG+x.poster_path : BLANK;
    const type  = x.media_type||"movie";
    const isHI  = x.original_language==="hi";
    return `
      <div class="card" onclick="openPlayer(${x.id},'${type}')">
        <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='${BLANK}'"/>
        <div class="card-info">
          <div class="card-title">${title}</div>
          <div class="card-year">${year}${isHI?" 🇮🇳":""}</div>
          <span class="card-badge ${type==="tv"?"tv":""}">${type==="tv"?"TV":"MOVIE"}</span>
        </div>
      </div>`;
  }).join("");
}

function showSpinner() {
  $("searchResults").innerHTML=`<div class="load-wrap" style="grid-column:1/-1"><div class="spin"></div></div>`;
  $("emptyMsg").style.display="none";
}

async function loadCat(cat) {
  showSpinner();
  const labels={trending:"🔥 Trending This Week",bollywood:"🎬 Bollywood Hindi Movies",webseries:"📺 Hindi Web Series",dubbed:"🌐 Dubbed Movies"};
  renderGrid(await tmdbCat(cat), labels[cat]||"");
}

// ── Events

// Search
let sTimer;
$("searchInput").addEventListener("input", function(){
  clearTimeout(sTimer);
  const q = this.value.trim();
  if(!q){ loadCat("trending"); return; }
  sTimer = setTimeout(async()=>{ showSpinner(); renderGrid(await tmdbSearch(q)); }, 400);
});
$("searchBtn").addEventListener("click", async()=>{
  const q = $("searchInput").value.trim();
  if(!q) return;
  showSpinner(); renderGrid(await tmdbSearch(q));
});
$("searchInput").addEventListener("keydown", e=>{ if(e.key==="Enter") $("searchBtn").click(); });

// Category tabs
document.querySelectorAll(".cat-tab").forEach(t=>{
  t.addEventListener("click", function(){
    document.querySelectorAll(".cat-tab").forEach(x=>x.classList.remove("active"));
    this.classList.add("active");
    loadCat(this.dataset.cat);
  });
});

// Bottom nav (home page)
document.querySelectorAll("#searchPage .nav-item[data-cat]").forEach(n=>{
  n.addEventListener("click", function(e){
    e.preventDefault();
    document.querySelectorAll("#searchPage .nav-item").forEach(x=>x.classList.remove("active"));
    this.classList.add("active");
    const cat = this.dataset.cat;
    if(cat) loadCat(cat);
    document.querySelectorAll(".cat-tab").forEach(t=>{
      t.classList.toggle("active", t.dataset.cat===cat);
    });
  });
});

// Player buttons
$("btnServers").addEventListener("click", ()=>{ buildServers(); open("serverModal"); });
$("closeServer").addEventListener("click", ()=>shut("serverModal"));
$("btnLang").addEventListener("click", ()=>{ buildLangs(); open("langModal"); });
$("closeLang").addEventListener("click", ()=>shut("langModal"));
$("btnScan").addEventListener("click", ()=>{ open("scanModal"); runScan(); });

// Alert
$("alertClose").addEventListener("click", ()=>$("alertBar").classList.add("hidden"));

// Bookmark
$("bmBtn").addEventListener("click", function(){
  if(!media) return;
  bm = !bm;
  this.classList.toggle("on", bm);
  if(bm) wl.push({id:media.id,type:media.type,title:media.title});
  else    wl = wl.filter(w=>w.id!==media.id);
  safeSet("wl", wl);
});

// Back
$("backBtn").addEventListener("click", ()=>{ $("videoFrame").src="about:blank"; show("searchPage"); });
$("playerHome").addEventListener("click", e=>{ e.preventDefault(); $("videoFrame").src="about:blank"; show("searchPage"); });

// Close overlays on backdrop click
["serverModal","scanModal","langModal"].forEach(id=>{
  $(id).addEventListener("click", function(e){
    if(e.target===this){ if(id==="scanModal"&&scanT) clearInterval(scanT); shut(id); }
  });
});

// ── Init — load Hindi trending by default
loadCat("trending");
     
