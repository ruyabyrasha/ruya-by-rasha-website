
(function(){
  const html = document.documentElement;
  const body = document.body;
  const langToggle = document.getElementById('langToggle');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.querySelector('.nav-links');
  const backdrop = document.getElementById('menuBackdrop');
  const loader = document.getElementById('loader');
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  function applyLang(lang){
    const isAr = lang === 'ar';
    html.lang = isAr ? 'ar' : 'en';
    html.dir = isAr ? 'rtl' : 'ltr';
    body.dir = isAr ? 'rtl' : 'ltr';
    if (langToggle) langToggle.textContent = isAr ? 'EN' : 'عربي';

    document.querySelectorAll('[data-en][data-ar]').forEach(function(el){
      el.textContent = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    });
    localStorage.setItem('ruya_lang', lang);
    document.dispatchEvent(new CustomEvent('ruya:language-changed'));
  }

  applyLang(localStorage.getItem('ruya_lang') || 'en');

  if (langToggle) {
    langToggle.addEventListener('click', function(){
      const nextLang = html.lang === 'ar' ? 'en' : 'ar';
      body.classList.add('lang-switching');
      setTimeout(function(){
        applyLang(nextLang);
        setTimeout(function(){
          body.classList.remove('lang-switching');
        }, 80);
      }, 220);
    });
  }

  function closeMenu(){
    body.classList.remove('menu-open');
    if (navLinks) navLinks.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  function toggleMenu(){
    if (!navLinks) return;
    const open = navLinks.classList.contains('open');
    if (open) closeMenu();
    else {
      body.classList.add('menu-open');
      navLinks.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (backdrop) backdrop.addEventListener('click', closeMenu);

  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click', function(e){
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        closeMenu();
        setTimeout(function(){
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }, 80);
      });
    });
  }

  setTimeout(function(){
    if (loader) loader.classList.add('hide');
  }, 900);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const closeLightbox = document.getElementById('closeLightbox');

  document.querySelectorAll('.work-card img').forEach(function(img){
    img.addEventListener('click', function(){
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
    });
  });

  function closeLb(){
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
  }

  if (closeLightbox) closeLightbox.addEventListener('click', closeLb);
  if (lightbox) lightbox.addEventListener('click', function(e){
    if (e.target === lightbox) closeLb();
  });
})();


// Ruya scroll animations
document.addEventListener('DOMContentLoaded', function(){
  const animated = document.querySelectorAll(
    '.reveal, .section-head, .work-card, .story-card, .workshop-cards article, .why-grid div, .contact-card, .contact-info > *, .insta-box'
  );

  if (!('IntersectionObserver' in window)) {
    animated.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  });

  animated.forEach(function(el){
    observer.observe(el);
  });
});



// CMS gallery loader: loads data/gallery.json, shuffles first 6, and supports View More
document.addEventListener('DOMContentLoaded', function(){
  const grid = document.getElementById('workGallery');
  const btn = document.getElementById('viewMoreWork');
  if (!grid) return;

  const FIRST_COUNT = 6;

  function currentLang(){
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
  }

  function shuffle(items){
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let allItems = [];
  let shownAll = false;

  function itemHtml(item){
    const lang = currentLang();
    const category = lang === 'ar' ? (item.categoryAr || item.categoryEn || '') : (item.categoryEn || item.categoryAr || '');
    const title = lang === 'ar' ? (item.titleAr || item.titleEn || '') : (item.titleEn || item.titleAr || '');
    const image = item.image || '';
    const alt = item.alt || title;
    return `
      <article class="work-card" data-category="${item.category || ''}">
        <img src="${image}" alt="${alt}" loading="lazy" />
        <div>
          <span data-en="${item.categoryEn || ''}" data-ar="${item.categoryAr || ''}">${category}</span>
          <strong data-en="${item.titleEn || ''}" data-ar="${item.titleAr || ''}">${title}</strong>
        </div>
      </article>
    `;
  }

  function render(){
    const visible = shownAll ? allItems : allItems.slice(0, FIRST_COUNT);
    grid.innerHTML = visible.map(itemHtml).join('');

    if (btn) {
      btn.classList.toggle('is-hidden', shownAll || allItems.length <= FIRST_COUNT);
      btn.textContent = currentLang() === 'ar' ? (btn.getAttribute('data-ar') || 'عرض المزيد') : (btn.getAttribute('data-en') || 'View More');
    }

    // Reattach lightbox behavior for dynamically loaded cards
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    grid.querySelectorAll('.work-card img').forEach(function(img){
      img.addEventListener('click', function(){
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.src;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden','false');
      });
    });

    // Trigger reveal animation
    grid.querySelectorAll('.work-card').forEach(function(card, index){
      setTimeout(function(){ card.classList.add('in-view'); }, index * 45);
    });
  }

  fetch('data/gallery.json', { cache: 'no-store' })
    .then(res => res.json())
    .then(items => {
      allItems = shuffle(Array.isArray(items) ? items : (items.items || []));
      render();
    })
    .catch(() => {
      grid.innerHTML = '<p class="gallery-error">Gallery could not load</p>';
      if (btn) btn.classList.add('is-hidden');
    });

  if (btn) {
    btn.addEventListener('click', function(){
      shownAll = true;
      render();
    });
  }

  // Re-render gallery labels after language switch
  document.addEventListener('ruya:language-changed', render);
});
