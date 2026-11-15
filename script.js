(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The first impression: a real, skippable code-inspired intro.
  const preloader = $('#preloader');
  const loadingFill = $('#loading-fill');
  const loadingValue = $('#loading-value');
  const loadingLabel = $('#loading-label');
  let introDone = false;
  let introTimer;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    if (introTimer) cancelAnimationFrame(introTimer);
    loadingFill.style.width = '100%';
    loadingValue.textContent = '100%';
    loadingLabel.textContent = 'READY TO EXPLORE';
    preloader.classList.add('is-hidden');
    document.body.style.overflow = '';
    setTimeout(() => preloader.setAttribute('aria-hidden', 'true'), 850);
  };
  if (reducedMotion) {
    finishIntro();
  } else {
    document.body.style.overflow = 'hidden';
    const duration = 2400;
    const started = performance.now();
    const tick = (timestamp) => {
      if (introDone) return;
      const progress = Math.min((timestamp - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const percent = Math.round(eased * 100);
      loadingFill.style.width = `${percent}%`;
      loadingValue.textContent = `${percent}%`;
      if (progress > .64) loadingLabel.textContent = 'COMPILING THE EXPERIENCE';
      if (progress >= 1) finishIntro();
      else introTimer = requestAnimationFrame(tick);
    };
    introTimer = requestAnimationFrame(tick);
  }
  $('#skip-intro')?.addEventListener('click', finishIntro);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !introDone) finishIntro();
  });

  // Lightweight scroll interactions, without external animation dependencies.
  const header = $('.site-header');
  const scrollLine = $('#scroll-line');
  const onScroll = () => {
    const top = window.scrollY;
    header.classList.toggle('is-scrolled', top > 40);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollLine.style.width = `${Math.min(100, top / maxScroll * 100)}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .08, rootMargin: '0px 0px -34px 0px' });
    revealElements.forEach(node => observer.observe(node));
  } else {
    revealElements.forEach(node => node.classList.add('is-visible'));
  }

  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      }
    }, { rootMargin: '-20% 0px -65% 0px' });
    ['work', 'expertise', 'about', 'journey'].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  // Responsive navigation: correct focus, Escape support, scroll lock.
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) mobileMenu.querySelector('a')?.focus();
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Gentle cursor light and perspective interaction only for precise pointers.
  const cursorGlow = $('#cursor-glow');
  if (window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
    window.addEventListener('pointermove', e => {
      cursorGlow.style.transform = `translate(${e.clientX - 245}px, ${e.clientY - 245}px)`;
    }, { passive: true });
  }

  // Case studies are based on the supplied CV. No invented repository/demo links.
  const cases = {
    certificates: {
      type: 'FULL-STACK PROJECT · 2022',
      index: '01',
      title: 'Certificate Management Platform',
      description: 'Developed during an internship at Centre d’Orientation et Planification. A Laravel platform for handling certificate requests and making administrative workflows easier to manage.',
      points: [
        'Built a certificate request management workflow using Laravel.',
        'Added automated PDF file generation for certificates.',
        'Enabled users to consult the history of previous requests.'
      ],
      stack: ['Laravel', 'PDF generation', 'Request management']
    },
    tasks: {
      type: 'FRONT-END PROJECT · 2021',
      index: '02',
      title: 'React Task Manager',
      description: 'Created during a developer internship at Morocco’s Ministry of Equipment and Water. A React application focused on organizing tasks in a simple interface.',
      points: [
        'Designed a Todo List application for task management.',
        'Built the interface using React.',
        'Focused on organizing common task-management actions into a clear flow.'
      ],
      stack: ['React', 'Task management', 'UI development']
    },
    operations: {
      type: 'PROFESSIONAL EXPERIENCE · 2023–PRESENT',
      index: '03',
      title: 'Technology Meets Operations',
      description: 'Experience across e-commerce and inventory operations has given me a practical understanding of how digital tools support teams and businesses.',
      points: [
        'At Vaporfy SARL (2023–2026), handled WordPress e-commerce site management alongside sales and stock workflows.',
        'At XCOD (2026–present), work on inventory monitoring, sales analysis, purchasing needs, and inter-country stock transfers.',
        'Bring operational context into development decisions — from workflows to usability.'
      ],
      stack: ['WordPress', 'E-commerce', 'Inventory processes', 'Operations']
    }
  };
  const dialog = $('#case-dialog');
  const caseHeading = $('#case-heading');
  const caseDescription = $('#case-description');
  const caseList = $('#case-points');
  const caseStack = $('#case-stack');
  $$('.case-trigger').forEach(button => button.addEventListener('click', () => {
    const data = cases[button.dataset.case];
    if (!data) return;
    $('#case-type').textContent = data.type;
    $('#case-index').textContent = data.index;
    caseHeading.textContent = data.title;
    caseDescription.textContent = data.description;
    caseList.replaceChildren(...data.points.map(point => { const li = document.createElement('li'); li.textContent = point; return li; }));
    caseStack.replaceChildren(...data.stack.map(tech => { const chip = document.createElement('span'); chip.textContent = tech; return chip; }));
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  const closeDialog = () => dialog.close();
  $('#dialog-close')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog?.addEventListener('close', () => { document.body.style.overflow = ''; });

  // Copy-to-clipboard with a fallback for older browsers and file:// previews.
  const toast = $('#toast');
  let toastTimeout;
  const talkLink = $('.header-contact');
  let mailFallbackTimer;
  talkLink?.addEventListener('click', () => {
    clearTimeout(mailFallbackTimer);
    mailFallbackTimer = setTimeout(() => {
      const composeUrl = new URL('https://mail.google.com/mail/');
      composeUrl.searchParams.set('view', 'cm');
      composeUrl.searchParams.set('fs', '1');
      composeUrl.searchParams.set('to', 'alimlahiaymane0@gmail.com');
      composeUrl.searchParams.set('su', "Let's Work Together – Portfolio Inquiry");
      composeUrl.searchParams.set('body', 'Hello Ayman, I visited your portfolio and would like to discuss an opportunity with you.');
      const gmailLink = document.createElement('a');
      gmailLink.href = composeUrl.toString();
      gmailLink.target = '_blank';
      gmailLink.rel = 'noopener noreferrer';
      gmailLink.textContent = 'Open Gmail instead';
      gmailLink.style.color = 'inherit';
      gmailLink.style.textDecoration = 'underline';
      toast.replaceChildren(document.createTextNode('No email app opened? '), gmailLink);
      toast.style.pointerEvents = 'auto';
      toast.classList.add('visible');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
        toast.style.pointerEvents = 'none';
      }, 8000);
    }, 1200);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') clearTimeout(mailFallbackTimer);
  });
  $('#copy-email')?.addEventListener('click', async () => {
    clearTimeout(mailFallbackTimer);
    toast.style.pointerEvents = 'none';
    const email = 'alimlahiaymane0@gmail.com';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const input = document.createElement('textarea');
        input.value = email;
        input.style.position = 'fixed'; input.style.opacity = '0';
        document.body.appendChild(input); input.select();
        if (!document.execCommand('copy')) throw new Error('Copy not supported');
        input.remove();
      }
      toast.textContent = 'Email copied to clipboard ✓';
    } catch {
      toast.textContent = 'Email: ' + email;
    }
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2800);
  });

  $('#year').textContent = String(new Date().getFullYear());
})();
