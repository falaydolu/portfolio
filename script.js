const revealLayer = document.querySelector('.interactive-reveal');
const bodyImg = document.querySelector('.static-layer');

// 每个标签在 **原始图片** 上的位置（百分比）
// 调整这些值来移动标签在图片上的锚点
const points = [
    { id: 'tag-language', imgX: 52, imgY: 61 },
    { id: 'tag-gaze',     imgX: 42, imgY: 54 },
    { id: 'tag-unspoken', imgX: 54, imgY: 45 },
    { id: 'tag-desire',   imgX: 30, imgY: 32 }
];

/* ── 核心：把图片坐标 → 屏幕坐标 ── */
function updateLabelPositions() {
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const natW = bodyImg.naturalWidth;
    const natH = bodyImg.naturalHeight;
    if (!natW || !natH) return;

    // 1) object-fit: cover 的实际渲染尺寸与偏移
    const containerRatio = cw / ch;
    const imageRatio = natW / natH;
    let rw, rh, ox, oy;

    if (imageRatio > containerRatio) {
        // 图片更宽 → 高度撑满，左右裁切
        rh = ch; rw = ch * imageRatio;
        ox = (cw - rw) / 2; oy = 0;
    } else {
        // 图片更高 → 宽度撑满，上下裁切
        rw = cw; rh = cw / imageRatio;
        ox = 0; oy = (ch - rh) / 2;
    }

    const centerX = cw / 2;
    const centerY = ch / 2;

    points.forEach(p => {
        const el = document.getElementById(p.id);
        if (!el) return;

        // 图片上的百分比 → 容器内像素（未变换前）
        let px = ox + (p.imgX / 100) * rw;
        let py = oy + (p.imgY / 100) * rh;

        // 2) 模拟 CSS transform: scale(1.4) translateY(-8%)
        //    transform-origin 默认 center
        //    执行顺序（右→左）：先 translateY，再 scale
        let lx = px - centerX;
        let ly = py - centerY;

        ly -= 0.08 * ch;   // translateY(-8%)
        const scaleFactor = window.innerWidth <= 768 ? 1.1 : 1.4;
        lx *= scaleFactor;
        ly *= scaleFactor;

        const finalX = lx + centerX;
        const finalY = ly + centerY;

        el.style.left = finalX + 'px';
        el.style.top  = finalY + 'px';
    });
}

// 图片加载后计算 + 窗口缩放时重算
if (bodyImg.complete) {
    updateLabelPositions();
} else {
    bodyImg.addEventListener('load', updateLabelPositions);
}
window.addEventListener('resize', updateLabelPositions);

/* ── 鼠标交互 ── */
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // 遮罩跟随
    const maskValue = `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)`;
    revealLayer.style.WebkitMaskImage = maskValue;
    revealLayer.style.maskImage = maskValue;

    // 距离感应（用像素距离，而非百分比）
    const threshold = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) * 0.15;

    points.forEach(p => {
        const el = document.getElementById(p.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const elCX = rect.left + rect.width / 2;
        const elCY = rect.top  + rect.height / 2;

        const dist = Math.sqrt((x - elCX) ** 2 + (y - elCY) ** 2);

        if (dist < threshold) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
});

document.addEventListener('mouseleave', () => {
    const reset = `radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)`;
    revealLayer.style.WebkitMaskImage = reset;
    revealLayer.style.maskImage = reset;
    points.forEach(p => document.getElementById(p.id)?.classList.remove('active'));
});



let fadeTimer = null;
const mobileRadius = 200; // 手机端遮罩半径，比桌面小

function handleTouch(e) {
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;

    // 显示暗层
    revealLayer.classList.add('touching');

    // 遮罩跟随手指
    const maskValue = `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ${mobileRadius}px)`;
    revealLayer.style.WebkitMaskImage = maskValue;
    revealLayer.style.maskImage = maskValue;

    // 清除之前的淡出计时
    if (fadeTimer) clearTimeout(fadeTimer);
}

document.addEventListener('touchstart', (e) => {
    handleTouch(e);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    handleTouch(e);
}, { passive: true });

document.addEventListener('touchend', () => {
    // 松手后 1.5 秒淡出
    fadeTimer = setTimeout(() => {
        revealLayer.classList.remove('touching');
        const reset = `radial-gradient(circle at -1000px -1000px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ${mobileRadius}px)`;
        revealLayer.style.WebkitMaskImage = reset;
        revealLayer.style.maskImage = reset;
    }, 1500);
});


