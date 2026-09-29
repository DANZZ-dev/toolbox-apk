/* =========================================================
   Dev Toolbox — app.js
   Navigasi antar panel + logika tiap tool.
   ========================================================= */

/* ---------- Navigation ---------- */
const railItems = document.querySelectorAll('.rail-item');
const panels = document.querySelectorAll('.panel');
const pathTail = document.getElementById('pathTail');

const panelPathNames = {
  qr: 'qr-generator', text: 'text-encode', color: 'color-tool',
  pass: 'password-gen', json: 'json-formatter', music: 'music-player', clock: 'clock-timer'
};

railItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    railItems.forEach(b => b.classList.toggle('is-active', b === btn));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
    pathTail.textContent = panelPathNames[target] || target;
  });
});

/* =========================================================
   QR GENERATOR
   ========================================================= */
(function qrTool(){
  const tabs = document.querySelectorAll('#qrTabs .tab');
  const fieldGroups = document.querySelectorAll('.qr-fields');
  const holder = document.getElementById('qrCanvasHolder');
  const sizeInput = document.getElementById('qrSize');
  const sizeVal = document.getElementById('qrSizeVal');
  const genBtn = document.getElementById('qrGenerateBtn');
  const downloadBtn = document.getElementById('qrDownloadBtn');
  let mode = 'text';
  let qrInstance = null;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.mode;
      tabs.forEach(t => t.classList.toggle('is-active', t === tab));
      fieldGroups.forEach(g => g.classList.toggle('is-hidden', g.dataset.fields !== mode));
    });
  });

  sizeInput.addEventListener('input', () => sizeVal.textContent = sizeInput.value + 'px');

  function buildPayload(){
    if(mode === 'text'){
      return document.getElementById('qrTextInput').value.trim();
    }
    if(mode === 'wifi'){
      const ssid = document.getElementById('wifiSsid').value.trim();
      const pass = document.getElementById('wifiPass').value.trim();
      const enc = document.getElementById('wifiEnc').value;
      const hidden = document.getElementById('wifiHidden').checked ? 'true' : 'false';
      const escape = s => s.replace(/([\\;,:"])/g, '\\$1');
      return `WIFI:T:${enc};S:${escape(ssid)};P:${escape(pass)};H:${hidden};;`;
    }
    if(mode === 'vcard'){
      const name = document.getElementById('vName').value.trim();
      const phone = document.getElementById('vPhone').value.trim();
      const email = document.getElementById('vEmail').value.trim();
      const org = document.getElementById('vOrg').value.trim();
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    if(mode === 'email'){
      const to = document.getElementById('eTo').value.trim();
      const subject = encodeURIComponent(document.getElementById('eSubject').value.trim());
      const body = encodeURIComponent(document.getElementById('eBody').value.trim());
      return `mailto:${to}?subject=${subject}&body=${body}`;
    }
    return '';
  }

  genBtn.addEventListener('click', () => {
    const payload = buildPayload();
    if(!payload){
      holder.innerHTML = '<span class="qr-placeholder">Isi data terlebih dahulu.</span>';
      downloadBtn.classList.add('is-hidden');
      return;
    }
    const size = parseInt(sizeInput.value, 10);
    holder.innerHTML = '';
    qrInstance = new QRCode(holder, {
      text: payload,
      width: size,
      height: size,
      colorDark: '#0B0D10',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    downloadBtn.classList.remove('is-hidden');
  });

  downloadBtn.addEventListener('click', () => {
    const img = holder.querySelector('img') || holder.querySelector('canvas');
    if(!img) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = img.tagName === 'CANVAS' ? img.toDataURL('image/png') : img.src;
    link.click();
  });
})();

/* =========================================================
   TEXT / ENCODE TOOLS
   ========================================================= */
(function textTools(){
  // Base64
  document.getElementById('b64EncodeBtn').addEventListener('click', () => {
    const input = document.getElementById('b64Input').value;
    const out = document.getElementById('b64Output');
    try{ out.value = btoa(unescape(encodeURIComponent(input))); }
    catch(e){ out.value = 'Error: ' + e.message; }
  });
  document.getElementById('b64DecodeBtn').addEventListener('click', () => {
    const input = document.getElementById('b64Input').value;
    const out = document.getElementById('b64Output');
    try{ out.value = decodeURIComponent(escape(atob(input))); }
    catch(e){ out.value = 'Error: input bukan Base64 yang valid.'; }
  });

  // Case converter
  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('caseInput').value;
      const out = document.getElementById('caseOutput');
      const mode = btn.dataset.case;
      if(mode === 'upper') out.value = input.toUpperCase();
      else if(mode === 'lower') out.value = input.toLowerCase();
      else if(mode === 'title') out.value = input.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
      else if(mode === 'sentence') out.value = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    });
  });

  // Lorem ipsum
  const loremWords = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat'];
  document.getElementById('loremBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById('loremCount').value, 10) || 1;
    const paragraphs = [];
    for(let p = 0; p < count; p++){
      const len = 40 + Math.floor(Math.random() * 30);
      let words = [];
      for(let i = 0; i < len; i++) words.push(loremWords[Math.floor(Math.random()*loremWords.length)]);
      let sentence = words.join(' ');
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
      paragraphs.push(sentence);
    }
    document.getElementById('loremOutput').value = paragraphs.join('\n\n');
  });

  // Timestamp
  document.getElementById('tsToDateBtn').addEventListener('click', () => {
    const val = document.getElementById('tsInput').value;
    const result = document.getElementById('tsResult');
    if(val === '' || isNaN(val)){ result.textContent = 'Masukkan angka timestamp yang valid.'; return; }
    const d = new Date(parseInt(val, 10) * 1000);
    result.textContent = d.toLocaleString('id-ID', { dateStyle:'full', timeStyle:'medium' });
  });
  document.getElementById('tsNowBtn').addEventListener('click', () => {
    document.getElementById('tsInput').value = Math.floor(Date.now()/1000);
  });
})();

