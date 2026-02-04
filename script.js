const revealLayer = document.querySelector('.interactive-reveal');

// 坐标点配置 (x对应left, y对应top)
const points = [
    { id: 'tag-language', x: 52, y: 54 },
    { id: 'tag-gaze', x: 40, y: 45 },
    { id: 'tag-unspoken', x: 54, y: 32 },
    { id: 'tag-desire', x: 20, y: 15 }
];

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // 1. 遮罩跟随
    const maskValue = `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 400px)`;
    revealLayer.style.WebkitMaskImage = maskValue;
    revealLayer.style.maskImage = maskValue;

    // 2. 距离感应
    const mousePctX = (x / window.innerWidth) * 100;
    const mousePctY = (y / window.innerHeight) * 100;

    points.forEach(point => {
        const el = document.getElementById(point.id);
        if (!el) return;

        const dist = Math.sqrt(
            Math.pow(mousePctX - point.x, 2) + 
            Math.pow(mousePctY - point.y, 2)
        );

        // 20% 感应范围
        if (dist < 20) {
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

