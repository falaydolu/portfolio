var revealLayer = document.querySelector('.interactive-reveal');
var bodyImg = document.querySelector('.static-layer');
var isMobile = window.innerWidth <= 768;
var introFinished = false;

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

/* ── 入场动画：全部同时浮现再淡出 ── */
function playIntro() {
    for (var i = 0; i < points.length; i++) {
        var el = document.getElementById(points[i].id);
        if (el) el.classList.add('active');
    }
    setTimeout(function() {
        for (var i = 0; i < points.length; i++) {
            var el = document.getElementById(points[i].id);
            if (el) el.classList.remove('active');
        }
        introFinished = true;
    }, 4000);
}

function tryInit() {
    if (bodyImg && bodyImg.naturalWidth > 0) {
        updateLabelPositions();
        playIntro();
    } else {
        setTimeout(tryInit, 200);
    }
}
tryInit();
window.addEventListener('load', updateLabelPositions);
window.addEventListener('resize', function() {
    updateLabelPositions();
    measureWordWidths();
    compensateShift(currentWord);
});

/* ══════ 乱码 scramble 效果 ══════ */
var scramblePool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%&?';
var scrambleTimers = {};

function scrambleText(el, targetText, duration, key) {
    if (!el) return;
    key = key || 'default';
    if (scrambleTimers[key]) cancelAnimationFrame(scrambleTimers[key]);

    var startTime = Date.now();
    var len = targetText.length;

    function step() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var result = '';

        for (var i = 0; i < len; i++) {
            var ch = targetText[i];
            if (ch === ' ' || ch === ',') {
                result += ch;
                continue;
            }
            /* 从左到右逐字"定住" */
            var settle = progress * 1.6 - (i / len) * 0.6;
            if (settle >= 1) {
                result += ch;
            } else {
                result += scramblePool[Math.floor(Math.random() * scramblePool.length)];
            }
        }
        el.textContent = result;

        if (progress < 1) {
            scrambleTimers[key] = requestAnimationFrame(step);
        } else {
            el.textContent = targetText;
        }
    }
    scrambleTimers[key] = requestAnimationFrame(step);
}

/* ── 标签 hover 乱码：鼠标进入时乱码再回来 ── */
var titleOriginals = {};

function initLabelScramble() {
    for (var i = 0; i < points.length; i++) {
        var el = document.getElementById(points[i].id);
        if (!el) continue;
        var titleEl = el.querySelector('.title');
        if (!titleEl) continue;
        titleOriginals[points[i].id] = titleEl.textContent;

        (function(tagId, tEl) {
            var link = tEl.closest('.tag-link') || tEl.parentElement;
            link.addEventListener('mouseenter', function() {
                if (!tEl.closest('.work-tag').classList.contains('active')) return;
                scrambleText(tEl, titleOriginals[tagId], 500, 'label-' + tagId);
            });
        })(points[i].id, titleEl);
    }
}
initLabelScramble();

/* ── 底部文字替换 + "when" 锚定 ── */
var t2El = document.querySelector('.t2');
var floatingText = document.querySelector('.floating-text');
var currentWord = 'it';
var baseWidth = 0;
var wordWidths = {};

/* 从 DOM 读取每个标签的文字 */
var wordMap = {};
for (var i = 0; i < points.length; i++) {
    var _el = document.getElementById(points[i].id);
    if (_el) {
        var _t = _el.querySelector('.title');
        if (_t) wordMap[points[i].id] = _t.textContent.trim();
    }
}

/* 预测每个替换词对应的容器宽度，用于补偿位移 */
function measureWordWidths() {
    if (!t2El || !floatingText) return;
    var saved = t2El.textContent;
    var allWords = ['it'];
    for (var id in wordMap) allWords.push(wordMap[id]);
    for (var w = 0; w < allWords.length; w++) {
        t2El.textContent = allWords[w];
        wordWidths[allWords[w]] = floatingText.offsetWidth;
    }
    t2El.textContent = saved;
    baseWidth = wordWidths['it'];
}
measureWordWidths();

function compensateShift(word) {
    if (!floatingText || !baseWidth) return;
    var w = wordWidths[word] || baseWidth;
    floatingText.style.marginLeft = ((w - baseWidth) / 2) + 'px';
}

function swapWord(newWord) {
    if (newWord === currentWord) return;
    currentWord = newWord;
    compensateShift(newWord);
    scrambleText(t2El, newWord, 350, 'bottom-text');
}

/* ── 手机端强制显示/隐藏 ── */
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

/* ── 桌面端鼠标 ── */
var isTouching = false;

document.addEventListener('mousemove', function(e) {
    if (isTouching || !introFinished) return;
    var x = e.clientX, y = e.clientY;

    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;

    var thr = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.09;
    var closestId = null;
    var closestDist = Infinity;

    for (var i = 0; i < points.length; i++) {
        var p = points[i], el = document.getElementById(p.id);
        if (!el) continue;
        var d = Math.sqrt((x - p.screenX) * (x - p.screenX) + (y - p.screenY) * (y - p.screenY));
        if (d < thr) {
            el.classList.add('active');
            if (d < closestDist) { closestDist = d; closestId = p.id; }
        } else {
            el.classList.remove('active');
        }
    }

    if (closestId && wordMap[closestId]) {
        swapWord(wordMap[closestId]);
    } else {
        swapWord('it');
    }
});

document.addEventListener('mouseleave', function() {
    if (isTouching || !introFinished) return;
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;
    for (var i = 0; i < points.length; i++) {
        var el = document.getElementById(points[i].id);
        if (el) el.classList.remove('active');
    }
    swapWord('it');
});

/* ── 手机端触摸 ── */
var fadeTimer = null;
var mobileRadius = 200;

function handleTouch(e) {
    if (!introFinished) return;
    isTouching = true;
    var touch = e.touches[0];
    if (!touch) return;
    var x = touch.clientX, y = touch.clientY;

    revealLayer.classList.add('touching');
    revealLayer.style.WebkitMaskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ' + mobileRadius + 'px)';
    revealLayer.style.maskImage = revealLayer.style.WebkitMaskImage;

    var thr = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.12;
    var closestId = null;
    var closestDist = Infinity;

    for (var i = 0; i < points.length; i++) {
        var p = points[i], el = document.getElementById(p.id);
        if (!el) continue;
        var d = Math.sqrt((x - p.screenX) * (x - p.screenX) + (y - p.screenY) * (y - p.screenY));
        if (d < thr) {
            mobileActivate(el);
            if (d < closestDist) { closestDist = d; closestId = p.id; }
        } else {
            mobileDeactivate(el);
        }
    }

    if (closestId && wordMap[closestId]) {
        swapWord(wordMap[closestId]);
    } else {
        swapWord('it');
    }

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
        swapWord('it');
    }, 3000);
});