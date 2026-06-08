/* CineHD v3 — player.js
   - Direct iframe (no proxy)
   - Working servers: vidlink.pro + vidsrc.to
   - Anime section via Consumet
   - Infinite scroll (IntersectionObserver)
*/

const TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const TMDB     = "https://api.themoviedb.org/3";
const IMG      = "https://image.tmdb.org/t/p/w342";
const CONSUMET = "https://consumet-api-pink.vercel.app";

// ── Servers — direct iframe, no proxy, no ads
const SERVERS = [
  {
    id:"vidlink", name:"VidLink HD", badge:"4K", primary:true,
    url:({id,type,s,e}) => type==="tv"
      ? `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=true`
      : `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
  },
  {
    id:"vidsrc", name:"VidSrc", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
      : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id:"embed_su", name:"EmbedSu", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://embed.su/embed/tv/${id}/${s}/${e}`
      : `https://embed.su/embed/movie/${id}`,
  },
  {
    id:"autoembed", name:"AutoEmbed", badge:"HD",
    url:({id,type,s,e}) => type==="tv"
      ? `https://player.autoembed.co/embed/tv/${id}/${s}/${e}`
      : `https://player.autoembed.co/embed/movie/${id}`,
  },
];

const ANIME_SERVERS = [
  {
    id:"ani_vidlink", name:"VidLink", badge:"HD",
    url:({epId}) => `https://vidlink.pro/anime/${epId}?autoplay=true`,
  },
];

const SCAN_NAMES = ["VidLink","VidSrc","EmbedSu","AutoEmbed","MbPly","ZetPly","OrVid","StreamX","MovPlay","CineHD","HdSrc","FastPlay"];

// ── State
let media    = null;
let animeMedia= null;
let selSvr   = "vidlink";
let bm       = false;
let scanT    = null;
let wl       = safeGet("wl",[]);
let page     = { trending:1, bollywood:1, webseries:1, dubbed:1, anime:1 };
let loading  = false;
let curCat   = "trending";
let observer = null;

function safeGet(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}}
function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

const $    = id => document.getElementById(id);
const show = id => { document.querySelectorAll(".page").forEach(p=>p.classList.remove("active")); $(id).classList.add("active"); scrollTo(0,0); };
const open = id => $(id).classList.add("open");
const shut = id => $(id).classList.remove("open");

// ── Embed URL builder
function embedUrl(srv, m) {
  return srv.url({ id:m.id, type:m.type, s:m.season||1, e:m.episode||1, epId:m.epId });
}

// ── Load server
function loadServer(srvId) {
  if (!media && !animeMedia) return;
  const list = (media?.type === "anime" || animeMedia) ? ANIME_SERVERS : SERVERS;
  const srv  = list.find(s => s.id === srvId) || list[0];
  if (!srv) return;
  selSvr = srv.id;

  $("vOverlay").style.display = "none";
  $("vLoading").style.display = "flex";
  $("loadText").textContent   = `Loading ${srv.name}...`;

  const m = animeMedia || media;
  $("videoFrame").src = embedUrl(srv, m);

  setTimeout(() => { $("vLoading").style.display = "none"; }, 5000);
  shut("serverModal");
  buildServers();
}

// ── Open movie/tv player
async function openPlayer(tmdb_id, type) {
  animeMedia = null;
  show("playerPage");
  $("videoFrame").src         = "about:blank";
  $("vOverlay").style.display = "flex";
  $("vLoading").style.display = "none";
  $("mTitle").textContent     = "Loading...";
  $("nwTitle").textContent    = "Loading...";
  $("overview").textContent   = "";

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

    selSvr = "vidlink";
    loadServer(selSvr);
  } catch(e) {
    $("mTitle").textContent   = "Load Error";
    $("overview").textContent = "Internet check करें।";
  }
}

