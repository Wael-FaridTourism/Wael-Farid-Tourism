const PHONE = "201069342225";

function vehicleForCount(n){
  n = parseInt(n) || 0;
  if(n < 4) return "سيارة صغيرة (خصوصي)";
  if(n <= 8) return "ستاريا / H1";
  if(n <= 10) return "هاي إس (Hiace)";
  if(n <= 20) return "كوستر";
  return "باص 45/50 راكب";
}

/* كل خدمة = مجموعة خطوات، كل خطوة عندها id وسؤال ونوع، وممكن next(answers) تحدد الخطوة الجاية حسب الإجابة */
const SERVICES = {

  flight: {
    title: "حجز رحلة طيران ✈️",
    intro: "هنحتاج منك 3 تفاصيل بسيطة عشان نجهزلك أفضل عرض طيران",
    first: "route",
    steps: {
      route: {q:"خط سير الرحلة؟ (من - إلى)", type:"text", ph:"مثال: القاهرة - جدة", next:()=>"people"},
      people: {q:"عدد الأفراد المسافرين؟", type:"number", ph:"مثال: 3", next:()=>"time"},
      time: {q:"وقت السفر المطلوب؟", type:"text", ph:"مثال: أول أسبوع أغسطس", next:()=>null}
    },
    build: a => `مرحباً، عايز أحجز رحلة طيران ✈️\n📍 خط السير: ${a.route}\n👥 عدد الأفراد: ${a.people}\n🗓️ وقت السفر المطلوب: ${a.time}`
  },

  visa: {
    title: "استخراج تأشيرة سعودية 🛂",
    intro: "هنحتاج بس نقطتين عشان نبدأ نجهزلك التأشيرة",
    first: "time",
    steps: {
      time: {q:"وقت السفر المطلوب؟", type:"text", ph:"مثال: منتصف أغسطس", next:()=>"type"},
      type: {q:"نوع التأشيرة؟", type:"choice", options:["سياحية","عمرة","زيارة حكومية متعددة"], next:()=>null}
    },
    build: a => `مرحباً، عايز أستخرج تأشيرة سعودية 🛂\n🗓️ وقت السفر: ${a.time}\n📋 نوع التأشيرة: ${a.type}`
  },

  hotel: {
    title: "حجز فندق 🏨",
    intro: "هنسألك كام سؤال بسيط عشان نلقالك أنسب فندق",
    first: "date",
    steps: {
      date: {q:"تاريخ السفر؟", type:"text", ph:"مثال: 10 أغسطس", next:()=>"people"},
      people: {q:"عدد الأفراد؟", type:"number", ph:"مثال: 4", next:()=>"rooms"},
      rooms: {q:"عدد الغرف المطلوبة؟", type:"number", ph:"مثال: 2", next:()=>"know"},
      know: {q:"معاك اسم فندق معين ولا محتاج اقتراح؟", type:"choice", options:["معايا اسم الفندق","محتاج اقتراح فندق"], next:a=>a.know==="معايا اسم الفندق"?"hotelName":"budget"},
      hotelName: {q:"اسم الفندق المطلوب؟", type:"text", ph:"مثال: فندق أبراج المسك", next:()=>null},
      budget: {q:"في حدود كام تقريباً؟ (الميزانية المتاحة)", type:"text", ph:"مثال: 3000 جنيه لليلة", next:()=>null}
    },
    build: a => `مرحباً، عايز أحجز فندق 🏨\n🗓️ تاريخ السفر: ${a.date}\n👥 عدد الأفراد: ${a.people}\n🛏️ عدد الغرف: ${a.rooms}\n` +
      (a.hotelName ? `🏨 اسم الفندق: ${a.hotelName}` : `💰 الميزانية التقريبية: ${a.budget} (محتاج اقتراح فندق مناسب)`)
  },

  umrah: {
    title: "تنظيم رحلة عمرة / حج 🕋",
    intro: "هنسألك على العدد والفترة والانتقالات عشان نجهزلك برنامج كامل",
    first: "people",
    steps: {
      people: {q:"عدد الأفراد المسافرين؟", type:"number", ph:"مثال: 5", next:()=>"period"},
      period: {q:"الفترة المطلوبة للسفر؟ (التاريخ ومدة الرحلة)", type:"text", ph:"مثال: من 10 لـ 20 أغسطس", next:()=>"transportWhere"},
      transportWhere: {q:"محتاج ترتيب انتقالات؟", type:"choice", options:["انتقالات في القاهرة","انتقالات في المملكة","مش محتاج انتقالات"], next:a=>{
        if(a.transportWhere==="انتقالات في القاهرة") return "cairoRoute";
        if(a.transportWhere==="انتقالات في المملكة") return "saudiPeople";
        return null;
      }},
      cairoRoute: {q:"خط سير الانتقال في القاهرة؟", type:"choice", options:["من المقطم وضواحيها لمطار القاهرة","من أكتوبر وضواحيها لمطار القاهرة","من أكتوبر وضواحيها لمطار سفنكس"], next:()=>null},
      saudiPeople: {q:"عدد الأفراد اللي هيركبوا مع بعض؟ (عشان نحدد نوع المركبة)", type:"number", ph:"مثال: 6", next:()=>"saudiRoute"},
      saudiRoute: {q:"خط سير الانتقال في المملكة؟", type:"choice", options:[
        "من مطار جدة إلى مكة","من مكة إلى مطار جدة","من مكة إلى المدينة",
        "من/إلى محطة قطار الحرمين في مكة","من محطة قطار الحرمين للفندق في المدينة","من الفندق لمطار المدينة"
      ], next:()=>null}
    },
    build: a => {
      let msg = `مرحباً، عايز أنظم رحلة عمرة/حج 🕋\n👥 عدد الأفراد: ${a.people}\n🗓️ الفترة المطلوبة: ${a.period}\n`;
      if(a.transportWhere==="انتقالات في القاهرة"){
        msg += `🚌 الانتقالات: ${a.cairoRoute}`;
      } else if(a.transportWhere==="انتقالات في المملكة"){
        msg += `🚐 نوع المركبة المناسب: ${vehicleForCount(a.saudiPeople)} (لعدد ${a.saudiPeople} أفراد)\n📍 خط السير: ${a.saudiRoute}`;
      } else {
        msg += `🚌 الانتقالات: بدون طلب انتقالات حالياً`;
      }
      return msg;
    }
  },

  transport: {
    title: "ترتيب انتقالات 🚌",
    intro: "قولنا الانتقال هيكون فين عشان نرتبلك المركبة المناسبة",
    first: "transportWhere",
    steps: {
      transportWhere: {q:"الانتقال هيكون فين؟", type:"choice", options:["في القاهرة","في المملكة العربية السعودية"], next:a=>a.transportWhere==="في القاهرة"?"cairoRoute":"saudiPeople"},
      cairoRoute: {q:"خط سير الانتقال؟", type:"choice", options:["من المقطم وضواحيها لمطار القاهرة","من أكتوبر وضواحيها لمطار القاهرة","من أكتوبر وضواحيها لمطار سفنكس"], next:()=>null},
      saudiPeople: {q:"عدد الأفراد اللي هيركبوا مع بعض؟ (عشان نحدد نوع المركبة)", type:"number", ph:"مثال: 6", next:()=>"saudiRoute"},
      saudiRoute: {q:"خط سير الانتقال؟", type:"choice", options:[
        "من مطار جدة إلى مكة","من مكة إلى مطار جدة","من مكة إلى المدينة",
        "من/إلى محطة قطار الحرمين في مكة","من محطة قطار الحرمين للفندق في المدينة","من الفندق لمطار المدينة"
      ], next:()=>null}
    },
    build: a => {
      let msg = `مرحباً، عايز أرتب انتقالات 🚌\n`;
      if(a.transportWhere==="في القاهرة"){
        msg += `📍 خط السير: ${a.cairoRoute}`;
      } else {
        msg += `👥 عدد الأفراد: ${a.saudiPeople}\n🚐 نوع المركبة المناسب: ${vehicleForCount(a.saudiPeople)}\n📍 خط السير: ${a.saudiRoute}`;
      }
      return msg;
    }
  },

  train: {
    title: "حجز قطار الحرمين 🚆",
    intro: "هنحتاج منك 3 تفاصيل بسيطة",
    first: "people",
    steps: {
      people: {q:"عدد الأفراد؟", type:"number", ph:"مثال: 2", next:()=>"route"},
      route: {q:"خط السير؟", type:"choice", options:["من مكة إلى المدينة","من المدينة إلى مكة","من جدة إلى مكة","من مكة إلى جدة"], next:()=>"date"},
      date: {q:"تاريخ السفر؟", type:"text", ph:"مثال: 15 أغسطس", next:()=>null}
    },
    build: a => `مرحباً، عايز أحجز في قطار الحرمين 🚆\n👥 عدد الأفراد: ${a.people}\n📍 خط السير: ${a.route}\n🗓️ تاريخ السفر: ${a.date}`
  }
};