/* =========================================================
   COLOR TOOL
   ========================================================= */
(function colorTool(){
  const picker = document.getElementById('colorPicker');
  const preview = document.getElementById('colorPreview');
  const hexOut = document.getElementById('colorHex');
  const rgbOut = document.getElementById('colorRgb');
  const hslOut = document.getElementById('colorHsl');

  function hexToRgb(hex){
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max === min){ h = s = 0; }
    else{
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function update(){
    const hex = picker.value;
    const {r,g,b} = hexToRgb(hex);
    const {h,s,l} = rgbToHsl(r,g,b);
    preview.style.background = hex;
    hexOut.value = hex.toUpperCase();
    rgbOut.value = `rgb(${r}, ${g}, ${b})`;
    hslOut.value = `hsl(${h}, ${s}%, ${l}%)`;
  }
  picker.addEventListener('input', update);
  update();
})();

/* =========================================================
   PASSWORD GENERATOR
   ========================================================= */
(function passwordTool(){
  const lenInput = document.getElementById('passLen');
  const lenVal = document.getElementById('passLenVal');
  const output = document.getElementById('passOutput');
  const genBtn = document.getElementById('passGenBtn');
  const copyBtn = document.getElementById('passCopyBtn');

  lenInput.addEventListener('input', () => lenVal.textContent = lenInput.value);

  genBtn.addEventListener('click', () => {
    const len = parseInt(lenInput.value, 10);
    const useUpper = document.getElementById('passUpper').checked;
    const useLower = document.getElementById('passLower').checked;
    const useNum = document.getElementById('passNum').checked;
    const useSym = document.getElementById('passSym').checked;

    let charset = '';
    if(useUpper) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if(useLower) charset += 'abcdefghijkmnpqrstuvwxyz';
    if(useNum) charset += '23456789';
    if(useSym) charset += '!@#$%^&*()_+-=[]{}';

    if(!charset){ output.value = 'Pilih minimal satu jenis karakter.'; return; }

    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    let result = '';
    for(let i = 0; i < len; i++) result += charset[array[i] % charset.length];
    output.value = result;
  });

  copyBtn.addEventListener('click', () => {
    if(!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = 'Tersalin ✓';
      setTimeout(() => copyBtn.textContent = 'Salin', 1200);
    });
  });
})();

/* =========================================================
   JSON FORMATTER
   ========================================================= */