// ── Open anime player
async function openAnime(animeId, title, epNum) {
  media = null;
  show("playerPage");
  $("videoFrame").src         = "about:blank";
  $("vOverlay").style.display = "flex";
  $("vLoading").style.display = "none";
  $("mTitle").textContent     = title;
  $("nwTitle").textContent    = title;
  $("overview").textContent   = "";
  $("mMeta").textContent      = "ANIME";
  $("scanTitle").textContent  = title;

  // Use vidlink anime embed
  animeMedia = { id:animeId, type:"anime", title, epId:animeId, season:1, episode:epNum||1 };

  bm = wl.some(w => w.id === animeId);
  $("bmBtn").classList.toggle("on", bm);

  selSvr = "ani_vidlink";
  loadServer(selSvr);
}

// ── Build server list
function buildServers() {
  const list = animeMedia ? ANIME_SERVERS : SERVERS;
  $("serverList").innerHTML = list.map(s => `
    <div class="s-item ${s.id===selSvr?"sel":""}" onclick="loadServer('${s.id}')">
      <div class="s-radio"><div class="s-dot"></div></div>
      <div class="s-info">
        <div class="s-name">${s.name}${s.primary?'<span class="hindi-tag">हिंदी</span>':""}</div>
        <div class="s-status">● Ready</div>
      </div>
      <span class="s-badge">${s.badge}</span>
    </div>`).join("");
}

// ── Build language grid
function buildLangs() {
  const langs = [
    {code:"hindi",flag:"🇮🇳",name:"Hindi",hi:true,primary:true},
    {code:"tamil",flag:"🇮🇳",name:"Tamil",hi:true},
    {code:"telugu",flag:"🇮🇳",name:"Telugu",hi:true},
    {code:"english",flag:"🇬🇧",name:"English"},
    {code:"french",flag:"🇫🇷",name:"French"},
    {code:"spanish",flag:"🇪🇸",name:"Spanish"},
    {code:"arab",flag:"🇸🇦",name:"Arabic"},
    {code:"brazil",flag:"🇧🇷",name:"Brazil"},
    {code:"russian",flag:"🇷🇺",name:"Russian"},
    {code:"german",flag:"🇩🇪",name:"German"},
    {code:"italian",flag:"🇮🇹",name:"Italian"},
    {code:"japanese",flag:"🇯🇵",name:"Japanese"},
    {code:"korean",flag:"🇰🇷",name:"Korean"},
  ];
  $("langGrid").innerHTML = langs.map(l=>`
    <div class="l-item ${l.hi?"hi-first":""}" onclick="shut('langModal')">
      <span class="l-flag">${l.flag}</span>
      <span class="l-name">${l.name}</span>
      ${l.primary?'<span class="l-primary">🇮🇳 Main</span>':""}
    </div>`).join("");
}

// ── Smart Scan
function runScan() {
  if (scanT) clearInterval(scanT);
  let done=0, ci=0; const T=41;
  $("progFill").style.width="0%";
  $("analyzed").textContent="0 ANALYZED";
  $("remaining").textContent=T+" REMAINING";
  $("scanStatus").textContent="Scanning high-speed servers...";
  $("scanGrid").innerHTML="";
  scanT = setInterval(()=>{
    done++;
    $("progFill").style.width=Math.round(done/T*100)+"%";
    $("analyzed").textContent=done+" ANALYZED";
    $("remaining").textContent=Math.max(0,T-done)+" REMAINING";
    if(done%3===0 && ci<SCAN_NAMES.length){
      const c=document.createElement("div");
      c.className="sc-card";
      c.innerHTML=`<div class="sc-check">✓</div><div class="sc-name">${SCAN_NAMES[ci]}</div>`;
      $("scanGrid").appendChild(c); ci++;
    }
    if(done>=T){clearInterval(scanT);$("scanStatus").textContent=`✅ ${ci} servers found!`;}
  },110);
}

// ── TMDB helpers
async function tmdbSearch(q) {
  const r = await fetch(`${TMDB}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=false`);
  const d = await r.json();
  return (d.results||[]).filter(x=>x.media_type==="movie"||x.media_type==="tv");
}

async function tmdbCat(cat, pg=1) {
  const urls = {
    trending : `${TMDB}/trending/all/week?api_key=${TMDB_KEY}&page=${pg}`,
    bollywood: `${TMDB}/discover/movie?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${pg}`,
    webseries: `${TMDB}/discover/tv?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${pg}`,
    dubbed   : `${TMDB}/trending/movie/week?api_key=${TMDB_KEY}&page=${pg}`,
  };
  const r = await fetch(urls[cat]);
  const d = await r.json();
  return (d.results||[]).map(x=>({...x, media_type:x.media_type||(x.first_air_date?"tv":"movie")}));
}

