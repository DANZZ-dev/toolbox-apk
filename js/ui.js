/* =========================================================
   Dev Toolbox — ui.js
   Lapisan tampilan saja (animasi, indikator, efek interaktif).
   Tidak mengubah logika di app.js: hanya MEMBACA / MENGAMATI DOM
   lalu menambahkan class atau CSS variable. Jika file ini gagal
   dimuat, semua tool tetap berfungsi normal.
   ========================================================= */
(function(){
  'use strict';
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const safe = fn => { try{ fn(); }catch(e){ console.warn('[ui]', e); } };
  const observe = (el, cb, opts) => { if(el) new MutationObserver(cb).observe(el, opts); };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- 1. Tema per tool + efek ketik pada path ---------- */
  safe(() => {
    const items = $$('.rail-item');
    const sync = () => {
      const a = items.find(i => i.classList.contains('is-active'));
      if(a) document.body.dataset.tool = a.dataset.target;
    };
    sync();
    items.forEach(i => observe(i, sync, { attributes: true, attributeFilter: ['class'] }));

    const tail = $('#pathTail');
    observe(tail, () => restart(tail, 'is-typing'), { childList: true, characterData: true, subtree: true });
  });

  /* ---------- 2. Indikator geser (dock & tab) ---------- */
  function slider(container, itemSel, cls){
    if(!container) return;
    const ind = document.createElement('span');
    ind.className = cls;
    container.prepend(ind);
    const place = () => {
      const a = container.querySelector(itemSel + '.is-active');
      if(!a || !a.offsetWidth) return;
      ind.style.width  = a.offsetWidth + 'px';
      ind.style.height = cls === 'nav-indicator' ? a.offsetHeight + 'px' : '';
      ind.style.transform = `translate(${a.offsetLeft}px, ${cls === 'nav-indicator' ? a.offsetTop : 0}px)`;
      if(a.scrollIntoView && container.scrollWidth > container.clientWidth){
        container.scrollTo({ left: a.offsetLeft - 12, behavior: 'smooth' });
      }
    };
    place();
    container.classList.add('has-indicator');
    requestAnimationFrame(() => requestAnimationFrame(() => { place(); ind.classList.add('is-ready'); }));
    $$(itemSel, container).forEach(i => observe(i, place, { attributes: true, attributeFilter: ['class'] }));
    if('ResizeObserver' in window) new ResizeObserver(place).observe(container);
    window.addEventListener('resize', place);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }
  safe(() => slider($('.railbar'), '.rail-item', 'nav-indicator'));
  safe(() => slider($('#qrTabs'), '.tab', 'tab-indicator'));

  /* ---------- 3. Isi track slider (--p) ---------- */
  safe(() => {
    const ranges = $$('input[type=range]');
    const paint = r => {
      const min = +r.min || 0, max = +r.max || 100;
      const p = max > min ? ((+r.value - min) / (max - min)) * 100 : 0;
      const v = p.toFixed(2) + '%';
      if(r.style.getPropertyValue('--p') !== v) r.style.setProperty('--p', v);
    };
    ranges.forEach(r => { paint(r); r.addEventListener('input', () => paint(r)); });
    // seekBar diubah lewat kode (tanpa event) -> cek berkala yang ringan
    setInterval(() => ranges.forEach(paint), 250);
  });

  /* ---------- 4. Sorotan kartu mengikuti kursor / sentuhan ---------- */
  safe(() => {
    let lit = null;
    const light = e => {
      const c = e.target.closest && e.target.closest('.card');
      if(lit && lit !== c) lit.classList.remove('is-lit');
      lit = c;
      if(!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      c.classList.add('is-lit');
    };
    document.addEventListener('pointermove', light, { passive: true });
    document.addEventListener('pointerdown', light, { passive: true });
    document.addEventListener('pointerup', e => { if(e.pointerType !== 'mouse'){ const c = lit; setTimeout(() => c && c.classList.remove('is-lit'), 450); } }, { passive: true });
    document.addEventListener('pointerleave', () => lit && lit.classList.remove('is-lit'));
  });

  /* ---------- 5. Riak (ripple) pada tombol ---------- */
  safe(() => {
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('.btn-primary, .btn-secondary, .btn-ghost');
      if(!b || b.disabled) return;
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
      b.appendChild(s);
      setTimeout(() => s.remove(), 650);
    }, { passive: true });
  });

  /* ---------- 6. Cahaya warna pada Color Tool ---------- */
  safe(() => {
    const prev = $('#colorPreview'), body = $('.color-body');
    if(!prev || !body) return;
    const apply = () => { const c = prev.style.background || prev.style.backgroundColor; if(c) body.style.setProperty('--c', c); };
    apply();
    observe(prev, apply, { attributes: true, attributeFilter: ['style'] });
  });

  /* ---------- 7. Status pemutar musik (ikon play/pause, equalizer) ---------- */
  safe(() => {
    const btn = $('#playBtn'), player = $('.player');
    if(!btn) return;
    const apply = () => {
      const st = btn.textContent.indexOf('⏸') > -1 ? 'playing' : 'paused';
      btn.dataset.state = st;
      if(player) player.dataset.state = st;
    };
    apply();
    observe(btn, apply, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- 8. Jam: garis detik, status berjalan / selesai ---------- */
  safe(() => {
    const ring = $('.clock-ring'), panel = $('#panel-clock');
    if(ring && panel){
      const loop = () => {
        if(panel.classList.contains('is-active')){
          ring.style.setProperty('--sec', ((Date.now() % 60000) / 600).toFixed(2));
          requestAnimationFrame(loop);
        }else setTimeout(loop, 400);
      };
      loop();
    }
    const runFlag = (btnSel) => {
      const b = $(btnSel); if(!b) return;
      const card = b.closest('.card');
      const apply = () => card && card.classList.toggle('is-running', b.textContent.trim() === 'Jeda');
      apply();
      observe(b, apply, { childList: true, characterData: true, subtree: true });
    };
    runFlag('#swStartBtn');
    runFlag('#cdStartBtn');
    const cd = $('#cdDisplay');
    const done = () => cd && cd.classList.toggle('is-done', cd.textContent.trim() === 'Selesai!');
    observe(cd, done, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- 9. Umpan balik hasil (flash output, status, tombol ✓) ---------- */
  safe(() => {
    // status / result-line
    $$('.result-line').forEach(el => observe(el, () => restart(el, 'flash'), { childList: true, characterData: true, subtree: true }));

    // kolom hasil (readonly) berkedip saat isinya berubah setelah klik tombol
    const outs = $$('textarea[readonly], input[readonly]');
    const last = new Map(outs.map(o => [o, o.value]));
    document.addEventListener('click', e => {
      if(!e.target.closest || !e.target.closest('button')) return;
      outs.forEach(o => {
        if(o.value !== last.get(o)){
          last.set(o, o.value);
          if(o.value){ o.classList.remove('out-flash'); void o.offsetWidth; o.classList.add('out-flash'); }
        }
      });
    });

    // tombol yang berubah jadi "…✓" (mis. Salin -> Tersalin ✓)
    $$('.btn-primary, .btn-secondary, .btn-ghost').forEach(b => {
      observe(b, () => {
        if(b.textContent.indexOf('✓') > -1){
          b.classList.add('is-done');
          setTimeout(() => b.classList.remove('is-done'), 1200);
        }
      }, { childList: true, characterData: true, subtree: true });
    });
  });
})();
