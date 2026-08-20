/* =============================================================================
   FiatKopong — main.js
   JavaScript ล้วน ไม่ใช้ library ใดๆ  ทุกฟังก์ชันแยกกันเป็นอิสระ
   ถ้าลบส่วนไหนออก ส่วนอื่นยังทำงานได้ปกติ
   -----------------------------------------------------------------------------
   01. Helper
   02. Header ติดขอบเมื่อเลื่อน
   03. เมนูมือถือ (Drawer)
   04. เมนูย่อยบนมือถือ
   05. Scroll Reveal
   06. ตัวเลขนับขึ้น + แถบกราฟ
   07. Netflix Rail (ปุ่มเลื่อนซ้าย/ขวา)
   08. Lightbox วิดีโอ
   09. ตัวกรองหมวด + ค้นหา
   10. ยอดวิว / ปุ่มถูกใจ (เก็บใน localStorage)
   11. ระบบคอมเมนต์ (เดโม เก็บในเครื่อง)
   12. ตรวจความถูกต้องฟอร์ม
   13. Sticky CTA + ปุ่มขึ้นบนสุด
   14. Location Intelligence Widget
   15. ปีปัจจุบันใน Footer
   ============================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- 01. Helper */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = new Intl.NumberFormat('th-TH');

  /* --------------------------------------------- 02. Header ติดขอบเมื่อเลื่อน */
  const header = $('.header');
  if (header) {
    const setStuck = () => header.classList.toggle('is-stuck', window.scrollY > 24);
    setStuck();
    on(window, 'scroll', setStuck, { passive: true });
  }

  /* ------------------------------------------------------ 03. เมนูมือถือ */
  const burger   = $('.burger');
  const nav      = $('#site-nav');
  const backdrop = $('.backdrop');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    backdrop && backdrop.classList.remove('is-open');
    burger && burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  function openNav() {
    nav.classList.add('is-open');
    backdrop && backdrop.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    const first = $('a,button', nav);
    first && first.focus();
  }
  on(burger, 'click', () => {
    burger.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
  });
  on(backdrop, 'click', closeNav);
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
  // ปิดเมนูเมื่อขยายจอเป็นเดสก์ท็อป
  on(window.matchMedia('(min-width:1024px)'), 'change', (e) => { if (e.matches) closeNav(); });

  /* --------------------------------------------- 04. เมนูย่อยบนมือถือ */
  $$('.has-sub > .nav__link').forEach((link) => {
    on(link, 'click', (e) => {
      if (window.innerWidth >= 1024) return;       // เดสก์ท็อปใช้ hover อยู่แล้ว
      const sub = link.parentElement.querySelector('.sub');
      if (!sub) return;
      e.preventDefault();
      const open = sub.classList.toggle('is-open');
      link.setAttribute('aria-expanded', String(open));
    });
  });

  /* ------------------------------------------------------ 05. Scroll Reveal */
  const revealables = $$('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* --------------------------------------- 06. ตัวเลขนับขึ้น + แถบกราฟ */
  function countUp(el) {
    const target  = parseFloat(el.dataset.count);
    const decimal = parseInt(el.dataset.decimal || '0', 10);
    const prefix  = el.dataset.prefix || '';
    const suffix  = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimal) + suffix; return; }
    const dur = 1400;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);            // ease-out cubic
      const val = target * eased;
      el.textContent = prefix + (decimal ? val.toFixed(decimal) : nf.format(Math.round(val))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const animatables = $$('[data-count],.bar__fill[data-width]');
  if (animatables.length && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.dataset.count !== undefined) countUp(el);
        else el.style.width = el.dataset.width + '%';
        io2.unobserve(el);
      });
    }, { threshold: 0.3 });
    animatables.forEach((el) => io2.observe(el));
  } else {
    animatables.forEach((el) => {
      if (el.dataset.count !== undefined) el.textContent = el.dataset.count;
      else el.style.width = el.dataset.width + '%';
    });
  }

  /* ------------------------------------------------------- 07. Netflix Rail */
  $$('.rail').forEach((rail) => {
    const track = $('.rail__track', rail);
    const prev  = $('[data-rail="prev"]', rail);
    const next  = $('[data-rail="next"]', rail);
    if (!track) return;
    const amount = () => Math.max(track.clientWidth * 0.8, 260);
    on(prev, 'click', () => track.scrollBy({ left: -amount(), behavior: 'smooth' }));
    on(next, 'click', () => track.scrollBy({ left:  amount(), behavior: 'smooth' }));

    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      prev && prev.toggleAttribute("disabled", track.scrollLeft <= 8);
      next && next.toggleAttribute('disabled', track.scrollLeft >= max);
    };
    sync();
    on(track, 'scroll', sync, { passive: true });
    on(window, 'resize', sync);
  });

  /* ----------------------------------------------------- 08. Lightbox วิดีโอ */
  const lb = $('#lightbox');
  if (lb) {
    const stage = $('.lightbox__stage', lb);
    const cap   = $('.lightbox__cap', lb);
    let lastFocus = null;

    function openLB(trigger) {
      lastFocus = trigger;
      const id    = trigger.dataset.video || '';
      const file  = trigger.dataset.videoFile || '';
      const title = trigger.dataset.videoTitle || '';
      if (id) {
        stage.innerHTML =
          '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
          '?autoplay=1&rel=0" title="' + title.replace(/"/g, '&quot;') +
          '" allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture" allowfullscreen></iframe>';
      } else if (file) {
        stage.innerHTML = '<video controls autoplay playsinline src="' + file + '"></video>';
      } else {
        stage.innerHTML =
          '<div style="padding:2rem;color:#B4BDCE;font-size:.9375rem;line-height:1.7">' +
          '<strong style="color:#E8CE7A;display:block;margin-bottom:.5rem">ยังไม่ได้ใส่วิดีโอ</strong>' +
          'ใส่ YouTube ID ที่แอตทริบิวต์ <code>data-video</code> ของการ์ดนี้ ' +
          'หรือใส่พาธไฟล์ที่ <code>data-video-file</code><br>' +
          'ดูวิธีทำใน Resource/notes/VIDEO-GUIDE.md</div>';
      }
      cap.textContent = title;
      lb.classList.add('is-open');
      lb.removeAttribute('aria-hidden');
      document.body.classList.add('is-locked');
      $('.lightbox__close', lb).focus();
    }
    function closeLB() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      stage.innerHTML = '';
      document.body.classList.remove('is-locked');
      lastFocus && lastFocus.focus();
    }
    $$('[data-video],[data-video-file],[data-video-open]').forEach((t) =>
      on(t, 'click', (e) => { e.preventDefault(); openLB(t); })
    );
    on($('.lightbox__close', lb), 'click', closeLB);
    on(lb, 'click', (e) => { if (e.target === lb) closeLB(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLB(); });
  }

  /* --------------------------------------------- 09. ตัวกรองหมวด + ค้นหา */
  const filterRoot = $('[data-filter-root]');
  if (filterRoot) {
    const chips   = $$('[data-filter]', filterRoot);
    const items   = $$('[data-cat]', filterRoot);
    const input   = $('[data-search]', filterRoot);
    const empty   = $('[data-empty]', filterRoot);
    const counter = $('[data-result-count]', filterRoot);
    let cat = 'all';

    function apply() {
      const q = (input ? input.value : '').trim().toLowerCase();
      let shown = 0;
      items.forEach((item) => {
        const okCat  = cat === 'all' || (item.dataset.cat || '').split(' ').includes(cat);
        const okText = !q || item.textContent.toLowerCase().includes(q);
        const show = okCat && okText;
        item.hidden = !show;
        if (show) shown++;
      });
      if (empty)   empty.hidden = shown > 0;
      if (counter) counter.textContent = nf.format(shown);
    }
    chips.forEach((chip) => on(chip, 'click', () => {
      cat = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    }));
    if (input) {
      let timer;
      on(input, 'input', () => { clearTimeout(timer); timer = setTimeout(apply, 160); });
    }
    apply();
  }

  /* ------------------------------------- 10. ยอดวิว / ปุ่มถูกใจ (localStorage) */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  $$('[data-like]').forEach((btn) => {
    const key    = 'fk_like_' + btn.dataset.like;
    const out    = $('[data-like-count]', btn);
    const base   = parseInt(btn.dataset.likeBase || '0', 10);
    const liked  = store.get(key, false);
    const render = () => {
      btn.setAttribute('aria-pressed', String(store.get(key, false)));
      if (out) out.textContent = nf.format(base + (store.get(key, false) ? 1 : 0));
    };
    if (liked) btn.setAttribute('aria-pressed', 'true');
    render();
    on(btn, 'click', () => { store.set(key, !store.get(key, false)); render(); });
  });

  // นับวิว: บวก 1 ต่อเบราว์เซอร์หนึ่งเครื่อง (เดโม — ของจริงต้องนับที่เซิร์ฟเวอร์)
  $$('[data-views]').forEach((el) => {
    const id   = el.dataset.views;
    const base = parseInt(el.dataset.viewsBase || '0', 10);
    const key  = 'fk_view_' + id;
    if (!store.get(key, false)) store.set(key, true);
    el.textContent = nf.format(base + 1);
  });

  /* ------------------------------------- 11. ระบบคอมเมนต์ (เดโม เก็บในเครื่อง) */
  const cRoot = $('[data-comments]');
  if (cRoot) {
    const key   = 'fk_comments_' + cRoot.dataset.comments;
    const list  = $('[data-comment-list]', cRoot);
    const form  = $('[data-comment-form]', cRoot);
    const count = $('[data-comment-count]', cRoot);
    const tmplEmpty = '<li class="muted small">ยังไม่มีความคิดเห็น เริ่มคนแรกได้เลย</li>';

    function esc(s) {
      return String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function render() {
      const data = store.get(key, []);
      if (count) count.textContent = nf.format(data.length);
      if (!data.length) { list.innerHTML = tmplEmpty; return; }
      list.innerHTML = data.map((c) =>
        '<li class="quote" style="gap:.6rem">' +
          '<div class="quote__text small">' + esc(c.body) + '</div>' +
          '<div class="quote__who" style="padding-top:.6rem">' +
            '<span class="avatar" aria-hidden="true">' + esc(c.name.trim().charAt(0).toUpperCase() || '?') + '</span>' +
            '<span><b>' + esc(c.name) + '</b><span>' + esc(c.date) + '</span></span>' +
          '</div>' +
        '</li>'
      ).join('');
    }
    on(form, 'submit', (e) => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const body = $('[name="body"]', form).value.trim();
      if (!name || !body) return;
      const data = store.get(key, []);
      data.unshift({
        name, body,
        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
      });
      store.set(key, data);
      form.reset();
      render();
      const status = $('.form__status', form);
      if (status) {
        status.textContent = 'บันทึกความคิดเห็นแล้ว (เดโมนี้เก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น)';
        status.className = 'form__status is-ok';
      }
    });
    render();
  }

  /* --------------------------------------------- 12. ตรวจความถูกต้องฟอร์ม */
  $$('form[data-validate]').forEach((form) => {
    const status = $('.form__status', form);

    function showError(input, msg) {
      input.setAttribute('aria-invalid', 'true');
      const box = input.closest('.field') && $('.err', input.closest('.field'));
      if (box) box.textContent = msg;
    }
    function clearError(input) {
      input.removeAttribute('aria-invalid');
      const box = input.closest('.field') && $('.err', input.closest('.field'));
      if (box) box.textContent = '';
    }
    $$('input,textarea,select', form).forEach((i) => on(i, 'input', () => clearError(i)));

    on(form, 'submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      $$('[required]', form).forEach((input) => {
        clearError(input);
        const v = (input.value || '').trim();
        let msg = '';
        if (input.type === 'checkbox' && !input.checked) msg = 'กรุณาติ๊กยอมรับก่อนส่ง';
        else if (!v) msg = 'กรุณากรอกข้อมูลช่องนี้';
        else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) msg = 'รูปแบบอีเมลไม่ถูกต้อง';
        else if (input.type === 'tel' && !/^[0-9+\-\s()]{8,}$/.test(v)) msg = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
        if (msg) { showError(input, msg); firstBad = firstBad || input; }
      });

      if (firstBad) {
        if (status) {
          status.textContent = 'ยังกรอกไม่ครบ ตรวจช่องที่ขึ้นสีแดงอีกครั้งนะครับ';
          status.className = 'form__status is-err';
        }
        firstBad.focus();
        return;
      }
      if (status) {
        status.textContent = form.dataset.successMsg ||
          'ส่งข้อมูลเรียบร้อย ทีมงานจะติดต่อกลับภายใน 1 วันทำการ';
        status.className = 'form__status is-ok';
      }
      form.reset();
      $$('[aria-pressed="true"].slot', form).forEach((s) => s.setAttribute('aria-pressed', 'false'));
    });
  });

  // ปุ่มเลือกช่วงเวลานัด (เลือกได้ทีละ 1)
  $$('.slots').forEach((group) => {
    const slots = $$('.slot', group);
    const hidden = $('input[type="hidden"]', group.parentElement || group);
    slots.forEach((s) => on(s, 'click', () => {
      slots.forEach((o) => o.setAttribute('aria-pressed', String(o === s)));
      if (hidden) hidden.value = s.textContent.trim();
    }));
  });

  /* --------------------------------- 13. Sticky CTA + ปุ่มขึ้นบนสุด */
  const sticky = $('.sticky-cta');
  if (sticky) {
    const toggle = () => sticky.classList.toggle('is-visible', window.scrollY > 640);
    toggle();
    on(window, 'scroll', toggle, { passive: true });
    on($('.to-top', sticky), 'click', () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ------------------------------- 14. Location Intelligence Widget */
  const li = $('[data-li]');
  if (li) {
    const zones = $$('.li__zone', li);
    const name  = $('[data-li-name]', li);
    const grade = $('[data-li-grade]', li);
    const note  = $('[data-li-note]', li);
    const bars  = $$('[data-li-metric]', li);

    function select(zone) {
      zones.forEach((z) => z.setAttribute('aria-pressed', String(z === zone)));
      const d = JSON.parse(zone.dataset.zone);
      name.textContent  = d.name;
      grade.textContent = d.grade;
      note.textContent  = d.note;
      bars.forEach((bar) => {
        const val  = d.metrics[bar.dataset.liMetric];
        const fill = $('.bar__fill', bar);
        const out  = $('b', bar);
        fill.style.width = val + '%';
        out.textContent  = val + '/100';
      });
    }
    zones.forEach((z) => {
      on(z, 'click', () => select(z));
      on(z, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(z); }
      });
    });
    select(zones[0]);
  }

  /* ------------------------------------------ 15. ปีปัจจุบันใน Footer */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear() + 543; });
})();
