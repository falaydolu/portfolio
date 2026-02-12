var revealLayer = document.querySelector('.interactive-reveal');
var bodyImg = document.querySelector('.static-layer');
var isMobile = window.innerWidth <= 768;

var points = [
    { id: 'tag-language', imgX: 50, imgY: 62, mobileX: 52, mobileY: 64, screenX: 0, screenY: 0 },
    { id: 'tag-gaze',     imgX: 42, imgY: 53, mobileX: 38, mobileY: 55, screenX: 0, screenY: 0 },
    { id: 'tag-unspoken', imgX: 53, imgY: 45, mobileX: 49, mobileY: 42, screenX: 0, screenY: 0 },
    { id: 'tag-desire',   imgX: 30, imgY: 34, mobileX: 42, mobileY: 84, screenX: 0, screenY: 0 }
];


function updateLabelPositions() {
    var cw = window.innerWidth;
    var ch = window.innerHeight;
    isMobile = cw <= 768;
    var natW = bodyImg ? bodyImg.naturalWidth : 0;
    var natH = bodyImg ? bodyImg.naturalHeight : 0;
    if (!natW || !natH) return;

    var containerRatio = cw / ch;
    var imageRatio = natW / natH;
    var rw, rh, ox, oy;

    if (imageRatio > containerRatio) {
        rh = ch; rw = ch * imageRatio;
        ox = (cw - rw) / 2; oy = 0;
    } else {
        rw = cw; rh = cw / imageRatio;
        ox = 0; oy = (ch - rh) / 2;
    }

    var centerX = cw / 2;
    var centerY = ch / 2;
    var scaleFactor = isMobile ? 1.1 : 1.4;

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var el = document.getElementById(p.id);
        if (!el) continue;

        var useX = isMobile ? p.mobileX : p.imgX;
        var useY = isMobile ? p.mobileY : p.imgY;
        var px = ox + (useX / 100) * rw;
        var py = oy + (useY / 100) * rh;

        var lx = px - centerX;
        var ly = py - centerY;
        ly -= 0.08 * ch;
        lx *= scaleFactor;
        ly *= scaleFactor;

        p.screenX = lx + centerX;
        p.screenY = ly + centerY;
        el.style.left = p.screenX + 'px';
        el.style.top  = p.screenY + 'px';
    }
}

function tryInit() {
    if (bodyImg && bodyImg.naturalWidth > 0) {
        updateLabelPositions();
    } else {
        setTimeout(tryInit, 200);
    }
}
tryInit();
window.addEventListener('load', updateLabelPositions);
window.addEventListener('resize', updateLabelPositions);

/* ── 手机端强制显示/隐藏（用 setProperty + !important） ── */
function mobileActivate(el) {
    if (!el) return;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transition', 'none', 'important');
    var line = el.querySelector('.line');
    var title = el.querySelector('.title');
    var link = el.querySelector('.tag-link');
    if (line) {
        line.style.setProperty('width', '50px', 'important');
        line.style.setProperty('transition', 'none', 'important');
    }
    if (title) {
        title.style.setProperty('opacity', '1', 'important');
        title.style.setProperty('transition', 'none', 'important');
    }
    if (link) {
        link.style.setProperty('pointer-events', 'auto', 'important');
    }
}

function mobileDeactivate(el) {
    if (!el) return;
    el.style.setProperty('opacity', '0', 'important');
    var line = el.querySelector('.line');
    var title = el.querySelector('.title');
    var link = el.querySelector('.tag-link');
    if (line) line.style.setProperty('width', '0', 'important');
    if (title) title.style.setProperty('opacity', '0', 'important');
    if (link) link.style.setProperty('pointer-events', 'none', 'important');
}

function mobileDeactivateAll() {
    for (var i = 0; i < points.length; i++) {
        mobileDeactivate(document.getElementById(points[i].id));
    }
}

/* ── 桌面端：原始 CSS class 方式 ── */
var isTouching = false;

document.addEventListener('mousemove', function(e) {
    if (isTouching) return;
    var x = e.clientX, y = e.clientY;

    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;

    var thr = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.15;
    for (var i = 0; i < points.length; i++) {
        var p = points[i], el = document.getElementById(p.id);
        if (!el) continue;
        var d = Math.sqrt((x - p.screenX) * (x - p.screenX) + (y - p.screenY) * (y - p.screenY));
        if (d < thr) { el.classList.add('active'); } else { el.classList.remove('active'); }
    }
});

document.addEventListener('mouseleave', function() {
    if (isTouching) return;
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;
    for (var i = 0; i < points.length; i++) {
        var el = document.getElementById(points[i].id);
        if (el) el.classList.remove('active');
    }
});

/* ── 手机端触摸 ── */
var fadeTimer = null;
var mobileRadius = 200;

function handleTouch(e) {
    isTouching = true;
    var touch = e.touches[0];
    if (!touch) return;
    var x = touch.clientX, y = touch.clientY;

    revealLayer.classList.add('touching');
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ' + mobileRadius + 'px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;

    var thr = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.2;
    var hits = '';
    for (var i = 0; i < points.length; i++) {
        var p = points[i], el = document.getElementById(p.id);
        if (!el) continue;
        var d = Math.sqrt((x - p.screenX) * (x - p.screenX) + (y - p.screenY) * (y - p.screenY));
        if (d < thr) {
            mobileActivate(el);
            hits += p.id.replace('tag-','') + ' ';
        } else {
            mobileDeactivate(el);
        }
    }
    debugEl.textContent = 'T:(' + Math.round(x) + ',' + Math.round(y) + ')\nhits: ' + (hits || 'none') + '\ncomputed: ' + (hits ? window.getComputedStyle(document.getElementById(points[0].id)).opacity : '-');

    if (fadeTimer) clearTimeout(fadeTimer);
}

document.addEventListener('touchstart', handleTouch, { passive: true });
document.addEventListener('touchmove', handleTouch, { passive: true });
document.addEventListener('touchend', function() {
    fadeTimer = setTimeout(function() {
        isTouching = false;
        revealLayer.classList.remove('touching');
        revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ' + mobileRadius + 'px)';
        revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;
        mobileDeactivateAll();
    }, 3000);
});