(function jsonTool(){
  const input = document.getElementById('jsonInput');
  const output = document.getElementById('jsonOutput');
  const status = document.getElementById('jsonStatus');

  document.getElementById('jsonFormatBtn').addEventListener('click', () => {
    try{
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed, null, 2);
      status.textContent = 'Valid ✓';
      status.style.color = 'var(--accent-2)';
    }catch(e){
      status.textContent = 'Error: ' + e.message;
      status.style.color = 'var(--danger)';
      output.value = '';
    }
  });

  document.getElementById('jsonMinifyBtn').addEventListener('click', () => {
    try{
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed);
      status.textContent = 'Valid ✓ (minified)';
      status.style.color = 'var(--accent-2)';
    }catch(e){
      status.textContent = 'Error: ' + e.message;
      status.style.color = 'var(--danger)';
      output.value = '';
    }
  });
})();

/* =========================================================
   MUSIC PLAYER — berbasis YouTube (IFrame Player API)
   - Tempel link (video / playlist) atau cari judul lagu
   - Pencarian: YouTube Data API v3 (jika API key diisi), cadangan
     tanpa key lewat Piped / Invidious
   - Media Session + audio senyap agar kontrol notifikasi/lockscreen
     dan pemutaran latar belakang lebih mungkin bertahan
   ========================================================= */
