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
  if(!isAdmin) return;
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
});