// ── Anime fetch via Consumet
async function fetchAnime(pg=1) {
  try {
    const r = await fetch(`${CONSUMET}/anime/gogoanime/top-airing?page=${pg}`);
    const d = await r.json();
    return (d.results||[]);
  } catch(e) {
    // fallback: TMDB anime
    const r = await fetch(`${TMDB}/discover/tv?api_key=${TMDB_KEY}&with_genres=16&sort_by=popularity.desc&page=${pg}`);
    const d = await r.json();
    return (d.results||[]).map(x=>({
      id:x.id, title:x.name, image:x.poster_path?IMG+x.poster_path:"",
      isTmdb:true, media_type:"tv"
    }));
  }
}

// ── Render helpers
const BLANK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150'%3E%3Crect fill='%23181d2c' width='100' height='150'/%3E%3Ctext fill='%237a8499' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='26'%3E🎬%3C/text%3E%3C/svg%3E`;

function makeCard(item, type="movie") {
  if (type === "anime") {
    const title = (item.title||"Unknown").replace(/"/g,"&quot;");
    const img   = item.image || BLANK;
    const isTmdb = item.isTmdb;
    const onclick = isTmdb
      ? `openPlayer(${item.id},'tv')`
      : `openAnime('${item.id}','${title.replace(/'/g,"\\'")}',1)`;
    return `
      <div class="card" onclick="${onclick}">
        <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='${BLANK}'"/>
        <div class="card-info">
          <div class="card-title">${title}</div>
          <div class="card-year">ANIME</div>
          <span class="card-badge tv">ANI</span>
        </div>
      </div>`;
  }
  const title = (item.title||item.name||"Unknown").replace(/"/g,"&quot;");
  const year  = (item.release_date||item.first_air_date||"").slice(0,4);
  const poster= item.poster_path ? IMG+item.poster_path : BLANK;
  const t     = item.media_type||type;
  const isHI  = item.original_language==="hi";
  return `
    <div class="card" onclick="openPlayer(${item.id},'${t}')">
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='${BLANK}'"/>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-year">${year}${isHI?" 🇮🇳":""}</div>
        <span class="card-badge ${t==="tv"?"tv":""}">${t==="tv"?"TV":"MOVIE"}</span>
      </div>
    </div>`;
}

function showSpinner(append=false) {
  if (!append) {
    $("searchResults").innerHTML=`<div class="load-wrap" style="grid-column:1/-1"><div class="spin"></div></div>`;
    $("emptyMsg").style.display="none";
  } else {
    const d=document.createElement("div");
    d.id="loadMoreSpinner"; d.className="load-wrap"; d.style.gridColumn="1/-1";
    d.innerHTML='<div class="spin"></div>';
    $("searchResults").appendChild(d);
  }
}

function removeSpinner() {
  const s=$("loadMoreSpinner"); if(s) s.remove();
}

function renderCards(items, type="movie", append=false) {
  removeSpinner();
  const g=$("searchResults"), e=$("emptyMsg");
  if (!append) { g.innerHTML=""; e.style.display="none"; }
  if (!items.length && !append){ e.style.display="flex"; return; }
  items.forEach(item=>{
    const div=document.createElement("div");
    div.innerHTML=makeCard(item, type);
    g.appendChild(div.firstElementChild);
  });
  setupObserver();
}

// ── Infinite scroll observer
function setupObserver() {
  if (observer) observer.disconnect();
  // sentinel
  let sentinel = $("scrollSentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "scrollSentinel";
    sentinel.style.cssText = "height:1px;grid-column:1/-1;";
    $("searchResults").appendChild(sentinel);
  }
  observer = new IntersectionObserver(entries=>{
    if (entries[0].isIntersecting && !loading) loadMore();
  },{rootMargin:"200px"});
  observer.observe(sentinel);
}

async function loadMore() {
  if (loading) return;
  loading = true;
  showSpinner(true);
  try {
    if (curCat === "anime") {
      page.anime++;
      const items = await fetchAnime(page.anime);
      renderCards(items, "anime", true);
    } else {
      page[curCat]++;
      const items = await tmdbCat(curCat, page[curCat]);
      renderCards(items, "movie", true);
    }
  } catch(e){}
  loading = false;
}

async function loadCat(cat) {
  curCat = cat;
  page[cat] = 1;
  loading = false;
  if (observer) observer.disconnect();

  showSpinner(false);

  let items=[], type="movie";
  if (cat === "anime") {
    items = await fetchAnime(1);
    type  = "anime";
  } else {
    items = await tmdbCat(cat, 1);
  }
  const labels={trending:"🔥 Trending",bollywood:"🎬 Bollywood",webseries:"📺 Web Series",dubbed:"🌐 Dubbed",anime:"🎌 Anime"};
  $("searchResults").innerHTML=`<div class="sec-title" style="grid-column:1/-1">${labels[cat]||""}</div>`;
  $("emptyMsg").style.display="none";
  renderCards(items, type, true);
}

// ── Search
let sTimer;
$("searchInput").addEventListener("input", function(){
  clearTimeout(sTimer);
  const q=this.value.trim();
  if(!q){loadCat(curCat);return;}
  sTimer=setTimeout(async()=>{
    if(observer) observer.disconnect();
    showSpinner(false);
    const items=await tmdbSearch(q);
    $("searchResults").innerHTML="";
    $("emptyMsg").style.display="none";
    renderCards(items,"movie",true);
  },400);
});
$("searchBtn").addEventListener("click",async()=>{
  const q=$("searchInput").value.trim();
  if(!q)return;
  if(observer)observer.disconnect();
  showSpinner(false);
  const items=await tmdbSearch(q);
  $("searchResults").innerHTML="";
  renderCards(items,"movie",true);
});
$("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("searchBtn").click();});

// ── Category tabs
document.querySelectorAll(".cat-tab").forEach(t=>{
  t.addEventListener("click",function(){
    document.querySelectorAll(".cat-tab").forEach(x=>x.classList.remove("active"));
    this.classList.add("active");
    loadCat(this.dataset.cat);
  });
});

// ── Bottom nav
document.querySelectorAll("#searchPage .nav-item[data-cat]").forEach(n=>{
  n.addEventListener("click",function(e){
    e.preventDefault();
    document.querySelectorAll("#searchPage .nav-item").forEach(x=>x.classList.remove("active"));
    this.classList.add("active");
    const cat=this.dataset.cat;
    if(cat){loadCat(cat);}
    document.querySelectorAll(".cat-tab").forEach(t=>t.classList.toggle("active",t.dataset.cat===cat));
  });
});

// ── Player buttons
$("btnServers").addEventListener("click",()=>{buildServers();open("serverModal");});
$("closeServer").addEventListener("click",()=>shut("serverModal"));
$("btnLang").addEventListener("click",()=>{buildLangs();open("langModal");});
$("closeLang").addEventListener("click",()=>shut("langModal"));
$("btnScan").addEventListener("click",()=>{open("scanModal");runScan();});
$("alertClose").addEventListener("click",()=>$("alertBar").classList.add("hidden"));

// ── Bookmark
$("bmBtn").addEventListener("click",function(){
  const m=animeMedia||media; if(!m)return;
  bm=!bm; this.classList.toggle("on",bm);
  if(bm) wl.push({id:m.id,type:m.type,title:m.title});
  else   wl=wl.filter(w=>w.id!==m.id);
  safeSet("wl",wl);
});

// ── Back
$("backBtn").addEventListener("click",()=>{$("videoFrame").src="about:blank";show("searchPage");});
$("playerHome").addEventListener("click",e=>{e.preventDefault();$("videoFrame").src="about:blank";show("searchPage");});

// ── Close overlays
["serverModal","scanModal","langModal"].forEach(id=>{
  $(id).addEventListener("click",function(e){
    if(e.target===this){if(id==="scanModal"&&scanT)clearInterval(scanT);shut(id);}
  });
});

// ── Init
loadCat("trending");
                
