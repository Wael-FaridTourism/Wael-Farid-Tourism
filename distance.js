/* ==== حاسبة المسافة من الفندق للحرم ==== */

const HARAM_POINTS = {
  makkah: { name: "المسجد الحرام", lat: 21.4225, lng: 39.8262 },
  madinah: { name: "المسجد النبوي", lat: 24.4672, lng: 39.6112 }
};

const CITY_BOUNDS = {
  makkah: { south: 21.28, west: 39.70, north: 21.55, east: 39.95 },
  madinah: { south: 24.35, west: 39.50, north: 24.60, east: 39.72 }
};

let selectedCity = "makkah";
let autocomplete = null;
let selectedPlace = null;

function initDistanceTool(){
  const cityButtons = document.querySelectorAll(".city-btn");
  cityButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      cityButtons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      selectedCity = btn.dataset.city;
      document.getElementById("hotelInput").value = "";
      selectedPlace = null;
      document.getElementById("resultBox").style.display = "none";
      setupAutocompleteBounds();
    });
  });

  const input = document.getElementById("hotelInput");
  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["lodging"],
    fields: ["name", "geometry", "formatted_address"]
  });
  setupAutocompleteBounds();

  autocomplete.addListener("place_changed", ()=>{
    const place = autocomplete.getPlace();
    if(!place.geometry){
      selectedPlace = null;
      return;
    }
    selectedPlace = place;
  });

  document.getElementById("calcBtn").addEventListener("click", calculateDistance);
}

function setupAutocompleteBounds(){
  const b = CITY_BOUNDS[selectedCity];
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(b.south, b.west),
    new google.maps.LatLng(b.north, b.east)
  );
  autocomplete.setBounds(bounds);
  autocomplete.setOptions({ strictBounds: true });
}

function calculateDistance(){
  const resultBox = document.getElementById("resultBox");
  const errorBox = document.getElementById("errorBox");
  errorBox.style.display = "none";

  if(!selectedPlace || !selectedPlace.geometry){
    errorBox.textContent = "من فضلك اختار اسم الفندق من الاقتراحات اللي بتظهر تحت الحقل";
    errorBox.style.display = "block";
    return;
  }

  const btn = document.getElementById("calcBtn");
  btn.textContent = "جاري الحساب...";
  btn.disabled = true;

  const haram = HARAM_POINTS[selectedCity];
  const destination = new google.maps.LatLng(haram.lat, haram.lng);
  const origin = selectedPlace.geometry.location;

  const service = new google.maps.DistanceMatrixService();

  Promise.all([
    new Promise(resolve=>{
      service.getDistanceMatrix({
        origins: [origin], destinations: [destination],
        travelMode: google.maps.TravelMode.WALKING
      }, (res, status)=> resolve(status==="OK" ? res.rows[0].elements[0] : null));
    }),
    new Promise(resolve=>{
      service.getDistanceMatrix({
        origins: [origin], destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING
      }, (res, status)=> resolve(status==="OK" ? res.rows[0].elements[0] : null));
    })
  ]).then(([walk, drive])=>{
    btn.textContent = "احسب المسافة 📍";
    btn.disabled = false;

    if(!walk || walk.status !== "OK"){
      errorBox.textContent = "معلش، مقدرناش نحسب المسافة لهذا الفندق دلوقتي، جرب اسم تاني أو تواصل معنا مباشرة";
      errorBox.style.display = "block";
      return;
    }

    document.getElementById("resHotelName").textContent = selectedPlace.name;
    document.getElementById("resHaramName").textContent = haram.name;
    document.getElementById("resDistance").textContent = walk.distance.text;
    document.getElementById("resWalk").textContent = walk.duration.text;
    document.getElementById("resDrive").textContent = drive ? drive.duration.text : "—";
    resultBox.style.display = "block";
    resultBox.scrollIntoView({behavior:"smooth", block:"center"});
  });
}

function gmapsLoadError(){
  document.getElementById("gmapsError").style.display = "block";
}
