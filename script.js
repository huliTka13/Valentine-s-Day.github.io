// Глобальные переменные
const codeWord = 'любимая'.toLowerCase();
let attempts = 0;
const catPhrases = ['Когда я так к тебе обратился – это шокировало нас обоих', 'Я к тебе так обратился, когда мы сидели за барной стойкой в трукост', 'Я расстроен... ', 'Давай помогу с началом слова: любима...'];
let photoClicks = 0;
let animationFrameId;
let buttonPosX = 0; // Будет рассчитано динамически при показе
let buttonPosY = 0;
let mouseX = 0;
let mouseY = 0;
let isRunning = false;
let runStartTime = null;
let isMainVisible = false; // Флаг для предотвращения прыжка при открытии
let progressStartTime = null;
let progressAnimationId = null;
let isBackgroundRunning = true; // Изначально запущен
let lastMouseTime = 0; // Для debounce mousemove




// Элементы
const bgCanvas = document.getElementById('bg-canvas'); // Новый canvas для фона
const mobileStub = document.getElementById('mobile-stub');
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const finalSection = document.getElementById('final-section');
const hackOverlay = document.getElementById('hack-overlay');
const codeInput = document.getElementById('code-input');
const submitBtn = document.getElementById('submit-btn'); // Кнопка для проверки
const hint = document.getElementById('hint');

const catContainer = document.getElementById('cat-container');
const catText = document.getElementById('cat-text');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const dot = document.getElementById('dot');
const photo = document.getElementById('photo');
const emojis = document.getElementById('emojis');
const caption = document.getElementById('caption');
const thoughtBubble = document.getElementById('thought-bubble');
const bsod = document.getElementById('bsod');
const matrixCanvas = document.getElementById('matrix-canvas');
const banner = document.getElementById('banner');
const cancelBtn = document.getElementById('cancel-btn');
const hearts = document.getElementById('hearts'); // SVG для анимации сердец

// Отладка загрузки изображения котика
const catImg = document.getElementById('cat-img');
catImg.addEventListener('load', () => {
    console.log('Cat image loaded successfully:', catImg.src);
});
catImg.addEventListener('error', () => {
    console.error('Cat image load error:', catImg.src);
});

// Отладка завершения transition (для показа и скрытия)
catContainer.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'right') {
        console.log('Transition ended. Current right:', getComputedStyle(catContainer).right, 'Display:', getComputedStyle(catContainer).display);
    }
});

// Анимация фона на canvas (улучшенная версия с несколькими волнами и повышенной скоростью)
let waveParams = []; // Массив параметров для нескольких волн

