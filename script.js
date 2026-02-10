var revealLayer = document.querySelector('.interactive-reveal');
var bodyImg = document.querySelector('.static-layer');

var points = [
    { id: 'tag-language', imgX: 52, imgY: 54, mobileX: 52, mobileY: 54, screenX: 0, screenY: 0 },
    { id: 'tag-gaze',     imgX: 38, imgY: 45, mobileX: 38, mobileY: 45, screenX: 0, screenY: 0 },
    { id: 'tag-unspoken', imgX: 54, imgY: 32, mobileX: 54, mobileY: 32, screenX: 0, screenY: 0 },
    { id: 'tag-desire',   imgX: 21, imgY: 15, mobileX: 21, mobileY: 15, screenX: 0, screenY: 0 }
];

/* debug panel - 确认修好后删除 */
var debugEl = document.createElement('div');
debugEl.style.cssText = 'position:fixed;bottom:80px;left:10px;z-index:9999;color:lime;font-size:11px;font-family:monospace;pointer-events:none;background:rgba(0,0,0,0.8);padding:8px;border-radius:4px;white-space:pre;max-width:90vw;';
document.body.appendChild(debugEl);
debugEl.textContent = 'debug ready';

function updateLabelPositions() {
    var cw = window.innerWidth;
    var ch = window.innerHeight;
    var natW = bodyImg ? bodyImg.naturalWidth : 0;
    var natH = bodyImg ? bodyImg.naturalHeight : 0;

    if (!natW || !natH) {
        debugEl.textContent = 'no image: ' + natW + 'x' + natH;
        return;
    }

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
    var isMobile = cw <= 768;
    var scaleFactor = isMobile ? 1.1 : 1.4;
    var info = 'img:' + natW + 'x' + natH + ' vp:' + cw + 'x' + ch + '\n';

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
        info += p.id.replace('tag-','') + ':(' + Math.round(p.screenX) + ',' + Math.round(p.screenY) + ') ';
    }
    debugEl.textContent = info;
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

/* mouse (desktop) */
document.addEventListener('mousemove', function(e) {
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
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;
    for (var i = 0; i < points.length; i++) {
        var el = document.getElementById(points[i].id);
        if (el) el.classList.remove('active');
    }
});

/* touch (mobile) */
var fadeTimer = null;
var mobileRadius = 200;

function handleTouch(e) {
    var touch = e.touches[0];
    if (!touch) return;
    var x = touch.clientX, y = touch.clientY;

    revealLayer.classList.add('touching');
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ' + mobileRadius + 'px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;

    var thr = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.2;
    var info = 'T:(' + Math.round(x) + ',' + Math.round(y) + ') thr:' + Math.round(thr) + '\n';
    for (var i = 0; i < points.length; i++) {
        var p = points[i], el = document.getElementById(p.id);
        if (!el) continue;
        var d = Math.sqrt((x - p.screenX) * (x - p.screenX) + (y - p.screenY) * (y - p.screenY));
        info += p.id.replace('tag-','') + ':(' + Math.round(p.screenX) + ',' + Math.round(p.screenY) + ') d=' + Math.round(d) + (d < thr ? ' HIT' : '') + '\n';
        if (d < thr) { el.classList.add('active'); } else { el.classList.remove('active'); }
    }
    debugEl.textContent = info;

    if (fadeTimer) clearTimeout(fadeTimer);
}

document.addEventListener('touchstart', handleTouch, { passive: true });
document.addEventListener('touchmove', handleTouch, { passive: true });
document.addEventListener('touchend', function() {
    fadeTimer = setTimeout(function() {
        revealLayer.classList.remove('touching');
        revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ' + mobileRadius + 'px)';
        revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;
        for (var i = 0; i < points.length; i++) {
            var el = document.getElementById(points[i].id);
            if (el) el.classList.remove('active');
        }
    }, 3000);
});