// Глобальные переменные
const codeWord = 'любимая'.toLowerCase();
let attempts = 0;
const catPhrases = ['Опять ошибка? 😾', 'Не сдавайся, подумай! 🐱', 'Я разочарован... 😿', 'Попробуй еще раз! 😼'];
let phraseIndex = 0;
let infiniteRun = false;
let photoClicks = 0;
let animationFrameId;

// Элементы
const mobileStub = document.getElementById('mobile-stub');
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const finalSection = document.getElementById('final-section');
const hackOverlay = document.getElementById('hack-overlay');
const codeInput = document.getElementById('code-input');
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

// Проверка мобильного устройства (упрощена: только по ширине экрана, как в требованиях)
function checkMobile() {
    const isMobile = window.innerWidth <= 1023; // Соответствует требованиям: заглушка для max-width 1023px
    if (isMobile) {
        mobileStub.classList.remove('hidden');
        loginSection.classList.add('hidden');
        mainSection.classList.add('hidden');
        finalSection.classList.add('hidden');
        hackOverlay.classList.add('hidden');
    } else {
        mobileStub.classList.add('hidden');
        loginSection.classList.remove('hidden');
        // Не трогаем другие секции, они управляются логикой приложения
    }
}
checkMobile();
window.addEventListener('resize', checkMobile);

// Обработка ввода кода
codeInput.addEventListener('input', () => {
    const value = codeInput.value.toLowerCase();
    if (value === codeWord) {
        loginSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
        attempts = 0;
        hideCat();
    } else {
        attempts++;
        if (attempts >= 3) {
            hint.classList.remove('hidden');
            showCat();
        }
    }
});

codeInput.addEventListener('focus', hideCat);

// Анимация котика
function showCat() {
    catContainer.classList.add('visible');
    catText.textContent = catPhrases[phraseIndex];
    phraseIndex = (phraseIndex + 1) % catPhrases.length;
}

function hideCat() {
    catContainer.classList.remove('visible');
}

// Обработка hover для "Нет"
noBtn.addEventListener('mouseenter', () => {
    if (infiniteRun) {
        runAwayInfinite();
    } else {
        runAwayTimed();
    }
});

function runAwayTimed() {
    const startTime = performance.now();
    function animate(time) {
        const elapsed = time - startTime;
        if (elapsed < 2000) {
            moveButtonAwayFromMouse();
            animationFrameId = requestAnimationFrame(animate);
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

function runAwayInfinite() {
    function animate() {
        moveButtonAwayFromMouse();
        animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);
}

noBtn.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animationFrameId);
    noBtn.style.transform = 'translate(0, 0)';
});

function moveButtonAwayFromMouse() {
    const rect = noBtn.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const deltaX = mouseX < rect.left ? 20 : -20;
    const deltaY = mouseY < rect.top ? 20 : -20;
    noBtn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

// Обработка клика "Нет"
noBtn.addEventListener('click', () => {
    hackOverlay.classList.remove('hidden');
    bsod.classList.remove('hidden');
    setTimeout(() => {
        bsod.classList.add('hidden');
        matrixCanvas.classList.remove('hidden');
        startMatrix();
        setTimeout(() => {
            matrixCanvas.classList.add('hidden');
            banner.classList.remove('hidden');
        }, 2000);
    }, 2000);
    infiniteRun = true;
});

// Матрица эффект
function startMatrix() {
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const columns = Math.floor(matrixCanvas.width / 20);
    const drops = Array(columns).fill(0);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '15pt monospace';
        drops.forEach((y, i) => {
            const text = '4';
            ctx.fillText(text, i * 20, y * 20);
            if (y * 20 > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    const interval = setInterval(draw, 33);
    setTimeout(() => clearInterval(interval), 2000);
}

// Кнопка "Отмена"
cancelBtn.addEventListener('click', () => {
    hackOverlay.classList.add('hidden');
    banner.classList.add('hidden');
    mainSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    codeInput.value = '';
    attempts = 0;
    hideCat();
    hint.classList.add('hidden');
});

// Обработка "Да" (продолжение)
yesBtn.addEventListener('click', () => {
    // Эффект исчезновения main-section
    mainSection.style.opacity = '0';
    mainSection.style.filter = 'blur(10px)';
    setTimeout(() => {
        mainSection.classList.add('hidden');
        finalSection.classList.remove('hidden');

        // Анимация фона: цвета разъезжаются, оставляя белый фон с градиентным бордером
        document.body.classList.add('final-background');
        
        // Показать точку
        dot.classList.remove('hidden');
        setTimeout(() => {
            dot.classList.add('hidden');
            // Анимация фото
            photo.classList.remove('hidden');
            emojis.classList.remove('hidden');
            caption.classList.remove('hidden');
        }, 1000);
    }, 1000);
});

// Обработка кликов на фото
photo.addEventListener('click', () => {
    photoClicks++;
    if (photoClicks >= 5) {
        thoughtBubble.classList.remove('hidden');
    }
});




    // Дополнительные стили для финального фона (добавьте в CSS, если не добавлено)
    // В styles.css добавьте:
    // .final-background {
    //     background: white !important;
    //     animation: spread-colors 2s forwards;
    //     border: 4px solid;
    //     border-image: linear-gradient(to right, purple, pink, white) 1;
    //     border-image-slice: 1;
    // }
    // @keyframes spread-colors {
    //     0% { background: radial-gradient(circle, purple, pink, white); }
    //     100% { background: white; }
    // }


// Для полноты: убедитесь, что в styles.css добавлены стили для .final-background
// Это завершает script.js. Если нужно, добавьте больше логики или оптимизаций.