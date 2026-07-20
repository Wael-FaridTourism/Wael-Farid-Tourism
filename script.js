/* ============================================================
   وضع الإدارة (Admin Mode)
   افتح الموقع بالرابط: index.html?admin=wael2026
   عشان تقدر ترفع صور آراء العملاء والجاليري وتتبقى محفوظة
   على جهازك بس (localStorage) لحد ما تبعتلي الكود عشان أثبته
   في نسخة الموقع اللي بتشوفها كل الناس.
   ============================================================ */
const ADMIN_KEY = 'wael2026';
const isAdmin = new URLSearchParams(location.search).get('admin') === ADMIN_KEY;

let curTest = null, curGal = null;

function uploadTestimonial(el){
  if(!isAdmin) return;
  curTest = el;
  document.getElementById('fileTestimonial').click();
}
function uploadGallery(el){
  if(!isAdmin){
    openLightbox(el);
    return;
  }
  curGal = el;
  document.getElementById('fileGallery').click();
}

function saveSlot(slotId, dataUrl){
  try{
    localStorage.setItem('wf_slot_' + slotId, dataUrl);
  }catch(e){
    console.warn('تعذر الحفظ محلياً (الصورة كبيرة جداً على الأرجح):', e);
  }
}

function addCopyButton(container, slotId, dataUrl){
  const existing = container.querySelector('.copy-code-btn');
  if(existing) existing.remove();
  const btn = document.createElement('button');
  btn.textContent = '📋 نسخ الكود لإرساله';
  btn.className = 'copy-code-btn';
  btn.style.cssText = 'position:absolute;bottom:4px;left:4px;right:4px;font-size:10px;padding:4px;border:none;border-radius:6px;background:rgba(0,0,0,.7);color:#D4AF37;cursor:pointer;z-index:5';
  btn.onclick = (e)=>{
    e.stopPropagation();
    const tag = '<img src="' + dataUrl + '" alt="' + slotId + '">';
    navigator.clipboard.writeText(tag).then(()=>{
      btn.textContent = '✅ اتنسخ - ابعته عشان يتثبت في الموقع';
      setTimeout(()=> btn.textContent = '📋 نسخ الكود لإرساله', 2500);
    });
  };
  container.style.position = 'relative';
  container.appendChild(btn);
}

function restoreSlots(){
  document.querySelectorAll('[data-slot]').forEach(el=>{
    const slotId = el.dataset.slot;
    const saved = localStorage.getItem('wf_slot_' + slotId);
    if(!saved) return;
    const isTest = el.classList.contains('t-card');
    if(isTest){
      el.querySelector('.t-body').innerHTML = '<img src="'+saved+'" alt="testimonial">';
    } else {
      el.innerHTML = '<img src="'+saved+'" alt="gallery">';
    }
    if(isAdmin) addCopyButton(el, slotId, saved);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const ft = document.getElementById('fileTestimonial');
  const fg = document.getElementById('fileGallery');

  if(isAdmin){
    document.body.classList.add('admin-mode');
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    document.querySelectorAll('.t-card[data-slot], .g-item[data-slot]').forEach(el=>{
      el.style.cursor = 'pointer';
    });
  } else {
    // الوضع العادي: منع النقر وتحييد المؤشر لأي زائر عادي
    document.querySelectorAll('.t-card[data-slot], .g-item[data-slot]').forEach(el=>{
      el.style.cursor = 'default';
    });
  }

  restoreSlots();

  ft.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file || !curTest || !isAdmin) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const dataUrl = ev.target.result;
      curTest.querySelector('.t-body').innerHTML = '<img src="'+dataUrl+'" alt="testimonial">';
      const slotId = curTest.dataset.slot;
      saveSlot(slotId, dataUrl);
      addCopyButton(curTest, slotId, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  fg.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file || !curGal || !isAdmin) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const dataUrl = ev.target.result;
      curGal.innerHTML = '<img src="'+dataUrl+'" alt="gallery">';
      const slotId = curGal.dataset.slot;
      saveSlot(slotId, dataUrl);
      addCopyButton(curGal, slotId, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  console.log('Wael Farid Travel - Pro version loaded' + (isAdmin ? ' [admin mode]' : ''));

  /* ---------- Hero slider ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  if(slides.length){
    let curSlide = 0;
    setInterval(()=>{
      slides[curSlide].classList.remove('active');
      curSlide = (curSlide + 1) % slides.length;
      slides[curSlide].classList.add('active');
    }, 4500);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if(counters.length){
    const animateCounter = (el)=>{
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const step = (now)=>{
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString('en-US');
        if(progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-US');
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.5});
    counters.forEach(el=> observer.observe(el));
  }
});

/* ---------- Lightbox ---------- */
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(el){
  const items = Array.from(document.querySelectorAll('#galleryGrid .g-item img'));
  lightboxImages = items.map(img => img.src);
  const clickedImg = el.querySelector('img');
  lightboxIndex = clickedImg ? items.indexOf(clickedImg) : 0;
  if(lightboxIndex < 0) lightboxIndex = 0;
  showLightboxImage();
  document.getElementById('lightbox').classList.add('open');
}

function showLightboxImage(){
  if(!lightboxImages.length) return;
  document.getElementById('lightboxImg').src = lightboxImages[lightboxIndex];
}

function navLightbox(dir){
  if(!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  showLightboxImage();
}

function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
}

document.addEventListener('keydown', (e)=>{
  if(!document.getElementById('lightbox').classList.contains('open')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowLeft') navLightbox(1);
  if(e.key === 'ArrowRight') navLightbox(-1);
});