(function musicPlayer(){
  const $ = id => document.getElementById(id);
  const queryInput = $('ytQuery'), goBtn = $('ytGoBtn'), statusEl = $('ytStatus');
  const queueEl = $('playlist'), trackTitle = $('trackTitle');
  const playBtn = $('playBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const seekBar = $('seekBar'), volumeBar = $('volumeBar');
  const curTime = $('curTime'), durTime = $('durTime');
  const keyInput = $('ytApiKey'), keySaveBtn = $('ytKeySaveBtn');
  const keyClearBtn = $('ytKeyClearBtn'), keyState = $('ytKeyState');

  const KEY_STORE = 'dtb_yt_api_key';
  const PIPED = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de'
  ];
  const INVIDIOUS = [
    'https://inv.nadeko.net',
    'https://yewtu.be',
    'https://invidious.nerdvpn.de'
  ];

  let playerPromise = null, player = null;
  let queue = [], idx = -1, listMode = false;
  let tickTimer = null, seeking = false;
  let userPaused = false, hasPlayed = false, errStreak = 0;
  let keepAlive = null;

  /* ---------- util ---------- */
  const store = {
    get(){ try{ return localStorage.getItem(KEY_STORE) || ''; }catch(e){ return ''; } },
    set(v){ try{ localStorage.setItem(KEY_STORE, v); }catch(e){} },
    del(){ try{ localStorage.removeItem(KEY_STORE); }catch(e){} }
  };
  const setStatus = msg => { statusEl.textContent = msg; };
  const withPlayer = fn => { if(player && player.getPlayerState) fn(player); };

  function formatTime(sec){
    if(!isFinite(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function decodeHtml(s){
    const t = document.createElement('textarea');
    t.innerHTML = s || '';
    return t.value;
  }

  const anyOf = Promise.any
    ? ps => Promise.any(ps)
    : ps => new Promise((res, rej) => {
        let failed = 0;
        ps.forEach(p => p.then(res, () => { if(++failed === ps.length) rej(new Error('all failed')); }));
      });

  async function fetchJson(url, ms){
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms || 6000);
    try{
      const r = await fetch(url, { signal: ctl.signal });
      const data = await r.json().catch(() => null);
      if(!r.ok) throw new Error((data && data.error && data.error.message) || ('HTTP ' + r.status));
      return data;
    } finally { clearTimeout(timer); }
  }

  /* ---------- parsing link YouTube ---------- */
  function parseYouTube(text){
    const s = text.trim();
    let u;
    try{ u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); }catch(e){ return null; }
    const host = u.hostname.replace(/^(www|m|music)\./, '');
    let videoId = null;
    if(host === 'youtu.be'){
      videoId = u.pathname.slice(1).split('/')[0];
    }else if(host === 'youtube.com' || host === 'youtube-nocookie.com'){
      if(u.pathname === '/watch') videoId = u.searchParams.get('v');
      else{
        const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([\w-]{11})/);
        if(m) videoId = m[2];
      }
    }else{
      return null;
    }
    const listId = u.searchParams.get('list');
    if(videoId && /^[\w-]{11}$/.test(videoId)) return { videoId, listId };
    if(listId) return { listId };
    return null;
  }

  /* ---------- pencarian ---------- */
  async function searchApi(q, key){
    const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video'
      + '&videoEmbeddable=true&videoSyndicated=true&maxResults=10'
      + '&q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(key);
    const r = await fetchJson(url, 8000);
    return (r.items || [])
      .filter(i => i.id && i.id.videoId)
      .map(i => ({
        id: i.id.videoId,
        title: decodeHtml(i.snippet.title),
        channel: decodeHtml(i.snippet.channelTitle)
      }));
  }

  function searchFree(q){
    const e = encodeURIComponent(q);
    const jobs = [
      ...PIPED.map(b => fetchJson(`${b}/search?q=${e}&filter=videos`).then(r => {
        const out = (r.items || []).map(x => {
          const m = /[?&]v=([\w-]{11})/.exec(x.url || '');
          return m && { id: m[1], title: x.title || '', channel: x.uploaderName || '' };
        }).filter(Boolean);
        if(!out.length) throw new Error('kosong');
        return out;
      })),
      ...INVIDIOUS.map(b => fetchJson(`${b}/api/v1/search?q=${e}&type=video`).then(r => {
        const out = (Array.isArray(r) ? r : []).filter(x => x.videoId)
          .map(x => ({ id: x.videoId, title: x.title || '', channel: x.author || '' }));
        if(!out.length) throw new Error('kosong');
        return out;
      }))
    ];
    return anyOf(jobs).catch(() => {
      throw new Error('Server pencarian tanpa key sedang tidak bisa diakses. Isi YouTube API key di Pengaturan, atau tempel link langsung.');
    });
  }

  async function search(q){
    const key = store.get();
    if(key){
      try{
        const r = await searchApi(q, key);
        if(r.length) return r;
      }catch(e){
        setStatus('API key gagal (' + e.message + '), mencoba tanpa key…');
      }
    }
    return searchFree(q);
  }

  /* ---------- YouTube IFrame API ---------- */
  let apiPromise = null;
  function loadApi(){
    if(apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      if(window.YT && window.YT.Player) return resolve();
      const prevCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if(prevCb) prevCb(); resolve(); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => { apiPromise = null; reject(new Error('Gagal memuat YouTube API. Periksa koneksi internet.')); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }

  function ensurePlayer(){
    if(playerPromise) return playerPromise;
    playerPromise = loadApi().then(() => new Promise(resolve => {
      const vars = { playsinline: 1, rel: 0, controls: 1 };
      if(/^https?:$/.test(location.protocol)) vars.origin = location.origin;
      player = new YT.Player('ytPlayer', {
        width: '100%', height: '100%', playerVars: vars,
        events: {
          onReady: () => {
            player.setVolume(Math.round(volumeBar.value * 100));
            resolve(player);
          },
          onStateChange: onState,
          onError: onError
        }
      });
    })).catch(err => { playerPromise = null; throw err; });
    return playerPromise;
  }

  /* ---------- mode latar belakang native (APK Capacitor) ---------- */
  const BG = (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
    ? (window.Capacitor.Plugins && window.Capacitor.Plugins.BackgroundMode) : null;
  let bgOn = false;
  async function bgEnable(){
    if(!BG || bgOn) return;
    try{
      try{ await BG.requestNotificationsPermission(); }catch(e){}
      await BG.setSettings({
        title: 'Dev Toolbox',
        text: 'Musik sedang diputar',
        icon: 'icon',
        resume: true,
        silent: false,
        hidden: false,
        disableWebViewOptimization: true
      });
      await BG.enable();
      try{ await BG.disableWebViewOptimizations(); }catch(e){}
      bgOn = true;
    }catch(e){ console.warn('BackgroundMode gagal:', e); }
  }
  async function bgDisable(){
    if(!BG || !bgOn) return;
    try{ await BG.disable(); }catch(e){}
    bgOn = false;
  }
  if(BG){
    try{ BG.addListener('appInBackground', () => { if(!userPaused && hasPlayed) resumeSoon(); }); }catch(e){}
  }

  /* ---------- state player ---------- */
  function onState(e){
    const S = YT.PlayerState;
    if(e.data === S.PLAYING){
      errStreak = 0; hasPlayed = true;
      playBtn.textContent = '⏸';
      startTick(); startKeepAlive(); syncMeta(); bgEnable();
      setStatus('Memutar');
      setSessionState('playing');
    }else if(e.data === S.PAUSED){
      playBtn.textContent = '▶';
      stopKeepAlive();
      setSessionState('paused');
      // Browser kadang menjeda saat halaman di latar belakang: coba lanjutkan
      if(document.hidden && !userPaused && hasPlayed) resumeSoon();
      else if(userPaused) bgDisable();
    }else if(e.data === S.ENDED){
      playBtn.textContent = '▶';
      if(!listMode) next();
    }
  }

  function resumeSoon(){
    setTimeout(() => {
      if(userPaused || !hasPlayed) return;
      withPlayer(p => { if(p.getPlayerState() === YT.PlayerState.PAUSED) p.playVideo(); });
    }, 400);
  }

  document.addEventListener('visibilitychange', () => {
    if(document.hidden && !userPaused && hasPlayed) resumeSoon();
  });

  function onError(e){
    errStreak++;
    let msg = 'Video ini tidak bisa diputar.';
    if(e.data === 100) msg = 'Video tidak ditemukan atau privat.';
    if(e.data === 101 || e.data === 150) msg = 'Pemilik video melarang pemutaran di luar YouTube.';
    if(e.data === 153){
      setStatus('YouTube menolak (error 153). Buka aplikasi lewat http(s)/GitHub Pages, bukan file://.');
      return;
    }
    if(!listMode && idx + 1 < queue.length && errStreak < queue.length){
      setStatus(msg + ' Lanjut ke hasil berikutnya…');
      setTimeout(() => playAt(idx + 1), 700);
    }else{
      setStatus(msg);
    }
  }

  /* ---------- kontrol ---------- */
  function playAt(i){
    if(i < 0 || i >= queue.length) return;
    idx = i; listMode = false; userPaused = false; hasPlayed = false;
    renderQueue();
    trackTitle.textContent = queue[i].title || 'Memuat…';
    updateMediaMeta();
    ensurePlayer()
      .then(p => p.loadVideoById(queue[i].id))
      .catch(e => setStatus(e.message));
  }

  function next(){
    if(listMode){ withPlayer(p => p.nextVideo()); return; }
    if(idx + 1 < queue.length) playAt(idx + 1);
    else setStatus('Sudah di lagu terakhir.');
  }

  function prev(){
    if(listMode){ withPlayer(p => p.previousVideo()); return; }
    if(player && player.getCurrentTime && player.getCurrentTime() > 3){ player.seekTo(0, true); return; }
    if(idx > 0) playAt(idx - 1);
  }

  function togglePlay(){
    if(!player || !player.getPlayerState){
      if(queue.length) playAt(Math.max(idx, 0));
      return;
    }
    const S = YT.PlayerState, st = player.getPlayerState();
    if(st === S.PLAYING || st === S.BUFFERING){ userPaused = true; player.pauseVideo(); }
    else{ userPaused = false; player.playVideo(); }
  }

  async function handleGo(){
    const q = queryInput.value.trim();
    if(!q) return;
    ensurePlayer().catch(() => {}); // dibuat saat masih ada gestur pengguna (izin autoplay)
    const parsed = parseYouTube(q);

    if(parsed && parsed.videoId){
      queue = [{ id: parsed.videoId, title: 'Memuat…', channel: '' }];
      setStatus('Memuat link…');
      playAt(0);
      return;
    }
    if(parsed && parsed.listId){
      listMode = true; idx = 0; userPaused = false; hasPlayed = false;
      queue = [{ id: '', title: 'Playlist YouTube', channel: '' }];
      renderQueue();
      trackTitle.textContent = 'Memuat playlist…';
      setStatus('Memuat playlist… (mix/radio otomatis YouTube tidak didukung)');
      ensurePlayer()
        .then(p => p.loadPlaylist({ listType: 'playlist', list: parsed.listId, index: 0 }))
        .catch(e => setStatus(e.message));
      return;
    }

    setStatus('Mencari…');
    goBtn.disabled = true;
    try{
      const res = await search(q);
      if(!res.length){ setStatus('Tidak ada hasil.'); return; }
      queue = res; errStreak = 0;
      setStatus(`${res.length} hasil, memutar yang paling relevan…`);
      playAt(0);
    }catch(e){
      setStatus(e.message);
    }finally{
      goBtn.disabled = false;
    }
  }

  /* ---------- UI ---------- */
  function renderQueue(){
    queueEl.innerHTML = '';
    queue.forEach((t, i) => {
      const li = document.createElement('li');
      li.classList.toggle('is-playing', i === idx);
      const name = document.createElement('span');
      name.textContent = t.title;
      li.appendChild(name);
      if(t.channel){
        const small = document.createElement('small');
        small.textContent = t.channel;
        li.appendChild(small);
      }
      li.addEventListener('click', () => { if(!listMode) playAt(i); });
      queueEl.appendChild(li);
    });
  }

  function syncMeta(){
    let d = {};
    try{ d = player.getVideoData() || {}; }catch(e){}
    if(!d.title) return;
    if(listMode){
      queue = [{ id: d.video_id || '', title: d.title, channel: d.author || '' }];
      idx = 0; renderQueue();
    }else if(queue[idx] && queue[idx].id === d.video_id && !queue[idx].channel){
      queue[idx].title = d.title; queue[idx].channel = d.author || '';
      renderQueue();
    }
    trackTitle.textContent = d.title;
    updateMediaMeta();
  }

  function startTick(){
    if(tickTimer) return;
    tickTimer = setInterval(updateProgress, 500);
  }

  function updateProgress(){
    if(!player || !player.getDuration || seeking) return;
    const d = player.getDuration() || 0, c = player.getCurrentTime() || 0;
    if(d > 0) seekBar.value = (c / d) * 100;
    curTime.textContent = formatTime(c);
    durTime.textContent = formatTime(d);
    if(d > 0 && 'mediaSession' in navigator && navigator.mediaSession.setPositionState){
      try{ navigator.mediaSession.setPositionState({ duration: d, playbackRate: 1, position: Math.min(c, d) }); }catch(e){}
    }
  }

  /* ---------- latar belakang: Media Session + audio senyap ---------- */
  function makeSilentWav(seconds){
    const rate = 8000, n = rate * seconds;
    const buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => { for(let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, 'data'); v.setUint32(40, n, true);
    new Uint8Array(buf, 44).fill(128);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }

  function startKeepAlive(){
    try{
      if(!keepAlive){
        keepAlive = new Audio();
        keepAlive.loop = true;
        keepAlive.src = makeSilentWav(10);
      }
      keepAlive.play().catch(() => {});
    }catch(e){}
  }
  function stopKeepAlive(){ try{ if(keepAlive) keepAlive.pause(); }catch(e){} }

  function setSessionState(s){
    if('mediaSession' in navigator) navigator.mediaSession.playbackState = s;
  }

  function updateMediaMeta(){
    if(!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const t = queue[idx];
    if(!t) return;
    const art = t.id ? [{ src: `https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }] : [];
    try{
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title, artist: t.channel || 'YouTube', artwork: art
      });
    }catch(e){}
  }

  function setupMediaSession(){
    if(!('mediaSession' in navigator)) return;
    const set = (a, f) => { try{ navigator.mediaSession.setActionHandler(a, f); }catch(e){} };
    set('play', () => { userPaused = false; withPlayer(p => p.playVideo()); });
    set('pause', () => { userPaused = true; withPlayer(p => p.pauseVideo()); });
    set('previoustrack', prev);
    set('nexttrack', next);
  }

  /* ---------- pengaturan API key ---------- */
  function refreshKeyState(){
    keyState.textContent = store.get()
      ? 'API key tersimpan — pencarian memakai YouTube Data API'
      : 'Tanpa API key — pencarian memakai Piped/Invidious';
  }

  /* ---------- event ---------- */
  goBtn.addEventListener('click', handleGo);
  queryInput.addEventListener('keydown', e => { if(e.key === 'Enter') handleGo(); });
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  seekBar.addEventListener('input', () => {
    if(!player || !player.getDuration) return;
    seeking = true;
    curTime.textContent = formatTime((seekBar.value / 100) * (player.getDuration() || 0));
  });
  seekBar.addEventListener('change', () => {
    if(player && player.getDuration && player.getDuration() > 0){
      player.seekTo((seekBar.value / 100) * player.getDuration(), true);
    }
    seeking = false;
  });
  volumeBar.addEventListener('input', () => withPlayer(p => p.setVolume(Math.round(volumeBar.value * 100))));

  keySaveBtn.addEventListener('click', () => {
    const v = keyInput.value.trim();
    if(v){ store.set(v); keyInput.value = ''; }
    refreshKeyState();
  });
  keyClearBtn.addEventListener('click', () => { store.del(); keyInput.value = ''; refreshKeyState(); });

  setupMediaSession();
  refreshKeyState();
})();

/* =========================================================
   CLOCK, STOPWATCH, COUNTDOWN
   ========================================================= */
(function clockTools(){
  // Live clock
  const bigClock = document.getElementById('bigClock');
  const bigDate = document.getElementById('bigDate');
  function tickClock(){
    const now = new Date();
    bigClock.textContent = now.toLocaleTimeString('id-ID', { hour12:false });
    bigDate.textContent = now.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  tickClock();
  setInterval(tickClock, 1000);

  // Stopwatch
  const swDisplay = document.getElementById('stopwatchDisplay');
  const swStartBtn = document.getElementById('swStartBtn');
  const swLapBtn = document.getElementById('swLapBtn');
  const swResetBtn = document.getElementById('swResetBtn');
  const lapList = document.getElementById('lapList');
  let swInterval = null, swElapsed = 0, swRunning = false;

  function formatSw(ms){
    const totalSec = ms/1000;
    const m = Math.floor(totalSec/60).toString().padStart(2,'0');
    const s = Math.floor(totalSec%60).toString().padStart(2,'0');
    const d = Math.floor((ms%1000)/100);
    return `${m}:${s}.${d}`;
  }

  swStartBtn.addEventListener('click', () => {
    if(!swRunning){
      const startedAt = Date.now() - swElapsed;
      swInterval = setInterval(() => {
        swElapsed = Date.now() - startedAt;
        swDisplay.textContent = formatSw(swElapsed);
      }, 100);
      swRunning = true;
      swStartBtn.textContent = 'Jeda';
    }else{
      clearInterval(swInterval);
      swRunning = false;
      swStartBtn.textContent = 'Lanjut';
    }
  });
  swLapBtn.addEventListener('click', () => {
    if(!swRunning) return;
    const li = document.createElement('li');
    li.textContent = formatSw(swElapsed);
    lapList.prepend(li);
  });
  swResetBtn.addEventListener('click', () => {
    clearInterval(swInterval);
    swRunning = false; swElapsed = 0;
    swDisplay.textContent = '00:00.0';
    swStartBtn.textContent = 'Mulai';
    lapList.innerHTML = '';
  });

  // Countdown
  const cdMinutes = document.getElementById('cdMinutes');
  const cdDisplay = document.getElementById('cdDisplay');
  const cdStartBtn = document.getElementById('cdStartBtn');
  const cdResetBtn = document.getElementById('cdResetBtn');
  let cdInterval = null, cdRemaining = 0;

  function formatCd(sec){
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  cdStartBtn.addEventListener('click', () => {
    if(cdInterval){ clearInterval(cdInterval); cdInterval = null; cdStartBtn.textContent = 'Mulai'; return; }
    if(cdRemaining <= 0) cdRemaining = (parseInt(cdMinutes.value, 10) || 0) * 60;
    if(cdRemaining <= 0) return;
    cdStartBtn.textContent = 'Jeda';
    cdInterval = setInterval(() => {
      cdRemaining--;
      cdDisplay.textContent = formatCd(cdRemaining);
      if(cdRemaining <= 0){
        clearInterval(cdInterval);
        cdInterval = null;
        cdStartBtn.textContent = 'Mulai';
        cdDisplay.textContent = 'Selesai!';
      }
    }, 1000);
  });
  cdResetBtn.addEventListener('click', () => {
    clearInterval(cdInterval); cdInterval = null;
    cdRemaining = 0;
    cdDisplay.textContent = formatCd((parseInt(cdMinutes.value, 10) || 0) * 60);
    cdStartBtn.textContent = 'Mulai';
  });
})();
