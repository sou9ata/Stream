<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CineHD – Movies, Series & Anime</title>
  <style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08090f;--sur:#111520;--sur2:#181d2c;--bdr:#1e2535;
  --acc:#f5a623;--pur:#6c3fd4;--pur2:#8b5cf6;
  --grn:#22c55e;--txt:#e8eaf2;--sub:#7a8499;
}
html,body{background:var(--bg);color:var(--txt);font-family:'Outfit',sans-serif;
  min-height:100vh;max-width:480px;margin:0 auto;overflow-x:hidden;}
.page{display:none;flex-direction:column;min-height:100vh;}
.page.active{display:flex;}

/* HEADER */
.site-header{background:var(--sur);border-bottom:1px solid var(--bdr);
  padding:10px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  position:sticky;top:0;z-index:100;}
.logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;color:#fff;flex-shrink:0;}
.logo span{color:var(--acc);}
.hindi-badge{background:linear-gradient(135deg,#ff9933,#138808);color:#fff;
  font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;flex-shrink:0;}
.header-search{display:flex;flex:1;min-width:150px;background:var(--sur2);
  border:1px solid var(--bdr);border-radius:8px;overflow:hidden;}
.header-search input{flex:1;background:none;border:none;color:var(--txt);
  padding:8px 12px;font-size:13px;font-family:'Outfit',sans-serif;outline:none;}
.header-search input::placeholder{color:var(--sub);}
.header-search button{background:var(--acc);border:none;color:#000;
  padding:0 12px;font-size:14px;cursor:pointer;}

/* TABS */
.cat-tabs{display:flex;overflow-x:auto;scrollbar-width:none;
  background:var(--sur);border-bottom:1px solid var(--bdr);padding:0 8px;}
.cat-tabs::-webkit-scrollbar{display:none;}
.cat-tab{background:none;border:none;color:var(--sub);padding:10px 13px;
  font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;
  white-space:nowrap;border-bottom:2px solid transparent;transition:all 0.2s;}
.cat-tab.active,.cat-tab:hover{color:var(--acc);border-bottom-color:var(--acc);}

/* RESULTS */
.results-wrap{flex:1;padding:10px 12px 90px;overflow-y:auto;}
.results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.card{background:var(--sur2);border-radius:10px;overflow:hidden;cursor:pointer;
  border:1px solid var(--bdr);transition:transform 0.2s,border-color 0.2s;}
.card:hover{transform:scale(1.03);border-color:var(--acc);}
.card img{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;background:var(--sur2);}
.card-info{padding:5px 7px 7px;}
.card-title{font-size:11px;font-weight:600;color:var(--txt);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.card-year{font-size:10px;color:var(--sub);margin-top:2px;}
.card-badge{display:inline-block;font-size:9px;font-weight:700;
  padding:1px 5px;border-radius:4px;margin-top:3px;background:var(--acc);color:#000;}
.card-badge.tv{background:var(--pur2);color:#fff;}
.sec-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1.5px;
  color:#fff;padding:10px 0 6px;grid-column:1/-1;}
.sec-title span{color:var(--acc);}

/* LOADING */
.load-wrap{display:flex;justify-content:center;padding:40px;grid-column:1/-1;}
.spin{width:30px;height:30px;border:3px solid var(--bdr);
  border-top-color:var(--acc);border-radius:50%;animation:spin 0.7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-msg{display:flex;flex-direction:column;align-items:center;
  gap:10px;padding:40px;text-align:center;color:var(--sub);font-size:28px;}
.empty-msg p{font-size:14px;}

/* TOPBAR */
.topbar{display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;background:rgba(8,9,15,.97);
  position:sticky;top:0;z-index:100;border-bottom:1px solid var(--bdr);}
.topbar-url{font-size:13px;font-weight:600;color:var(--sub);}
.icon-btn{background:none;border:none;color:var(--txt);font-size:18px;
  cursor:pointer;padding:6px 8px;border-radius:6px;transition:background 0.2s;}
.icon-btn:hover{background:var(--sur2);}

/* ALERT */
.alert-bar{display:flex;align-items:center;justify-content:space-between;
  background:linear-gradient(90deg,#b71c1c,#e53935);color:#fff;
  padding:9px 14px;font-size:12px;font-weight:500;gap:10px;
  transition:max-height .3s,padding .3s,opacity .3s;max-height:50px;overflow:hidden;}
.alert-bar.hidden{max-height:0;padding:0;opacity:0;}
.alert-bar button{background:none;border:none;color:#fff;font-size:15px;cursor:pointer;flex-shrink:0;}

/* VIDEO */
.video-wrap{background:#000;}
.now-watching{text-align:center;font-size:12px;font-weight:600;color:var(--txt);
  padding:6px 0;background:rgba(8,9,15,.92);}
.video-box{position:relative;width:100%;aspect-ratio:16/9;background:#000;overflow:hidden;}
.video-box iframe{width:100%;height:100%;border:none;display:block;}
.v-overlay{position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;background:rgba(0,0,0,.82);gap:10px;}
.v-play{font-size:48px;color:rgba(255,255,255,.4);}
.v-overlay p{font-size:12px;color:var(--sub);}

/* INFO */
.info-row{display:flex;justify-content:space-between;align-items:flex-start;
  padding:10px 14px 5px;background:var(--sur);border-bottom:1px solid var(--bdr);}
.m-title{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1.5px;color:#fff;}
.m-meta{font-size:11px;color:var(--sub);font-weight:500;margin-top:2px;letter-spacing:.7px;}
.bm-btn{background:var(--sur2);border:1px solid var(--bdr);color:var(--txt);
  font-size:17px;width:36px;height:36px;border-radius:8px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;}
.bm-btn.on{color:var(--acc);border-color:var(--acc);}

/* PILLS */
.pills-row{display:flex;gap:8px;padding:10px 14px;
  background:var(--sur);border-bottom:1px solid var(--bdr);overflow-x:auto;scrollbar-width:none;}
.pills-row::-webkit-scrollbar{display:none;}
.pill{display:flex;align-items:center;gap:5px;background:var(--sur2);
  border:1px solid var(--bdr);color:var(--sub);padding:7px 14px;
  border-radius:30px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;
  cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0;}
.pill.active,.pill:hover{background:var(--acc);border-color:var(--acc);color:#000;}

.overview{padding:12px 14px 100px;font-size:13px;color:var(--sub);line-height:1.6;}

/* OVERLAY / SHEET */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);
  z-index:500;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
.overlay.open{display:flex;animation:fIn .2s ease;}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.sheet{background:var(--sur);width:100%;max-width:480px;border-radius:18px 18px 0 0;
  overflow:hidden;max-height:85vh;display:flex;flex-direction:column;
  animation:sUp .28s cubic-bezier(.32,1.15,.6,1);}
@keyframes sUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
.sheet-head{display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;font-size:15px;font-weight:700;color:#fff;flex-shrink:0;
  background:linear-gradient(90deg,var(--pur),var(--pur2));}
.x-btn{background:rgba(0,0,0,.3);border:none;color:#fff;
  width:26px;height:26px;border-radius:50%;font-size:13px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;}
.lang-head{cursor:pointer;gap:10px;justify-content:flex-start;}
.x-btn-sm{background:rgba(0,0,0,.3);border:none;color:#fff;
  width:24px;height:24px;border-radius:50%;font-size:12px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;}

/* SERVER LIST */
.server-list{overflow-y:auto;flex:1;padding:8px 12px;}
.s-item{display:flex;align-items:center;gap:12px;padding:11px 13px;
  border-radius:10px;margin-bottom:7px;cursor:pointer;
  border:2px solid transparent;background:var(--sur2);transition:all .2s;}
.s-item:hover{border-color:var(--pur);}
.s-item.sel{background:var(--acc);border-color:var(--acc);}
.s-item.sel .s-name,.s-item.sel .s-status{color:#000;}
.s-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--bdr);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.s-item.sel .s-radio{background:#000;border-color:#000;}
.s-dot{width:8px;height:8px;background:var(--acc);border-radius:50%;display:none;}
.s-item.sel .s-dot{display:block;}
.s-info{flex:1;}
.s-name{font-size:13px;font-weight:700;color:var(--txt);}
.s-status{font-size:11px;color:var(--grn);margin-top:2px;}
.s-item.sel .s-status{color:#000;}
.s-badge{font-size:10px;padding:2px 7px;border-radius:20px;
  background:var(--sur);color:var(--sub);border:1px solid var(--bdr);}
.s-item.sel .s-badge{background:rgba(0,0,0,.15);color:#000;border-color:rgba(0,0,0,.2);}
.hindi-tag{font-size:9px;padding:1px 5px;border-radius:3px;
  background:linear-gradient(135deg,#ff9933,#138808);color:#fff;font-weight:700;margin-left:4px;}
.app-banner{display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;background:var(--sur2);border-top:1px solid var(--bdr);flex-shrink:0;}
.app-banner strong{font-size:13px;color:var(--txt);display:block;}
.app-banner small{font-size:11px;color:var(--sub);}
.app-install-btn{background:var(--acc);border:none;color:#000;font-weight:700;
  font-size:12px;padding:8px 14px;border-radius:8px;cursor:pointer;}

/* SCAN */
.scan-wrap{padding:18px 14px;text-align:center;flex:1;overflow-y:auto;}
.scan-title{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:2px;color:#fff;margin-bottom:5px;}
.scan-status{font-size:12px;color:var(--sub);margin-bottom:14px;}
.prog-bar{width:100%;height:4px;background:var(--bdr);border-radius:2px;overflow:hidden;margin-bottom:6px;}
.prog-fill{height:100%;background:var(--acc);border-radius:2px;width:0%;transition:width .3s;}
.prog-nums{display:flex;justify-content:space-between;font-size:10px;
  font-weight:700;color:var(--sub);letter-spacing:.7px;margin-bottom:16px;}
.scan-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;}
.sc-card{background:var(--sur2);border:1px solid var(--grn);border-radius:9px;
  padding:9px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:5px;
  animation:pIn .3s cubic-bezier(.32,1.15,.6,1) both;}
@keyframes pIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.sc-check{width:22px;height:22px;background:var(--grn);border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;}
.sc-name{font-size:9px;font-weight:600;color:var(--grn);text-align:center;word-break:break-word;}

/* LANG */
.lang-info{padding:8px 14px 3px;flex-shrink:0;}
.lang-info h3{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1.5px;}
.lang-info p{font-size:10px;color:var(--sub);letter-spacing:.7px;margin-top:2px;}
.lang-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;
  padding:10px 12px 60px;overflow-y:auto;flex:1;}
.l-item{background:var(--sur2);border:2px solid var(--bdr);border-radius:9px;
  padding:11px 6px 9px;display:flex;flex-direction:column;align-items:center;
  gap:5px;cursor:pointer;transition:all .2s;position:relative;}
.l-item:hover,.l-item.on{border-color:var(--pur2);background:rgba(139,92,246,.1);}
.l-item.on::after{content:'✓';position:absolute;top:5px;right:7px;
  font-size:11px;color:var(--grn);font-weight:700;}
.l-item.hi-first{border-color:rgba(255,153,51,.4);}
.l-item.hi-first.on{border-color:#ff9933;}
.l-flag{font-size:22px;}
.l-name{font-size:11px;font-weight:600;color:var(--txt);text-align:center;}
.l-primary{font-size:9px;color:var(--acc);font-weight:700;}

/* FAB */
.fab{position:fixed;bottom:72px;right:14px;width:46px;height:46px;
  background:#2563eb;border:none;border-radius:50%;color:#fff;font-size:20px;
  cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,.5);z-index:400;}

/* BOTTOM NAV */
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:480px;background:rgba(8,9,15,.98);
  border-top:1px solid var(--bdr);display:flex;z-index:300;backdrop-filter:blur(8px);}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:7px 2px;text-decoration:none;color:var(--sub);font-size:10px;font-weight:500;transition:color .2s;}
.nav-item.active{color:var(--acc);}
.nav-item span:first-child{font-size:18px;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:2px;}

</style>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
</head>
<body>

<!-- ══ HOME PAGE ══ -->
<div id="searchPage" class="page active">
  <header class="site-header">
    <div class="logo">Cine<span>HD</span></div>
    <div class="hindi-badge">🇮🇳 Hindi</div>
    <div class="header-search">
      <input type="text" id="searchInput" placeholder="Search movies, series, anime..." autocomplete="off"/>
      <button id="searchBtn">🔍</button>
    </div>
  </header>

  <div class="cat-tabs">
    <button class="cat-tab active" data-cat="trending">🔥 Trending</button>
    <button class="cat-tab" data-cat="bollywood">🎬 Bollywood</button>
    <button class="cat-tab" data-cat="webseries">📺 Web Series</button>
    <button class="cat-tab" data-cat="dubbed">🌐 Dubbed</button>
    <button class="cat-tab" data-cat="anime">🎌 Anime</button>
  </div>

  <div class="results-wrap">
    <div id="searchResults" class="results-grid"></div>
    <div id="emptyMsg" class="empty-msg" style="display:none">
      <div>😕</div><p>No results found</p>
    </div>
  </div>

  <nav class="bottom-nav">
    <a href="#" class="nav-item active" data-cat="trending"><span>🏠</span><span>Home</span></a>
    <a href="#" class="nav-item" id="navSearch"><span>🔍</span><span>Search</span></a>
    <a href="#" class="nav-item" data-cat="bollywood"><span>🎬</span><span>Movies</span></a>
    <a href="#" class="nav-item" data-cat="webseries"><span>📺</span><span>Series</span></a>
    <a href="#" class="nav-item" data-cat="anime"><span>🎌</span><span>Anime</span></a>
  </nav>
</div>

<!-- ══ PLAYER PAGE ══ -->
<div id="playerPage" class="page">

  <header class="topbar">
    <button class="icon-btn" id="backBtn">←</button>
    <span class="topbar-url">cinehd.app</span>
    <div style="display:flex;gap:6px">
      <button class="icon-btn">⬆</button>
      <button class="icon-btn">⋮</button>
    </div>
  </header>

  <div class="alert-bar" id="alertBar">
    <span>🔔 Server काम नहीं? दूसरा server try करें।</span>
    <button id="alertClose">✕</button>
  </div>

  <div class="video-wrap">
    <div class="now-watching">Now Watching: <span id="nwTitle">—</span></div>
    <div class="video-box">
      <iframe id="videoFrame" src="about:blank" frameborder="0" allowfullscreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerpolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation">
      </iframe>
      <div class="v-overlay" id="vOverlay">
        <div class="v-play">▶</div>
        <p>Server select करें</p>
      </div>
      <div class="v-overlay" id="vLoading" style="display:none">
        <div class="spin"></div>
        <p id="loadText">Loading...</p>
      </div>
    </div>
  </div>

  <div class="info-row">
    <div>
      <h2 class="m-title" id="mTitle">—</h2>
      <p class="m-meta" id="mMeta">MOVIE</p>
    </div>
    <button class="bm-btn" id="bmBtn">🔖</button>
  </div>

  <div class="pills-row">
    <button class="pill active" id="btnServers">▶ Servers</button>
    <button class="pill" id="btnLang">🌐 Language</button>
    <button class="pill" id="btnScan">🔍 Smart Scan</button>
  </div>

  <p class="overview" id="overview"></p>

  <!-- SERVER MODAL -->
  <div class="overlay" id="serverModal">
    <div class="sheet">
      <div class="sheet-head">
        <span>⚙ Select a server</span>
        <button class="x-btn" id="closeServer">✕</button>
      </div>
      <div class="server-list" id="serverList"></div>
      <div class="app-banner">
        <div><strong>Get CineHD App</strong><br><small>For Phones &amp; TV</small></div>
        <button class="app-install-btn">⬇ Install</button>
      </div>
    </div>
  </div>

  <!-- SCAN MODAL -->
  <div class="overlay" id="scanModal">
    <div class="sheet">
      <div class="sheet-head"><span>⚙ Select a server</span></div>
      <div class="scan-wrap">
        <h2 class="scan-title" id="scanTitle">—</h2>
        <p class="scan-status" id="scanStatus">Scanning high-speed servers...</p>
        <div class="prog-bar"><div class="prog-fill" id="progFill"></div></div>
        <div class="prog-nums">
          <span id="analyzed">0 ANALYZED</span>
          <span id="remaining">41 REMAINING</span>
        </div>
        <div class="scan-grid" id="scanGrid"></div>
      </div>
    </div>
  </div>

  <!-- LANG MODAL -->
  <div class="overlay" id="langModal">
    <div class="sheet">
      <div class="sheet-head lang-head" id="closeLang">
        <button class="x-btn-sm">✕</button>
        <span>Language / भाषा</span>
      </div>
      <div class="lang-info">
        <h3 id="langTitle">—</h3>
        <p id="langMeta">MOVIE</p>
      </div>
      <div class="lang-grid" id="langGrid"></div>
    </div>
  </div>

  <button class="fab">🤖</button>

  <nav class="bottom-nav">
    <a href="#" class="nav-item" id="playerHome"><span>🏠</span><span>Home</span></a>
    <a href="#" class="nav-item"><span>🔍</span><span>Search</span></a>
    <a href="#" class="nav-item"><span>🎬</span><span>Movies</span></a>
    <a href="#" class="nav-item"><span>📺</span><span>Series</span></a>
    <a href="#" class="nav-item"><span>🎌</span><span>Anime</span></a>
  </nav>
</div>

<script>
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

cons
