/**
 * Vivian Lu Portfolio - Landing Page Logic
 * 处理全屏水墨遮罩跟随及标签距离感应
 */

const viewport = document.querySelector('.viewport');
const revealLayer = document.querySelector('.interactive-reveal');

// 1. 坐标点配置 (必须与 index.html 中的 style 百分比完全对应)
const points = [
    { id: 'tag-language', x: 52, y: 54 },
    { id: 'tag-gaze',     x: 38, y: 45 }, // 对应 gaze.html
    { id: 'tag-unspoken', x: 54, y: 32 }, // 对应 silenced.html
    { id: 'tag-desire',   x: 24, y: 15 }  // 对应 desire.html
];

// 2. 鼠标移动监听
viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();
    
    // 计算鼠标在当前屏幕中的百分比位置 (0-100)
    // 使用 rect 计算是为了适配 iMac 等高分屏和各种缩放比例
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // A. 更新遮罩位置 (使用 CSS 变量提高性能)
    // 遮罩半径设为 250px 以保持“水墨感”，如果觉得太小可以改成 400px
    const maskValue = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 250px)`;
    revealLayer.style.WebkitMaskImage = maskValue;
    revealLayer.style.maskImage = maskValue;

    // B. 距离感应激活标签
    points.forEach(pt => {
        const tag = document.getElementById(pt.id);
        if (!tag) return;

        // 计算鼠标百分比坐标与标签设定位之间的欧几里得距离
        const dist = Math.sqrt(
            Math.pow(xPercent - pt.x, 2) + 
            Math.pow(yPercent - pt.y, 2)
        );

        // 当鼠标进入标签 8% 的距离范围内时激活
        if (dist < 8) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
});

// 3. 鼠标离开视口时重置，防止遮罩残留在屏幕边缘
viewport.addEventListener('mouseleave', () => {
    const hiddenMask = `radial-gradient(circle at -100% -100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 250px)`;
    revealLayer.style.WebkitMaskImage = hiddenMask;
    revealLayer.style.maskImage = hiddenMask;
    
    // 移除所有标签的激活状态
    points.forEach(pt => {
        const tag = document.getElementById(pt.id);
        if (tag) tag.classList.remove('active');
    });
});