// Анимация фона на canvas (заменена на предоставленную WebGL-анимацию)
function initBackgroundCanvas() {
    (function(){
        var id = "bg-canvas"; // Изменено на ваш canvas ID
        var cvs = document.getElementById(id);
        if(!cvs) return;
        var cfg = {
            bg: "#ffffff", pts: [{"x":0.1,"y":0.5,"r":1,"a":1,"c":"#fbcfe8","s":0.25,"rt":0.86,"d":0.5,"rgb":0.018},{"x":0.9,"y":0.5,"r":1.3,"a":0.5,"c":"#f9a8d4","s":0.35,"rt":1.56,"d":0.6,"rgb":0},{"x":0.5,"y":0.2,"r":1.8,"a":0.7,"c":"#fce7f3","s":0.35,"rt":3.06,"d":0.7,"rgb":0},{"x":0.5,"y":0.5,"r":0.8,"a":0.1,"c":"#f5ebff","d":0,"rgb":0,"s":0.3,"rt":2.16}],
            speed: 3, flow: -0.1, noise: 0.08,
            hard: 0.5, gamma: 1, pulse: 0, 
            spin: -0.07, distort: 2, globalDistort: true,
            mouse: 0.3, mouseActive: true, 
            rgb: 0.032, globalRGB: false, blendMode: 0, grainSize: 0.5, banding: 44
        };
        var gl, p, buffer; 
        var t=0, m={x:-1,y:-1};
        function dbmInit() {
            gl = cvs.getContext("webgl", {alpha: false});
            if (!gl) return false;
            var VS = "attribute vec3 position;varying vec2 v_uv;void main(){v_uv=position.xy*0.5+0.5;gl_Position=vec4(position,1.0);}"; var FS = "precision mediump float; uniform float u_time; uniform vec2 u_res; uniform vec3 u_bg; uniform float u_noise; uniform float u_grain_size; uniform float u_hard; uniform float u_flow; uniform float u_pulse_amp; uniform float u_spin; uniform float u_banding; uniform float u_gamma; uniform float u_global_rgb; uniform float u_global_distort; uniform vec2 u_mouse; uniform float u_mouse_force; uniform int u_blend_mode; uniform vec4 u_pts[8]; uniform vec3 u_cols[8]; uniform vec3 u_pt_params[8]; uniform float u_pt_rot[8]; uniform bool u_use_global_distort; uniform bool u_use_global_rgb; uniform int u_count; varying vec2 v_uv; float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); } float noise(vec2 p){ vec2 ip = floor(p); vec2 u = fract(p); u = u*u*(3.0-2.0*u); float res = mix(mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x), mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y); return res*res; } vec3 getLayer(vec2 uv, float channelOffset) { float aspect=u_res.x/u_res.y; uv.x*=aspect; vec2 center=vec2(0.5*aspect,0.5); float s=sin(u_spin*u_time),c=cos(u_spin*u_time); mat2 rot=mat2(c,-s,s,c); uv-=center; uv*=rot; uv+=center; if(length(u_mouse)>0.0 && u_mouse_force!=0.0){ vec2 m=u_mouse; m.x*=aspect; float md=distance(uv,m); uv+=(uv-m)*(0.1*u_mouse_force/(md+0.05)); } vec3 accCol=vec3(0.0); float accW=0.0; for(int i=0;i<8;i++){ if(i<u_count){ vec4 pt=u_pts[i]; vec3 col=u_cols[i]; vec3 params=u_pt_params[i]; float angle=u_pt_rot[i]; float dStr = u_use_global_distort ? u_global_distort : params.x; float rgbStr = u_use_global_rgb ? u_global_rgb : params.y; float stretch = params.z; vec2 localUV = uv; localUV += vec2(channelOffset * rgbStr, 0.0); if(dStr > 0.0) { float n = noise(localUV * 3.0 + u_time * 0.2); localUV += (n - 0.5) * dStr * 0.3; } vec2 pos=pt.xy; pos.x*=aspect; float sa=sin(angle), ca=cos(angle); mat2 ptRot = mat2(ca, sa, -sa, ca); vec2 dVec = localUV - pos; dVec = ptRot * dVec; dVec.y /= (1.0 - stretch * 0.9); float pulse=sin(u_time*(1.0+float(i)*0.2))*u_pulse_amp; float d=length(dVec); float r=pt.z+pulse; float w=max(0.0,1.0-d/(r+0.01)); w=pow(w,u_hard); if (u_banding > 0.5) { w = floor(w * u_banding) / u_banding; } w*=pt.w; if (u_blend_mode == 1) { accCol += col * w; } else { accCol += col * w; accW += w; } }} if (u_blend_mode == 1) return u_bg + accCol; else { if(accW>0.001) return mix(u_bg, accCol/accW, clamp(accW,0.0,1.0)); return u_bg; } } void main(){ vec2 uv = gl_FragCoord.xy / u_res; float vig = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5)); float r = getLayer(uv, -1.0).r; float g = getLayer(uv, 0.0).g; float b = getLayer(uv, 1.0).b; vec3 final = vec3(r,g,b); final = pow(final, vec3(1.0/u_gamma)); final *= vig; float grainVal = (rand(v_uv * (u_res/u_grain_size) + u_time) - 0.5) * u_noise; gl_FragColor=vec4(final+grainVal,1.0); }";
            p = gl.createProgram();
            var s = function(t, src) { var x=gl.createShader(t); gl.shaderSource(x,src); gl.compileShader(x); return x; };
            gl.attachShader(p, s(gl.VERTEX_SHADER, VS)); gl.attachShader(p, s(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
            buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
            return true;
        }
        if(cfg.mouseActive){ window.addEventListener("mousemove", function(e){ var r=cvs.getBoundingClientRect(); if(r.width && r.height) { m.x=(e.clientX-r.left)/r.width; m.y=1.0-(e.clientY-r.top)/r.height; } }); }
        function hex(h){ var i=parseInt(h.slice(1),16); return [(i>>16)&255,(i>>8)&255,i&255].map(function(x){return x/255}) }
        var isRunning = true;
        if ('IntersectionObserver' in window) { var observer = new IntersectionObserver(function(entries) { entries.forEach(function(entry) { if (entry.isIntersecting) { if (!isRunning) { isRunning = true; f(); } } else { isRunning = false; } }); }); observer.observe(cvs); }
        function f(){
            if (!isRunning || !gl || !isBackgroundRunning) return;
            if (!isRunning || !gl) return;
            t += 0.01 * cfg.speed;
            var w=cvs.clientWidth || cvs.parentNode.clientWidth, h=cvs.clientHeight || cvs.parentNode.clientHeight;
            if(cvs.width!==w || cvs.height!==h){cvs.width=w;cvs.height=h;gl.viewport(0,0,w,h);}
            gl.useProgram(p);
            var loc = gl.getAttribLocation(p,"position");
            gl.enableVertexAttribArray(loc); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(gl.getUniformLocation(p,"u_time"), t);
            gl.uniform2f(gl.getUniformLocation(p,"u_res"), w, h);
            gl.uniform1f(gl.getUniformLocation(p,"u_noise"), cfg.noise);
            gl.uniform1f(gl.getUniformLocation(p,"u_grain_size"), cfg.grainSize);
            gl.uniform1f(gl.getUniformLocation(p,"u_hard"), cfg.hard);
            gl.uniform1f(gl.getUniformLocation(p,"u_flow"), cfg.flow);
            gl.uniform1f(gl.getUniformLocation(p,"u_pulse_amp"), cfg.pulse);
            gl.uniform1f(gl.getUniformLocation(p,"u_spin"), cfg.spin);
            gl.uniform1f(gl.getUniformLocation(p,"u_banding"), cfg.banding || 0.0);
            gl.uniform1f(gl.getUniformLocation(p,"u_global_distort"), cfg.distort);
            gl.uniform1i(gl.getUniformLocation(p,"u_use_global_distort"), cfg.globalDistort?1:0);
            gl.uniform1f(gl.getUniformLocation(p,"u_global_rgb"), cfg.rgb);
            gl.uniform1i(gl.getUniformLocation(p,"u_use_global_rgb"), cfg.globalRGB?1:0);
            gl.uniform1i(gl.getUniformLocation(p,"u_blend_mode"), cfg.blendMode);
            gl.uniform1f(gl.getUniformLocation(p,"u_mouse_force"), cfg.mouseActive ? cfg.mouse : 0.0);
            gl.uniform2f(gl.getUniformLocation(p,"u_mouse"), m.x, m.y);
            gl.uniform1f(gl.getUniformLocation(p,"u_gamma"), cfg.gamma);
            var bg = hex(cfg.bg);
            gl.uniform3f(gl.getUniformLocation(p,"u_bg"), bg[0],bg[1],bg[2]);
            var fP=[], fC=[], fPar=[], fRot=[];
            cfg.pts.forEach(function(pt,i){
                var mx = Math.sin(t*0.5+i)*0.1 + Math.sin(t*0.2)*cfg.flow;
                var my = Math.cos(t*0.3+i)*0.1;
                fP.push(pt.x+mx, 1.0-(pt.y+my), pt.r, pt.a);
                var c = hex(pt.c);
                fC.push(c[0],c[1],c[2]);
                fPar.push(pt.d||0.0, pt.rgb||0.0, pt.s||0.0);
                fRot.push(pt.rt||0.0);
            });
            for(var i=cfg.pts.length; i<8; i++){ fP.push(0,0,0,0); fC.push(0,0,0); fPar.push(0,0,0); fRot.push(0); }
            gl.uniform4fv(gl.getUniformLocation(p,"u_pts"), new Float32Array(fP));
            gl.uniform3fv(gl.getUniformLocation(p,"u_cols"), new Float32Array(fC));
            gl.uniform3fv(gl.getUniformLocation(p,"u_pt_params"), new Float32Array(fPar));
            gl.uniform1fv(gl.getUniformLocation(p,"u_pt_rot"), new Float32Array(fRot));
            gl.uniform1i(gl.getUniformLocation(p,"u_count"), cfg.pts.length);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(f);
        }
        function dbmRunner() { if(dbmInit()) f(); }
        dbmRunner();
    })();
}

// Проверка мобильного устройства
function checkMobile() {
    const isMobile = window.innerWidth <= 1023;
    if (isMobile) {
        mobileStub.classList.remove('hidden');
        loginSection.classList.add('hidden');
        mainSection.classList.add('hidden');
        finalSection.classList.add('hidden');
        hackOverlay.classList.add('hidden');
        bgCanvas.style.display = 'none'; // Отключаем canvas на мобильных
        console.log('Mobile mode detected: Hiding content and background.');
    } else {
        mobileStub.classList.add('hidden');
        loginSection.classList.remove('hidden');
        bgCanvas.style.display = 'block';
        initBackgroundCanvas(); // Инициализируем анимацию фона только на десктопе
        console.log('Desktop mode: Showing login and starting background animation.');
    }
}
checkMobile();
window.addEventListener('resize', checkMobile);

// Обработка клика по кнопке "Проверить" (проверка кода)
submitBtn.addEventListener('click', () => {
    const value = codeInput.value.toLowerCase().trim();
    console.log('Submit clicked. Input value:', value);
    if (value === codeWord) {
        console.log('Success: Correct code entered.');
        loginSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
        attempts = 0;
        hideCat(); // Скрываем котика при успехе
        hint.classList.add('hidden');
        codeInput.classList.remove('error');

        // Расчёт исходной позиции (справа от yes-btn с gap 40px)
        const yesRect = yesBtn.getBoundingClientRect();
        buttonPosX = yesRect.right + 40; // Справа от yes-btn + 40px
        buttonPosY = yesRect.top; // На одном уровне по Y

        noBtn.style.position = 'absolute';
        noBtn.style.left = `${buttonPosX}px`;
        noBtn.style.top = `${buttonPosY}px`;

        // Задержка для предотвращения прыжка (500ms)
        isMainVisible = false;
        setTimeout(() => {
            isMainVisible = true;
        }, 500);
    } else {
        attempts++;
        console.log(`Wrong attempt: ${attempts}`);
        codeInput.value = ''; // Стираем введённое слово
        codeInput.classList.add('error'); // Добавляем красную тень с первого раза
        
        // Показываем котика с последовательной фразой (начиная с первой попытки)
        const phraseIndex = (attempts - 1) % catPhrases.length; // Последовательный индекс (0,1,2,3,0,1...)
        catText.textContent = catPhrases[phraseIndex];
        showCat();
        
        // Опционально: показываем hint, если нужно (в исходном коде он пустой, но можно заполнить)
        hint.classList.remove('hidden');
    }
});

// Ресайз (расчёт позиции динамически)
window.addEventListener('resize', () => {
        fitCaption();
    if (!mainSection.classList.contains('hidden')) {
        const yesRect = yesBtn.getBoundingClientRect();
        buttonPosX = yesRect.right + 40;
        buttonPosY = yesRect.top;
        noBtn.style.left = `${buttonPosX}px`;
        noBtn.style.top = `${buttonPosY}px`;
        
    }
});

// Запрет ввода пробела в поле
codeInput.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault(); // Запрещаем ввод пробела
    }
    if (e.key === 'Enter') {
        console.log('Enter pressed in input.');
        submitBtn.click();
    }
});

