/* ============================================================
   Сайт-визитка / лендинг — вся интерактивность
   Без зависимостей. Работает прямо из файла.
   ============================================================ */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------
     1. ТЕМА (запоминается в localStorage)
     ---------------------------------------------------------- */
  const THEME_KEY = 'site-theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  const savedTheme = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  })();

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ----------------------------------------------------------
     2. ШАПКА ПРИ СКРОЛЛЕ + КНОПКА «НАВЕРХ»
     ---------------------------------------------------------- */
  const header = $('#header');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     3. МОБИЛЬНОЕ МЕНЮ
     ---------------------------------------------------------- */
  const burger = $('#burger');
  const nav = $('#nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    $$('.nav__link', nav).forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ----------------------------------------------------------
     4. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ
     ---------------------------------------------------------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');

  if (sections.length && 'IntersectionObserver' in window) {
    const linkMap = new Map();
    navLinks.forEach((l) => linkMap.set(l.getAttribute('href').slice(1), l));

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkMap.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((s) => spy.observe(s));
  }

  /* ----------------------------------------------------------
     5. ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ
     ---------------------------------------------------------- */
  const reveals = $$('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------
     6. СЧЁТЧИКИ В ГЕРОЕ
     ---------------------------------------------------------- */
  const counters = $$('[data-count]');

  function animateCounter(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = c.dataset.count + (c.dataset.suffix || '');
    });
  }

  /* ----------------------------------------------------------
     7. FAQ-АККОРДЕОН
     ---------------------------------------------------------- */
  $$('.faq__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('is-open');

      // закрываем соседние — раскрыт всегда только один
      $$('.faq__item').forEach((other) => {
        other.classList.remove('is-open');
        const otherBtn = $('.faq__q', other);
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ----------------------------------------------------------
     8. ПЕРЕКЛЮЧАТЕЛЬ ТАРИФОВ
     ---------------------------------------------------------- */
  const switchBtns = $$('.switch__btn');
  const priceNums = $$('.price__num');
  const priceUnits = $$('.price__unit');

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;

      switchBtns.forEach((b) => b.classList.toggle('is-active', b === btn));

      const update = (el, attr) => {
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = el.dataset[attr];
          el.style.opacity = '1';
        }, 130);
      };

      priceNums.forEach((el) => update(el, period === 'month' ? 'month' : 'once'));
      priceUnits.forEach((el) => update(el, period === 'month' ? 'month' : 'once'));
    });
  });

  /* ----------------------------------------------------------
     9. ТОСТ-УВЕДОМЛЕНИЕ
     ---------------------------------------------------------- */
  const toast = $('#toast');
  let toastTimer;

  function showToast(message, isSuccess = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-success', isSuccess);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
  }

  /* ----------------------------------------------------------
     10. ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ
     ---------------------------------------------------------- */
  const form = $('#contactForm');

  if (form) {
    const rules = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Введите имя (минимум 2 символа)'),
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[a-zа-я]{2,}$/i.test(v.trim())
          ? ''
          : 'Похоже, в адресе опечатка',
      message: (v) => (v.trim().length >= 10 ? '' : 'Опишите задачу хотя бы в 10 символах'),
    };

    function setError(name, message) {
      const errEl = $(`[data-error-for="${name}"]`, form);
      const field = errEl ? errEl.closest('.field') : null;
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.toggle('is-visible', !!message);
      }
      if (field) field.classList.toggle('has-error', !!message);
      return !message;
    }

    function validateField(input) {
      const rule = rules[input.name];
      if (!rule) return true;
      return setError(input.name, rule(input.value));
    }

    // живая проверка: ошибка уходит, как только поле исправлено
    $$('input[required], textarea[required]', form).forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field && field.classList.contains('has-error')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      $$('input[required], textarea[required]', form).forEach((input) => {
        if (!validateField(input)) isValid = false;
      });

      const agree = $('input[name="agree"]', form);
      if (agree && !agree.checked) {
        setError('agree', 'Без согласия отправить не получится');
        isValid = false;
      } else {
        setError('agree', '');
      }

      if (!isValid) {
        const firstError = $('.has-error input, .has-error textarea', form);
        if (firstError) firstError.focus();
        showToast('Проверьте выделенные поля');
        return;
      }

      // === ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ===
      // Пример с Formspree / своим API:
      //
      // fetch('https://formspree.io/f/ВАШ_ID', {
      //   method: 'POST',
      //   headers: { 'Accept': 'application/json' },
      //   body: new FormData(form)
      // }).then(...)

      const submitBtn = $('button[type="submit"]', form);
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';

      // демо-задержка вместо сети
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        form.reset();
        $$('.field', form).forEach((f) => f.classList.remove('has-error'));
        $$('.field__error', form).forEach((el) => el.classList.remove('is-visible'));
        showToast('Заявка отправлена. Ответим в течение дня 👍', true);
      }, 900);
    });
  }

  /* ----------------------------------------------------------
     11. ГОД В ПОДВАЛЕ
     ---------------------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     12. ПЛАВНЫЙ СКРОЛЛ С УЧЁТОМ ВЫСОТЫ ШАПКИ
     (для браузеров без scroll-padding-top)
     ---------------------------------------------------------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });

      // обновляем адресную строку без «прыжка»
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();
