/* ================================================================
   QR SHIELD — script.js
   ================================================================ */


// ── GLITCH SCRAMBLE EFFECT ─────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/|\\[]{}~';
const rand  = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function buildGlitchLogo(el) {
  const original = 'QRSHIELD';
  el.innerHTML = '';
  original.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    span.dataset.original = ch;
    // SHIELD portion (index 2+) starts cyan
    if (i >= 2) span.style.color = 'var(--cyan)';
    el.appendChild(span);
  });
}

function scrambleIn(el) {
  const chars    = el.querySelectorAll('.char');
  const original = 'QRSHIELD';
  let iterations = 0;

  clearInterval(el._timer);
  el._timer = setInterval(() => {
    chars.forEach((span, i) => {
      if (iterations > i * 1.8) {
        // Letter has settled — restore original
        span.textContent  = original[i];
        span.classList.remove('scrambling');
        span.style.color      = i >= 2 ? 'var(--cyan)' : '';
        span.style.textShadow = 'none'; // no glow
      } else {
        // Still scrambling
        span.textContent  = rand();
        span.classList.add('scrambling');
        span.style.color      = 'var(--cyan)';
        span.style.textShadow = 'none'; // no glow
      }
    });

    iterations++;

    if (iterations > 18 + chars.length) {
      clearInterval(el._timer);
      // Final clean restore
      chars.forEach((span, i) => {
        span.textContent  = original[i];
        span.classList.remove('scrambling');
        span.style.color      = i >= 2 ? 'var(--cyan)' : '';
        span.style.textShadow = 'none';
      });
    }
  }, 45);
}

function scrambleOut(el) {
  const chars    = el.querySelectorAll('.char');
  const original = 'QRSHIELD';
  let flashes    = 0;

  clearInterval(el._timer);
  el._timer = setInterval(() => {
    chars.forEach((span, i) => {
      if (flashes < 4) {
        span.textContent      = rand();
        span.style.color      = 'var(--cyan)';
        span.style.textShadow = 'none'; // no glow
      } else {
        span.textContent  = original[i];
        span.classList.remove('scrambling');
        span.style.color      = i >= 2 ? 'var(--cyan)' : '';
        span.style.textShadow = 'none';
      }
    });

    flashes++;
    if (flashes >= 6) clearInterval(el._timer);
  }, 40);
}

// Initialise every glitch logo on the page
document.querySelectorAll('.glitch-logo').forEach(el => {
  buildGlitchLogo(el);
  el.addEventListener('mouseenter', () => scrambleIn(el));
  el.addEventListener('mouseleave', () => scrambleOut(el));
});


// ── MOBILE NAV ────────────────────────────────────────────────
function toggleMenu() {
  const links  = document.querySelector('.nav-links');
  const isOpen = links.style.display === 'flex';

  if (isOpen) {
    links.style.display = 'none';
    return;
  }

  Object.assign(links.style, {
    display:       'flex',
    flexDirection: 'column',
    position:      'absolute',
    top:           '70px',
    left:          '0',
    right:         '0',
    background:    'rgba(3,8,17,0.98)',
    padding:       '20px',
    borderBottom:  '1px solid #102040',
    zIndex:        '499',
  });
}

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    links.style.display = 'none';
  });
});


// ── DRAG-AND-DROP QR UPLOAD ───────────────────────────────────
const zone = document.getElementById('uploadZone');

zone.addEventListener('dragover', e => {
  e.preventDefault();
  zone.classList.add('drag');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('drag');
});

zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processFile(file);
});

function handleFile(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const label = document.getElementById('selectedFile');
  label.style.display = 'block';
  label.textContent   = '📎 ' + file.name;
  runScan('QR image: ' + file.name);
}


// ── DEMO SCANNER ──────────────────────────────────────────────
function scanURL() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;
  runScan(url);
}

function runScan(input) {
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultCard').classList.remove('show');
  document.getElementById('scanning').classList.add('show');

  setTimeout(() => {
    document.getElementById('scanning').classList.remove('show');
    showDemoResult(input);
  }, 2200);
}

function showDemoResult(input) {
  // Demo simulation — replace POST call with real app.py endpoint
  const scenarios = [
    {
      verdict: 'safe', score: 8, checks: [
        { label: 'Typosquatting check',  status: 'pass' },
        { label: 'Suspicious TLD',       status: 'pass' },
        { label: 'Redirect chain',       status: 'pass' },
        { label: 'VirusTotal engines',   status: 'pass' },
        { label: 'Google Safe Browsing', status: 'pass' },
        { label: 'URL obfuscation',      status: 'pass' },
      ],
    },
    {
      verdict: 'danger', score: 87, checks: [
        { label: 'Typosquatting check',  status: 'fail' },
        { label: 'Suspicious TLD',       status: 'fail' },
        { label: 'Redirect chain',       status: 'warn' },
        { label: 'VirusTotal engines',   status: 'fail' },
        { label: 'Google Safe Browsing', status: 'fail' },
        { label: 'URL obfuscation',      status: 'warn' },
      ],
    },
    {
      verdict: 'warn', score: 44, checks: [
        { label: 'Typosquatting check',  status: 'pass' },
        { label: 'Suspicious TLD',       status: 'warn' },
        { label: 'Redirect chain',       status: 'warn' },
        { label: 'VirusTotal engines',   status: 'pass' },
        { label: 'Google Safe Browsing', status: 'pass' },
        { label: 'URL obfuscation',      status: 'warn' },
      ],
    },
  ];

  // Pick scenario based on URL content
  const low = input.toLowerCase();
  let s = scenarios[0];
  if (low.includes('payp') || low.includes('amaz') || low.includes('secure') ||
      low.includes('verify') || low.includes('login')) {
    s = scenarios[1];
  } else if (low.includes('bit.ly') || low.includes('tinyurl') ||
             low.includes('free')   || low.includes('click')) {
    s = scenarios[2];
  }

  // Verdict bar
  const bar = document.getElementById('verdictBar');
  bar.className = 'verdict-bar ' + s.verdict;
  document.getElementById('verdictText').textContent = s.verdict.toUpperCase();

  // Decoded URL
  const decoded = document.getElementById('urlDecoded');
  decoded.textContent = input.length > 60 ? input.slice(0, 60) + '…' : input;

  // Animated score ring
  const arc          = document.getElementById('scoreArc');
  const numEl        = document.getElementById('scoreNum');
  const circumference = 163.4;
  let current        = 0;

  const scoreTimer = setInterval(() => {
    current = Math.min(current + 2, s.score);
    numEl.textContent           = current;
    arc.style.strokeDashoffset  = circumference - (circumference * current / 100);
    if (current >= s.score) clearInterval(scoreTimer);
  }, 20);

  // Check list
  const list  = document.getElementById('checkList');
  const icons = { pass: '✓', fail: '✕', warn: '!' };
  list.innerHTML = '';

  s.checks.forEach(c => {
    const li = document.createElement('li');
    li.className = 'check-item';
    li.innerHTML = `<span class="status ${c.status}">${icons[c.status]}</span><span>${c.label}</span>`;
    list.appendChild(li);
  });

  document.getElementById('resultCard').classList.add('show');
}


// ── SCROLL REVEAL ANIMATIONS ──────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeDown 0.6s ease both';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card, .step, .threat-card, .ext-feat').forEach(el => {
  observer.observe(el);
});