// Скрытие котика и сброс ошибки при фокусе на поле ввода
codeInput.addEventListener('focus', () => {
    console.log('Focus on input: Attempting to hide cat.');
    console.trace(); // Стек вызовов
    hideCat();
    codeInput.classList.remove('error'); // Снимаем красную тень при фокусе
});

// Обработка Enter в поле ввода
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter pressed in input.');
        submitBtn.click();
    }
});


// Анимация котика
function showCat() {
    console.log('showCat called. Current attempts:', attempts);
    setTimeout(() => {
        catContainer.classList.remove('hidden'); // КРИТИЧЕСКИЙ ФИКС: Удаляем 'hidden' для display: block
        catContainer.classList.add('visible');
        console.log('Showing cat with phrase:', catText.textContent);
        console.log('Cat container classes after update:', catContainer.classList.toString());
        console.log('Cat container style.right:', catContainer.style.right || getComputedStyle(catContainer).right);
        console.log('Cat container display:', getComputedStyle(catContainer).display); // Debug: должно быть 'block'
        console.log('Cat container visibility:', getComputedStyle(catContainer).visibility, 'Opacity:', getComputedStyle(catContainer).opacity); // Дополнительно
    }, 300);
}

function hideCat() {
    catContainer.classList.remove('visible');
    console.log('Hiding cat.');
    console.log('Cat container classes after remove visible:', catContainer.classList.toString());
    console.log('Cat container style.right:', catContainer.style.right || getComputedStyle(catContainer).right);
    // После анимации (transition 0.5s) применяем 'hidden' для полного скрытия
    setTimeout(() => {
        catContainer.classList.add('hidden');
        console.log('Applied hidden after transition. Classes:', catContainer.classList.toString());
        console.log('Cat container display after hidden:', getComputedStyle(catContainer).display); // Должно быть 'none'
    }, 500); // Соответствует transition-duration в CSS
}




