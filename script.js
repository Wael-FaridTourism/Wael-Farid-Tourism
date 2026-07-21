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

/* ---------- Smart WhatsApp Wizard ---------- */
const WHATSAPP_NUMBER = '201069342225';

function getVehicleType(n){
  n = parseInt(n, 10);
  if(!n || isNaN(n)) return null;
  if(n < 4) return 'سيارة صغيرة';
  if(n <= 8) return 'ستاريا أو H1';
  if(n <= 10) return 'هاي إس';
  if(n <= 20) return 'كوستر';
  return 'باص 45 أو 50 راكب';
}

const KSA_ROUTES = [
  'من مطار جدة إلى مكة',
  'من مكة إلى مطار جدة',
  'من مكة إلى المدينة',
  'من محطة قطار الحرمين (مكة) إلى مكة',
  'من مكة إلى محطة قطار الحرمين',
  'من محطة قطار الحرمين (المدينة) إلى الفندق',
  'من الفندق في المدينة إلى مطار المدينة'
];
const CAIRO_ROUTES = [
  'من المقطم وضواحيها إلى مطار القاهرة',
  'من 6 أكتوبر وضواحيها إلى مطار القاهرة',
  'من 6 أكتوبر وضواحيها إلى مطار سفنكس'
];

function transferSteps(){
  return [
    {key:'transferLocation', label:'الانتقالات هتكون فين؟', type:'options', options:['في القاهرة','في المملكة'], fLabel:'مكان الانتقال'},
    {key:'transferRoute', label:'اختار خط السير', type:'select', options:CAIRO_ROUTES, fLabel:'خط السير', conditional:(a)=> a.transferLocation==='في القاهرة'},
    {key:'transferRoute', label:'اختار خط السير', type:'select', options:KSA_ROUTES, fLabel:'خط السير', conditional:(a)=> a.transferLocation==='في المملكة'}
  ];
}

const wizardConfigs = {
  flights: {
    title: '✈️ حجز طيران',
    name: 'حجز طيران',
    steps: [
      {key:'route', label:'خط السير (من - إلى)', type:'text', placeholder:'مثال: القاهرة - جدة', fLabel:'خط السير'},
      {key:'count', label:'عدد الأفراد', type:'number', placeholder:'مثال: 4', fLabel:'عدد الأفراد'},
      {key:'date', label:'وقت السفر المطلوب', type:'date', fLabel:'موعد السفر'}
    ]
  },
  visa: {
    title: '🛂 استخراج تأشيرة',
    name: 'استخراج تأشيرة',
    steps: [
      {key:'date', label:'وقت السفر المطلوب', type:'date', fLabel:'موعد السفر'},
      {key:'type', label:'نوع التأشيرة', type:'options', options:['سياحة','عمرة'], fLabel:'نوع التأشيرة'}
    ]
  },
  hotels: {
    title: '🏨 حجز فندق',
    name: 'حجز فندق',
    steps: [
      {key:'date', label:'تاريخ السفر', type:'date', fLabel:'تاريخ السفر'},
      {key:'count', label:'عدد الأفراد', type:'number', placeholder:'مثال: 3', fLabel:'عدد الأفراد'},
      {key:'rooms', label:'عدد الغرف', type:'number', placeholder:'مثال: 1', fLabel:'عدد الغرف'},
      {key:'hotelName', label:'اسم الفندق (لو عندك فندق معين) - سيب الخانة فاضية لو عايز اقتراح', type:'text', optional:true, placeholder:'مثال: فندق الماسة جراند', fLabel:'اسم الفندق'},
      {key:'budget', label:'الميزانية المطلوبة في الليلة', type:'options', options:['أقل من 100 ريال','أقل من 300 ريال','أقل من 500 ريال','أقل من 1000 ريال'], fLabel:'الميزانية لليلة', conditional:(a)=> !a.hotelName}
    ]
  },
  umrah: {
    title: '🕋 برنامج عمرة / حج',
    name: 'برنامج عمرة/حج',
    steps: [
      {key:'count', label:'عدد الأفراد', type:'number', placeholder:'مثال: 2', fLabel:'عدد الأفراد'},
      {key:'date', label:'تاريخ السفر المطلوب', type:'date', fLabel:'موعد السفر'},
      {key:'package', label:'نوع الباقة', type:'options', options:['اقتصادية','4 نجوم','VIP خمس نجوم'], fLabel:'نوع الباقة'},
      ...transferSteps()
    ],
    extra:(answers)=>{
      if(answers.transferLocation==='في المملكة' && answers.count){
        const v = getVehicleType(answers.count);
        if(v) return {label:'نوع العربية المقترح', value:v};
      }
      return null;
    }
  },
  transfers: {
    title: '🚌 حجز انتقالات',
    name: 'حجز انتقالات',
    steps: [
      {key:'count', label:'عدد الأفراد', type:'number', placeholder:'مثال: 4', fLabel:'عدد الأفراد'},
      ...transferSteps()
    ],
    extra:(answers)=>{
      if(answers.transferLocation==='في المملكة' && answers.count){
        const v = getVehicleType(answers.count);
        if(v) return {label:'نوع العربية المقترح', value:v};
      }
      return null;
    }
  },
  train: {
    title: '🚆 حجز قطار الحرمين',
    name: 'حجز قطار الحرمين',
    steps: [
      {key:'count', label:'عدد الأفراد', type:'number', placeholder:'مثال: 2', fLabel:'عدد الأفراد'},
      {key:'route', label:'خط السير (من - إلى)', type:'text', placeholder:'مثال: مكة - المدينة', fLabel:'خط السير'},
      {key:'date', label:'تاريخ السفر', type:'date', fLabel:'تاريخ السفر'}
    ]
  }
};

