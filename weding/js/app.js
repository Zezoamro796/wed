/**
 * تطبيق دعوة الخطوبة - يوسف ونورهان
 * Yousef & Norhan Engagement Invitation App
 */

// تاريخ الخطوبة: الخميس 29 أكتوبر 2026 الساعة 8:00 مساءً
const WEDDING_DATE = new Date('2026-10-29T20:00:00+03:00');

document.addEventListener('DOMContentLoaded', () => {
  fixFileProtocolLinks();
  initMobileDrawer();
  initParticles();
  initCountdown();
  initHeaderScroll();
  initCalendarButtons();
  initGuestbookForm();
  initQuickTags();
});

function fixFileProtocolLinks() {
  if (window.location.protocol === 'file:') {
    document.querySelectorAll('a[href="memory"]').forEach(a => {
      a.setAttribute('href', 'memory.html');
    });
  }
}

/* التحكم في القائمة الجانبية المنسدلة للهواتف (Mobile Drawer) */
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

/* ==========================================================================
   1. Canvas خلفية الجزيئات الذهبية الناعمة
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(Math.floor(width / 35), 45);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * 0.02 + 0.01
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.opacity += Math.sin(Date.now() * p.pulse) * 0.005;

      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.1, Math.min(0.7, p.opacity))})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffd700';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. العداد التنازلي التفاعلي
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minutesEl = document.getElementById('cdMinutes');
  const secondsEl = document.getElementById('cdSeconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const target = WEDDING_DATE.getTime();
    const diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days < 10 ? '0' + days : days;
    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   3. شريط التنقل العلوي عند التمرير
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   4. حفظ الموعد في التقويم (Google Calendar & Apple / Outlook .ics)
   ========================================================================== */
function initCalendarButtons() {
  const btnGoogle = document.getElementById('btnSaveGoogle');
  const btnIcs = document.getElementById('btnSaveIcs');

  const title = encodeURIComponent('حفل خطوبة يوسف ونورهان 💍');
  const details = encodeURIComponent('نتشرف بحضوركم لمشاركتنا فرحة الخطوبة في قاعة فور سيزون');
  const location = encodeURIComponent('قاعة فور سيزون - https://maps.google.com/?q=30.571501,31.472967');

  // Start: 20261029T170000Z (8pm Egypt time UTC+3)
  // End:   20261029T230000Z
  const startTime = '20261029T170000Z';
  const endTime = '20261029T230000Z';

  if (btnGoogle) {
    btnGoogle.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    btnGoogle.target = '_blank';
  }

  if (btnIcs) {
    btnIcs.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }
}

function downloadIcsFile() {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yousef and Norhan Engagement//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:engagement-yousef-norhan-2026@engagement.com',
    'DTSTAMP:20261027T000000Z',
    'DTSTART:20261029T170000Z',
    'DTEND:20261029T230000Z',
    'SUMMARY:حفل خطوبة يوسف ونورهان 💍',
    'DESCRIPTION:نتشرف بحضوركم لمشاركتنا فرحة الخطوبة في قاعة فور سيزون',
    'LOCATION:قاعة فور سيزون (30.571501, 31.472967)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'wedding-yousef-norhan.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   5. أزرار العبارات والتهاني السريعة
   ========================================================================== */
function initQuickTags() {
  const tagBtns = document.querySelectorAll('.tag-btn');
  const messageInput = document.getElementById('guestMessage');

  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (!messageInput) return;

      if (messageInput.value.trim() === '') {
        messageInput.value = text;
      } else {
        messageInput.value += ' ' + text;
      }
      messageInput.focus();
    });
  });
}

/* ==========================================================================
   6. إرسال التهاني والرسائل التذكارية
   ========================================================================== */
function initGuestbookForm() {
  const form = document.getElementById('weddingGuestbookForm');
  const successAlert = document.getElementById('feedbackSuccess');
  const errorAlert = document.getElementById('feedbackError');
  const submitBtn = document.getElementById('btnSubmitWish');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const relation = document.getElementById('guestRelation').value;
    const message = document.getElementById('guestMessage').value.trim();

    if (!name || !message) {
      showError('يرجى كتابة الاسم والرسالة لمتابعة الإرسال.');
      return;
    }

    // تعطيل الزر مؤقتاً أثناء الإرسال
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
      </svg>
      جاري الإرسال...
    `;

    const payload = {
      name: name,
      relation: relation || 'مهنئ كريم',
      message: message,
      date: new Date().toISOString()
    };

    try {
      // المحاولة الأولى: الإرسال إلى API الخادم
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        handleSuccess(name);
      } else {
        throw new Error('Server API failed');
      }
    } catch (err) {
      // في حال تشغيل الموقع كملفات ثابتة بدون خادم، يتم الحفظ في localStorage
      console.log('Falling back to local storage saving...');
      saveToLocalStorage(payload);
      handleSuccess(name);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>إرسال التهنئة للعروسين</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      `;
    }
  });

  function handleSuccess(guestName) {
    form.reset();
    if (errorAlert) errorAlert.style.display = 'none';
    if (successAlert) {
      successAlert.innerHTML = `
        <strong>شكراً لك يا ${escapeHTML(guestName)}! 🤍</strong><br>
        تم حفظ تهنئتك ورسالتك التذكارية للعروسين بنجاح. ستُعرض في صفحة الذكريات.
      `;
      successAlert.style.display = 'block';
      setTimeout(() => {
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
    triggerConfetti();
  }

  function showError(msg) {
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  }
}

function saveToLocalStorage(newMsg) {
  const STORAGE_KEY = 'wedding_wishes_db';
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }

  newMsg.id = 'msg-local-' + Date.now();
  list.unshift(newMsg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

/* احتفال بسيط بالكونفيتي عند نجاح الإرسال */
function triggerConfetti() {
  const count = 40;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.top = '-20px';
    el.style.width = (Math.random() * 8 + 6) + 'px';
    el.style.height = (Math.random() * 12 + 8) + 'px';
    el.style.backgroundColor = ['#ffd700', '#cba135', '#ffffff', '#e6c229', '#f3e5ab'][Math.floor(Math.random() * 5)];
    el.style.opacity = Math.random() + 0.5;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.style.transition = 'all 2.5s ease-out';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = `translate(${(Math.random() - 0.5) * 200}px, 105vh) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    }, 50);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }
}