function runAway() {
    function animate(time) {
        const elapsed = time - runStartTime;
        if (elapsed < 3000 && isRunning) { // Максимум 3 секунды
            moveButtonAwayFromMouse();
            animationFrameId = requestAnimationFrame(animate);
        } else {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

function runAwayInfinite() {
    function animate() {
        if (isRunning) { // Бесконечно, но только пока isRunning (курсор в зоне)
            moveButtonAwayFromMouse();
            animationFrameId = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationFrameId);
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

function moveButtonAwayFromMouse() {
    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dirX = (mouseX - centerX) > 0 ? -1 : 1;
    const dirY = (mouseY - centerY) > 0 ? -1 : 1;

    buttonPosX += dirX * 5;
    buttonPosY += dirY * 5;

    // Ограничения: строго в пределах 0 до max (без буфера)
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    buttonPosX = Math.max(0, Math.min(maxX, buttonPosX));
    buttonPosY = Math.max(0, Math.min(maxY, buttonPosY));

    // Применение позиции
    noBtn.style.left = `${buttonPosX}px`;
    noBtn.style.top = `${buttonPosY}px`;

    // Пост-проверка и корректировка (для безопасности)
    const newRect = noBtn.getBoundingClientRect();
    if (newRect.left < 0) buttonPosX = 0;
    if (newRect.top < 0) buttonPosY = 0;
    if (newRect.right > window.innerWidth) buttonPosX = window.innerWidth - rect.width;
    if (newRect.bottom > window.innerHeight) buttonPosY = window.innerHeight - rect.height;

    noBtn.style.left = `${buttonPosX}px`;
    noBtn.style.top = `${buttonPosY}px`;

    // Debug log (удалите после тестирования)
    console.log(`Button pos: (${buttonPosX}, ${buttonPosY}), Distance to mouse: ${Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2))}`);
}


// Обработка клика "Нет" (BSOD сразу, баннер через 5 сек)
noBtn.addEventListener('click', () => {
    // Скрываем другие секции
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    finalSection.classList.add('hidden');

    hackOverlay.classList.remove('hidden');
    bsod.classList.remove('hidden');
    
    isBackgroundRunning = false; // Пауза фона для оптимизации
    
    // Показываем баннер через 5 секунд
    setTimeout(() => {
        banner.classList.remove('hidden');
        
        // Запускаем прогресс-бар
        progressStartTime = performance.now();
        updateProgress();
    }, 5000); // 5000ms = 5 секунд
    
    infiniteRun = true;
});


// Функция обновления прогресс-бара (заполняется за 20 сек)
function updateProgress() {
    const elapsed = performance.now() - progressStartTime;
    const duration = 20000; // 20 секунд
    const progress = Math.min(elapsed / duration, 1); // 0 to 1
    const percent = Math.floor(progress * 100);
    
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${percent}%`;
    
    if (progress < 1) {
        progressAnimationId = requestAnimationFrame(updateProgress);
    } else {
        // Опционально: что-то после 100% (например, alert или ничего)
    }
}

// Кнопка "Отмена" (возврат на mainSection, с оптимизациями)
cancelBtn.addEventListener('click', () => {
    // Остановить все анимации сразу
    cancelAnimationFrame(progressAnimationId);
    cancelAnimationFrame(animationFrameId);
    infiniteRun = false;
    isBackgroundRunning = true; // Возобновить фон

    // Сброс прогресса
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';

    // Асинхронное скрытие для избежания фриза
    setTimeout(() => {
        hackOverlay.classList.add('hidden');
        bsod.classList.add('hidden');
        banner.classList.add('hidden');
        loginSection.classList.add('hidden'); // Скрываем логин (пользователь уже прошёл)
        
        // Возврат на mainSection
        mainSection.classList.remove('hidden');
        
        // Восстановление позиции кнопки "Нет" (если нужно, расчёт как в исходном коде)
        const yesRect = yesBtn.getBoundingClientRect();
        buttonPosX = yesRect.right + 40;
        buttonPosY = yesRect.top;
        noBtn.style.left = `${buttonPosX}px`;
        noBtn.style.top = `${buttonPosY}px`;
        
        isMainVisible = true; // Для активации mousemove
        
        hideCat(); // Если котик был виден
        hint.classList.add('hidden');
    }, 0);
});
   

// Обработка "Да"
yesBtn.addEventListener('click', () => {
    // Эффект исчезновения main-section
     mainSection.style.opacity = '0';
    mainSection.style.filter = 'blur(10px)';
    setTimeout(() => {
        mainSection.classList.add('hidden');
        finalSection.classList.remove('hidden');

        // Скрыть canvas с волнами
        bgCanvas.style.display = 'none';

        // Анимация фона: цвета разъезжаются, оставляя белый фон (без бордера)
        document.body.classList.add('final-background');
        
        // Запрет скролла на body
        document.body.classList.add('no-scroll');
        
        // Показать точку
        dot.classList.remove('hidden');
        setTimeout(() => {
            dot.classList.add('hidden');
            // Анимация фото (выплывание из точки)
            photo.classList.remove('hidden');
            emojis.classList.remove('hidden');
            caption.classList.remove('hidden');

            // Авто-fit текста после рендера
            setTimeout(fitCaption, 0);
        }, 1000);

        // Запуск анимации сердец (заменяет волны)
        initHeartsAnimation();
    }, 1000);
    isBackgroundRunning = false; // Пауза на финале
});

// Обработка кликов на фото
photo.addEventListener('click', () => {
    photoClicks++;
    if (photoClicks >= 5) {
        thoughtBubble.classList.remove('hidden');
    }
});

// Доступность: Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Можно добавить логику фокуса, но базово tabindex уже есть
    }
});

// Анимация сердец (добавлена для финальной страницы)
function initHeartsAnimation() {
    const colors = ["#FFB6C1", "#FF69B4", "#f7ddebff", "#cf79b0ff"]; // Только 4 тона розового, без разноцветности
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_XLINK = "http://www.w3.org/1999/xlink";

    let heartsRy = [];

    function useTheHeart(n) {
        let use = document.createElementNS(SVG_NS, 'use');
        use.n = n;
        use.setAttributeNS(SVG_XLINK, 'xlink:href', '#heart');
        use.setAttributeNS(null, 'transform', `scale(${use.n})`);
        use.setAttributeNS(null, 'fill', colors[n % colors.length]);
        use.setAttributeNS(null, 'x', -69);
        use.setAttributeNS(null, 'y', -69);
        use.setAttributeNS(null, 'width', 138);
        use.setAttributeNS(null, 'height', 138);
        use.setAttributeNS(null, 'opacity', 0.1 + (n / 18) * 0.3); // Уменьшенная полупрозрачность для более плавного градиентного наложения (от 0.2 до 0.5)

        heartsRy.push(use);
        hearts.appendChild(use);
    }

    for (let n = 18; n >= 0; n--) {
        useTheHeart(n);
    }

    function Frame() {
        window.requestAnimationFrame(Frame);
        for (let i = 0; i < heartsRy.length; i++) {
            if (heartsRy[i].n < 18) {
                heartsRy[i].n += 0.05; // Замедленная анимация для "шире" переходов во времени
            } else {
                heartsRy[i].n = 0;
                hearts.appendChild(heartsRy[i]);
            }
            heartsRy[i].setAttributeNS(null, 'transform', `scale(${heartsRy[i].n})`);
            // Динамическая opacity для лучшего размытия и наложения
            heartsRy[i].setAttributeNS(null, 'opacity', 0.2 + (heartsRy[i].n / 18) * 0.3);
        }
    }

    Frame();
}

// Функция для автоматического уменьшения размера текста, если он не влезает
function fitCaption() {
    const caption = document.getElementById('caption');
    if (!caption || finalSection.classList.contains('hidden')) return; // Только если финальная секция видна

    let fs = 28; // Исходный размер
    caption.style.fontSize = `${fs}px`;
    caption.style.overflow = 'hidden'; // Временно скрываем скролл для проверки

    // Пока текст выходит за пределы (scrollHeight > clientHeight), уменьшаем font-size
    while (caption.scrollHeight > caption.clientHeight && fs > 16) { // Минимум 16px
        fs--;
        caption.style.fontSize = `${fs}px`;
    }

    caption.style.overflow = 'auto'; // Восстанавливаем скролл на всякий случай
}