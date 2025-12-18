    /* =========================
      CONFIG (CHỈ CẦN SỬA Ở ĐÂY)
    ========================== */
    const CONFIG = {
      couple: "Minh & Lan",
      weddingDateISO: "2026-01-20T10:00:00+07:00",

      // Hero slideshow: lấy từ ảnh của bạn, rõ nét, không blur
      heroSlides: [
        "images/wedding-05.jpg",
        "images/wedding-06.jpg",
        "images/wedding-07.jpg",
        "images/wedding-08.jpg",
        "images/wedding-09.jpg"
      ],

      // Album: wedding-01..20
      albumTotal: 20,

      // QR + bank text
      gift: {
        bride: {
          qr: "qr/bride.png",
          bankText: "CÔ DÂU • NGÂN HÀNG • SỐ TK • TÊN CHỦ TK"
        },
        groom: {
          qr: "qr/groom.png",
          bankText: "CHÚ RỂ • NGÂN HÀNG • SỐ TK • TÊN CHỦ TK"
        }
      },

      // Google Sheet Apps Script endpoint (Deploy Web App)
      WISH_ENDPOINT: "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhMTLv7MZ7VK-aDJWr9hfZC0MelXtOneRV5Lja7558w6iqZ7yyuEJhJ1eaZjJjAW-J9VO9zGfcLxBKQPv0bBheZYNb4_9f8i20EqOvFLVqudqLamlJBmEAiAhX15YUrXMsWVD7dK-s4WqGW9mPazp4KS9P-JS5i48cNKpZgHuv7w4bi-Yuf6zXzUaFxRjO0nRCw38rH9s0aqS3HmuV-nR6o30QS_zIXZnWaAM7_yKxjxOKgEjfZni5-bYYaEJSAfkhVgYLIQixYQ2QZm9Xm3uq9fa4Xsg&lib=MEGbOlqWLsRJGZu3Ea4CFnZvkCWubFdXR" // <-- dán URL Web App vào đây (nếu dùng)
    };

    /* =========================
      Helpers
    ========================== */
    const $ = (q, el=document) => el.querySelector(q);
    const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

    const toast = $("#toast");
    function showToast(text){
      toast.textContent = text;
      toast.classList.add("show");
      setTimeout(()=>toast.classList.remove("show"), 2400);
    }

    /* =========================
      1) Mobile Drawer
    ========================== */
    const drawer = $("#drawer");
    $("#burger").addEventListener("click", ()=> drawer.classList.add("show"));
    drawer.addEventListener("click", (e)=>{ if(e.target === drawer) drawer.classList.remove("show"); });
    $$(".drawer-link").forEach(a=> a.addEventListener("click", ()=> drawer.classList.remove("show")));

    /* =========================
      2) Hero slideshow (mượt - dùng requestAnimationFrame cho parallax)
    ========================== */
    const heroMedia = $("#heroMedia");
    const heroSlides = CONFIG.heroSlides.map((src, idx)=>{
      const div = document.createElement("div");
      div.className = "slide" + (idx === 0 ? " active" : "");
      div.style.backgroundImage = `url('${src}')`;
      heroMedia.appendChild(div);
      return div;
    });

    let currentSlide = 0;
    setInterval(()=>{
      if(heroSlides.length <= 1) return;
      heroSlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add("active");
    }, 6500);

    // Parallax nhẹ, chống giật
    let ticking = false;
    window.addEventListener("scroll", ()=>{
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        const y = window.scrollY * 0.07;
        heroSlides.forEach(s => s.style.transform = `translateY(${y}px) scale(1.03)`);
        ticking = false;
      });
    }, { passive:true });

    /* =========================
      3) Reveal on scroll
    ========================== */
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });

    $$(".reveal").forEach(el => io.observe(el));

    /* =========================
      4) Countdown
    ========================== */
    const dEl = $("#d"), hEl=$("#h"), mEl=$("#m"), sEl=$("#s");
    const target = new Date(CONFIG.weddingDateISO).getTime();

    function pad(n){ return String(n).padStart(2,"0"); }
    function tick(){
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const d = Math.floor(diff / (1000*60*60*24));
      diff -= d * (1000*60*60*24);
      const h = Math.floor(diff / (1000*60*60));
      diff -= h * (1000*60*60);
      const m = Math.floor(diff / (1000*60));
      diff -= m * (1000*60);
      const s = Math.floor(diff / 1000);

      dEl.textContent = d;
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);

    /* =========================
      5) Gallery (auto load wedding-01..20)
    ========================== */
    const galleryGrid = $("#galleryGrid");
    const modal = $("#imgModal");
    const modalImg = $("#modalImg");

    for(let i=1;i<=CONFIG.albumTotal;i++){
      const idx = String(i).padStart(2,"0");
      const src = `images/wedding-${idx}.jpg`;

      const item = document.createElement("div");
      item.className = "g-item";

      const img = document.createElement("img");
      img.src = src;
      img.alt = `Ảnh cưới ${idx}`;
      img.loading = "lazy";

      item.appendChild(img);

      item.addEventListener("click", ()=>{
        modalImg.src = src;
        modal.classList.add("show");
      });

      galleryGrid.appendChild(item);
    }

    modal.addEventListener("click", ()=> modal.classList.remove("show"));

    /* =========================
      6) Gift tabs + copy
    ========================== */
    const qrImg = $("#qrImg");
    const bankText = $("#bankText");
    const copyBtn = $("#copyBtn");
    const tabs = $$(".tab");

    function setGift(which){
      const data = CONFIG.gift[which];
      qrImg.src = data.qr;
      bankText.value = data.bankText;
      tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === which));
    }
    tabs.forEach(t => t.addEventListener("click", ()=> setGift(t.dataset.tab)));
    setGift("bride");

    copyBtn.addEventListener("click", async ()=>{
      try{
        await navigator.clipboard.writeText(bankText.value);
        showToast("Đã copy thông tin ✅");
      }catch{
        bankText.select();
        document.execCommand("copy");
        showToast("Đã copy ✅");
      }
    });

    /* =========================
      7) Wishes -> Google Sheet Apps Script (or local fallback)
    ========================== */
    const wishForm = $("#wishForm");
    wishForm.addEventListener("submit", async (e)=>{
      e.preventDefault();

      const payload = {
        name: $("#wishName").value.trim(),
        phone: $("#wishPhone").value.trim(),
        relation: $("#wishRelation").value.trim(),
        message: $("#wishMessage").value.trim(),
        createdAt: new Date().toISOString()
      };

      if(!payload.name || !payload.message){
        showToast("Bạn nhập thiếu thông tin rồi nè 😊");
        return;
      }

      if (CONFIG.WISH_ENDPOINT) {
        try {
          await fetch(CONFIG.WISH_ENDPOINT, {
            method: "POST",
            mode: "no-cors", // ⭐ BẮT BUỘC
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
            });

            showToast("Đã gửi lời chúc 💛");
            wishForm.reset();

            // reload list sau 0.8s
            setTimeout(loadWishes, 800);
            return;
        } catch (err) {
            console.error(err);
        }
    }



      // local fallback
      try{
        const key = "wedding_wishes_local";
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(payload);
        localStorage.setItem(key, JSON.stringify(arr));
        showToast("Chưa cấu hình Sheet — đã lưu tạm ✅");
        wishForm.reset();
      }catch{
        showToast("Gửi thất bại 😢 (trình duyệt chặn lưu)");
      }
    });

    /* =========================
      8) Add to calendar (ICS download)
    ========================== */
    function downloadICS({title, startISO, endISO, location, description}){
      function toICSDate(iso){
        const d = new Date(iso);
        const pad2 = (n)=> String(n).padStart(2,'0');
        return (
          d.getUTCFullYear() +
          pad2(d.getUTCMonth()+1) +
          pad2(d.getUTCDate()) + "T" +
          pad2(d.getUTCHours()) +
          pad2(d.getUTCMinutes()) +
          pad2(d.getUTCSeconds()) + "Z"
        );
      }

      const uid = `${Date.now()}@wedding`;
      const dtStart = toICSDate(startISO);
      const dtEnd = toICSDate(endISO);

      const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invite//VI//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICSDate(new Date().toISOString())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "wedding-event.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }

    const weddingStart = CONFIG.weddingDateISO;
    const weddingEnd = new Date(new Date(weddingStart).getTime() + 2*60*60*1000).toISOString();

    $("[data-ics='wedding']").addEventListener("click", ()=>{
      downloadICS({
        title: "TIỆC CƯỚI • Minh & Lan",
        startISO: weddingStart,
        endISO: weddingEnd,
        location: "Cái Bè, Tiền Giang",
        description: "Trân trọng kính mời bạn đến chung vui cùng Minh & Lan. Xem thêm tại thiệp cưới online."
      });
      showToast("Đã tạo file lịch ✅");
    });

    $("[data-ics='checkin']").addEventListener("click", ()=>{
      const start = new Date(new Date(weddingStart).getTime() - 60*60*1000).toISOString();
      const end = weddingStart;
      downloadICS({
        title: "ĐÓN KHÁCH • CHECK-IN • Minh & Lan",
        startISO: start,
        endISO: end,
        location: "Khu vực check-in",
        description: "Đón khách – chụp ảnh – check-in."
      });
      showToast("Đã tạo file lịch ✅");
    });

    $("#addToCalendarBtn").addEventListener("click", ()=>{
      $("[data-ics='wedding']").click();
    });

    /* =========================
      9) Music (mobile-friendly autoplay after first interaction)
    ========================== */
    const music = $("#bgMusic");
    const musicBtn = $("#musicBtn");
    let isPlaying = false;

    function tryAutoPlay(){
      music.play().then(()=>{
        isPlaying = true;
        musicBtn.classList.add("playing");
        musicBtn.textContent = "🔊";
      }).catch(()=>{});
      window.removeEventListener("click", tryAutoPlay);
      window.removeEventListener("touchstart", tryAutoPlay);
    }
    window.addEventListener("click", tryAutoPlay, { once:true });
    window.addEventListener("touchstart", tryAutoPlay, { once:true });

    musicBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      if(isPlaying){
        music.pause();
        isPlaying = false;
        musicBtn.classList.remove("playing");
        musicBtn.textContent = "🎵";
      }else{
        music.play().then(()=>{
          isPlaying = true;
          musicBtn.classList.add("playing");
          musicBtn.textContent = "🔊";
        }).catch(()=>{});
      }
    });

    /* =========================
      10) Falling petals (perf friendly)
    ========================== */
    const petalCanvas = $("#petalCanvas");
    const pctx = petalCanvas.getContext("2d");
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    function resizeCanvas(){
      petalCanvas.width = Math.floor(innerWidth * DPR);
      petalCanvas.height = Math.floor(innerHeight * DPR);
      petalCanvas.style.width = innerWidth + "px";
      petalCanvas.style.height = innerHeight + "px";
      pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function rand(a,b){ return a + Math.random()*(b-a); }

    const particles = [];
    const MAX = matchMedia("(max-width: 600px)").matches ? 20 : 32;

    function spawn(){
      const isMai = Math.random() < 0.88;
      particles.push({
        x: rand(-40, innerWidth + 40),
        y: rand(-innerHeight, -40),
        r: isMai ? rand(5, 8) : rand(6, 10),
        vy: rand(0.45, 1.10),
        vx: rand(-0.22, 0.22),
        a: rand(0, Math.PI*2),
        rot: rand(-0.010, 0.010),
        sway: rand(0.6, 1.2),
        isMai,
        alpha: rand(0.35, 0.70)
      });
    }
    for(let i=0;i<MAX;i++) spawn();

    function drawMai(p){
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.a);

      // hoa mai vàng
      pctx.fillStyle = `rgba(243,196,65,${p.alpha})`;
      for(let i=0;i<5;i++){
        pctx.rotate((Math.PI*2)/5);
        pctx.beginPath();
        pctx.ellipse(0, -p.r*1.05, p.r*0.6, p.r*1.05, 0, 0, Math.PI*2);
        pctx.fill();
      }
      // nhụy
      pctx.fillStyle = `rgba(210,120,20,${Math.min(1,p.alpha+0.08)})`;
      pctx.beginPath();
      pctx.arc(0,0, p.r*0.30, 0, Math.PI*2);
      pctx.fill();

      pctx.restore();
    }

    function drawRose(p){
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.a);

      pctx.fillStyle = `rgba(225,95,125,${p.alpha})`;
      for(let i=0;i<6;i++){
        pctx.rotate(Math.PI/3);
        pctx.beginPath();
        pctx.ellipse(0, -p.r, p.r*0.62, p.r, 0, 0, Math.PI*2);
        pctx.fill();
      }
      pctx.restore();
    }

    function animate(){
      pctx.clearRect(0,0,innerWidth,innerHeight);
      for(const p of particles){
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.a) * p.sway * 0.16;
        p.a += p.rot;

        if(p.isMai) drawMai(p);
        else drawRose(p);

        if(p.y > innerHeight + 60){
          p.y = rand(-140, -40);
          p.x = rand(-40, innerWidth + 40);
        }
      }
      requestAnimationFrame(animate);
    }
    animate();

    const wishListEl = document.getElementById("wishList");

function escapeHTML(str){
  return (str || "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );
}

async function loadWishes(){
  if(!CONFIG.WISH_ENDPOINT) return;

  try{
    const res = await fetch(CONFIG.WISH_ENDPOINT); // GET
    const data = await res.json();

    wishListEl.innerHTML = data.slice(0, 15).map(w => `
      <div class="wish-item">
        <div class="name">${escapeHTML(w.name || "Khách mời")}</div>
        <div class="meta">
          ${escapeHTML(w.relation || "")}
          • ${new Date(w.time).toLocaleString()}
        </div>
        <div class="msg">${escapeHTML(w.message || "")}</div>
      </div>
    `).join("");

  }catch(err){
    console.error(err);
    wishListEl.innerHTML =
      `<div class="wish-item">Không tải được lời chúc 😥</div>`;
  }
}

// load khi mở trang
loadWishes();

// auto refresh mỗi 5 giây (realtime nhẹ)
setInterval(loadWishes, 5000);


