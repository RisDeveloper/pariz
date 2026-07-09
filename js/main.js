// =============================================================
// FARISH — Liquid Glass Portfolio — shared behaviour
// =============================================================

const BIRTH_DATE = "2009-10-11"; // 11 Oktober 2009 — dipakai untuk hitung umur otomatis
const API_BASE = ""; // isi mis. "http://localhost:5000" kalau backend jalan di domain/port lain

/* ---------- 1) hitung umur otomatis dari tanggal lahir ---------- */
function calculateAge(birthDateStr){
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if(!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function renderAge(){
  const el = document.querySelector("[data-age]");
  if(!el) return;
  el.textContent = calculateAge(BIRTH_DATE);

  const dateEl = document.querySelector("[data-birthdate]");
  if(dateEl){
    const d = new Date(BIRTH_DATE);
    dateEl.textContent = d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
  }
}

/* ---------- 2) tandai link navbar yang aktif (single-page hash) ---------- */
function markActiveNav(){
  const hash = location.hash || "#beranda";
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
}

/* ---------- 2b) scroll spy — aktor nav berdasarkan section yang terlihat ---------- */
function initScrollSpy(){
  const sections = document.querySelectorAll("section[id]");
  if(!sections.length) return;
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(s => observer.observe(s));
}

/* ---------- 3) ambient water-ripple canvas (elemen tanda tangan) ---------- */
function initRippleCanvas(){
  const canvas = document.getElementById("ripple-canvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let ripples = [];
  let lastSpawn = 0;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  resize();
  window.addEventListener("resize", resize);

  function spawnRipple(x, y){
    ripples.push({
      x: x * dpr,
      y: y * dpr,
      r: 0,
      maxR: (180 + Math.random() * 160) * dpr,
      alpha: 0.16,
      hue: Math.random() > 0.5 ? "10,132,255" : "34,195,193"
    });
  }

  function tick(t){
    ctx.clearRect(0, 0, w, h);

    if(t - lastSpawn > 2600 && !prefersReducedMotion){
      spawnRipple(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.7);
      lastSpawn = t;
    }

    ripples.forEach(rp => {
      rp.r += 0.6 * dpr;
      rp.alpha *= 0.992;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rp.hue}, ${Math.max(rp.alpha, 0)})`;
      ctx.lineWidth = 1.4 * dpr;
      ctx.stroke();
    });

    ripples = ripples.filter(rp => rp.r < rp.maxR);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- 4) form kontak -> backend Flask -> MySQL ---------- */
function initContactForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;
  const status = document.getElementById("form-status");
  const btn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    if(!payload.name || !payload.email || !payload.message){
      status.textContent = "Semua field wajib diisi.";
      status.className = "err";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Mengirim...";

    try{
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if(res.ok){
        status.textContent = "Pesan terkirim, terima kasih!";
        status.className = "ok";
        form.reset();
      } else {
        status.textContent = data.error || "Gagal mengirim pesan.";
        status.className = "err";
      }
    } catch(err){
      status.textContent = "Tidak bisa terhubung ke server. Pastikan backend aktif.";
      status.className = "err";
    } finally {
      btn.disabled = false;
      btn.textContent = "Kirim Pesan";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderAge();
  markActiveNav();
  initScrollSpy();
  initRippleCanvas();
  initContactForm();
});