let wz = {key:null, stepIndex:0, answers:{}, locked:[]};

function getActiveSteps(){
  const cfg = wizardConfigs[wz.key];
  return cfg.steps.filter(s=>{
    if(wz.locked.includes(s.key)) return false;
    if(s.conditional && !s.conditional(wz.answers)) return false;
    return true;
  });
}

function openWizard(key, presets){
  presets = presets || {};
  wz = {key:key, stepIndex:0, answers:{...presets}, locked:Object.keys(presets)};
  document.getElementById('wizardTitle').textContent = wizardConfigs[key].title;
  document.getElementById('wizardOverlay').classList.add('open');
  renderWizardStep();
}

function closeWizard(){
  document.getElementById('wizardOverlay').classList.remove('open');
}

function renderWizardStep(){
  const steps = getActiveSteps();
  const container = document.getElementById('wizardSteps');
  const progressEl = document.getElementById('wizardProgress');

  if(wz.stepIndex >= steps.length){
    // Summary screen
    progressEl.textContent = 'مراجعة الطلب';
    const cfg = wizardConfigs[wz.key];
    let summaryHtml = '<div class="wizard-summary">';
    steps.forEach(s=>{
      if(wz.answers[s.key]) summaryHtml += `<div><b>${s.fLabel}:</b> ${wz.answers[s.key]}</div>`;
    });
    if(cfg.extra){
      const extra = cfg.extra(wz.answers);
      if(extra) summaryHtml += `<div><b>${extra.label}:</b> ${extra.value}</div>`;
    }
    summaryHtml += '</div>';
    container.innerHTML = summaryHtml + `
      <div class="wizard-nav">
        <button class="wizard-btn-back" onclick="wizardBack()">رجوع</button>
        <button class="wizard-btn-send" onclick="sendWizard()">إرسال على واتساب 💬</button>
      </div>`;
    return;
  }

  const step = steps[wz.stepIndex];
  progressEl.textContent = `سؤال ${wz.stepIndex + 1} من ${steps.length}`;
  let fieldHtml = '';

  if(step.type === 'options'){
    fieldHtml = '<div class="wizard-options" id="wizardOptions">' +
      step.options.map(opt => `<div class="wizard-opt${wz.answers[step.key]===opt?' selected':''}" onclick="selectWizardOption('${step.key}','${opt}')">${opt}</div>`).join('') +
      '</div>';
  } else if(step.type === 'select'){
    fieldHtml = `<select id="wizardInput"><option value="">اختر...</option>` +
      step.options.map(opt => `<option value="${opt}"${wz.answers[step.key]===opt?' selected':''}>${opt}</option>`).join('') +
      '</select>';
  } else {
    const val = wz.answers[step.key] || '';
    fieldHtml = `<input type="${step.type}" id="wizardInput" placeholder="${step.placeholder||''}" value="${val}">`;
  }

  container.innerHTML = `
    <div class="wizard-step active">
      <label>${step.label}</label>
      ${fieldHtml}
      <div class="wizard-nav">
        ${wz.stepIndex > 0 ? '<button class="wizard-btn-back" onclick="wizardBack()">رجوع</button>' : ''}
        <button class="wizard-btn-next" onclick="wizardNext()">التالي</button>
      </div>
    </div>`;
}

function selectWizardOption(key, val){
  wz.answers[key] = val;
  renderWizardStep();
}

function wizardNext(){
  const steps = getActiveSteps();
  const step = steps[wz.stepIndex];
  if(step.type !== 'options'){
    const input = document.getElementById('wizardInput');
    const val = input.value.trim();
    if(!val && !step.optional){
      input.style.borderColor = '#ff4444';
      return;
    }
    if(val) wz.answers[step.key] = val;
  } else if(!wz.answers[step.key]){
    return;
  }
  wz.stepIndex++;
  renderWizardStep();
}

function wizardBack(){
  wz.stepIndex--;
  if(wz.stepIndex < 0) wz.stepIndex = 0;
  renderWizardStep();
}

function sendWizard(){
  const cfg = wizardConfigs[wz.key];
  const steps = getActiveSteps();
  let msg = `مرحباً، عايز أستفسر عن: ${cfg.name}\n\n`;
  steps.forEach(s=>{
    if(wz.answers[s.key]) msg += `${s.fLabel}: ${wz.answers[s.key]}\n`;
  });
  if(cfg.extra){
    const extra = cfg.extra(wz.answers);
    if(extra) msg += `${extra.label}: ${extra.value}\n`;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  closeWizard();
}