let currentService = null;
let currentStepId = null;
let answers = {};
let history = [];

function initBooking(){
  const params = new URLSearchParams(window.location.search);
  const key = params.get("service");
  const service = SERVICES[key];
  const wrap = document.getElementById("wizardWrap");

  if(!service){
    wrap.innerHTML = `<div class="wizard-card"><h2 class="section-title" style="font-size:20px">اختر الخدمة اللي محتاجها</h2>
      <div class="choice-grid" id="serviceChoice"></div></div>`;
    const grid = document.getElementById("serviceChoice");
    Object.keys(SERVICES).forEach(k=>{
      const b = document.createElement("a");
      b.className = "choice-btn";
      b.href = "booking.html?service="+k;
      b.textContent = SERVICES[k].title;
      grid.appendChild(b);
    });
    return;
  }

  currentService = service;
  currentStepId = service.first;
  answers = {};
  history = [];
  document.getElementById("wizardTitle").textContent = service.title;
  document.getElementById("wizardIntro").textContent = service.intro;
  renderStep();
}

function renderStep(){
  const wrap = document.getElementById("wizardWrap");
  if(currentStepId === null){
    const msg = currentService.build(answers);
    const link = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    wrap.innerHTML = `<div class="wizard-card">
      <h2 class="section-title" style="font-size:20px">تمام، طلبك جاهز ✅</h2>
      <p class="section-sub">هيتبعت للفريق مباشرة على واتساب بالتفاصيل دي</p>
      <div class="summary-box">${msg.replace(/\n/g,"<br>")}</div>
      <a class="btn btn-green full" style="margin-top:16px" href="${link}" target="_blank">إرسال الطلب على واتساب 💬</a>
      <a class="btn" style="margin-top:10px;background:transparent;border:1px solid var(--gold);color:var(--gold)" href="booking.html" onclick="return true">طلب خدمة تانية</a>
    </div>`;
    return;
  }

  const step = currentService.steps[currentStepId];
  let inputHtml = "";
  if(step.type === "choice"){
    inputHtml = `<div class="choice-grid">` + step.options.map(o=>
      `<button type="button" class="choice-btn" onclick="answerStep('${escapeAttr(o)}')">${o}</button>`
    ).join("") + `</div>`;
  } else {
    const inputType = step.type === "number" ? "number" : "text";
    inputHtml = `<div class="form-group">
      <input id="stepInput" class="form-input" type="${inputType}" placeholder="${step.ph||""}" />
      <button class="btn btn-gold full" style="margin-top:12px" onclick="submitTextStep()">التالي ←</button>
    </div>`;
  }

  wrap.innerHTML = `<div class="wizard-card">
    <div class="step-progress">خطوة ${history.length+1}</div>
    <h2 class="section-title" style="font-size:19px">${step.q}</h2>
    ${inputHtml}
    ${history.length ? `<button class="btn" style="margin-top:14px;background:transparent;border:1px solid rgba(212,175,55,.4);color:var(--beige)" onclick="goBack()">→ رجوع</button>` : ""}
  </div>`;

  if(step.type !== "choice"){
    const input = document.getElementById("stepInput");
    input.focus();
    input.addEventListener("keydown", e=>{ if(e.key==="Enter") submitTextStep(); });
  }
}

function escapeAttr(s){ return s.replace(/'/g,"\\'"); }

function submitTextStep(){
  const val = document.getElementById("stepInput").value.trim();
  if(!val){ document.getElementById("stepInput").focus(); return; }
  answerStep(val);
}

function answerStep(value){
  const step = currentService.steps[currentStepId];
  answers[currentStepId] = value;
  history.push(currentStepId);
  currentStepId = step.next(answers);
  renderStep();
}

function goBack(){
  const lastId = history.pop();
  delete answers[lastId];
  currentStepId = lastId;
  renderStep();
}

document.addEventListener("DOMContentLoaded", initBooking);
