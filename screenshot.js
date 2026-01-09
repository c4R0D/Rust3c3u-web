// 截图轮播功能
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.screenshot-carousel');
    const indicatorsContainer = document.querySelector('.screenshot-indicators');
    const leftArrow = document.querySelector('.screenshot-arrow-left');
    const rightArrow = document.querySelector('.screenshot-arrow-right');

    let currentSlideIndex = 0;
    let slides = [];
    let totalSlides = 0;

    // 从CSV文件加载图片数据
    function loadScreenshotData() {
        fetch('images.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法加载截图数据文件');
                }
                return response.text();
            })
            .then(csvData => {
                parseCSVData(csvData);
                setupCarousel();
            })
            .catch(error => {
                console.error('加载截图数据失败:', error);
                // 如果CSV文件不存在，使用默认示例数据
                useDefaultScreenshots();
            });
    }

    // 解析CSV数据
    function parseCSVData(csvData) {
        const lines = csvData.split('\n');
        slides = [];

        lines.forEach(line => {
            // 跳过空行和注释行
            if (line.trim() === '' || line.startsWith('#')) return;

            // 处理CSV行，考虑可能包含逗号的字段
            const columns = parseCSVLine(line);
            if (columns.length >= 2) {
                const name = columns[0].trim();
                const path = columns[1].trim();

                if (name && path) {
                    slides.push({ name, path });
                }
            }
        });

        totalSlides = slides.length;
    }

    // 简单的CSV行解析函数
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        // 添加最后一个字段
        result.push(current);
        return result;
    }

    // 使用默认截图数据（当CSV文件不存在时）
    function useDefaultScreenshots() {
        slides = [
            { name: "Rust Elytra Client GUI界面", path: "https://via.placeholder.com/800x450/1a1a1a/f0a020?text=Rust+Elytra+Client+GUI" },
            { name: "自动飞行设置界面", path: "https://via.placeholder.com/800x450/1a1a1a/f0a020?text=自动飞行设置" },
            { name: "安全设置选项", path: "https://via.placeholder.com/800x450/1a1a1a/f0a020?text=安全设置选项" },
            { name: "Baritone集成界面", path: "https://via.placeholder.com/800x450/1a1a1a/f0a020?text=Baritone集成" }
        ];
        totalSlides = slides.length;
        setupCarousel();
    }

    // 设置轮播图
    function setupCarousel() {
        if (totalSlides === 0) {
            carousel.innerHTML = '<div class="screenshot-slide active"><div class="screenshot-caption">暂无截图数据</div></div>';
            return;
        }

        // 清空现有轮播内容
        carousel.innerHTML = '';
        indicatorsContainer.innerHTML = '';

        // 创建轮播幻灯片
        slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = `screenshot-slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = slide.path;
            img.alt = slide.name;
            img.className = 'screenshot-image';

            // 添加图片加载错误处理
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/800x450/1a1a1a/f0a020?text=图片加载失败';
            };

            const caption = document.createElement('div');
            caption.className = 'screenshot-caption';
            caption.textContent = slide.name;

            slideElement.appendChild(img);
            slideElement.appendChild(caption);
            carousel.appendChild(slideElement);

            // 创建指示器
            const indicator = document.createElement('button');
            indicator.className = `screenshot-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `查看截图: ${slide.name}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        // 设置箭头事件监听
        leftArrow.addEventListener('click', showPreviousSlide);
        rightArrow.addEventListener('click', showNextSlide);

        // 添加键盘导航支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') showPreviousSlide();
            if (e.key === 'ArrowRight') showNextSlide();
        });

        // 可选：添加自动轮播功能
        // startAutoPlay();
    }

    // 显示指定幻灯片
    function goToSlide(index) {
        // 更新当前索引
        currentSlideIndex = index;

        // 更新幻灯片显示
        const allSlides = document.querySelectorAll('.screenshot-slide');
        const allIndicators = document.querySelectorAll('.screenshot-indicator');

        allSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlideIndex);
        });

        allIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentSlideIndex);
        });
    }

    // 显示下一张幻灯片
    function showNextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        goToSlide(currentSlideIndex);
    }

    // 显示上一张幻灯片
    function showPreviousSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlideIndex);
    }

    // 自动轮播功能
    let autoPlayInterval;
    function startAutoPlay() {
        // 每5秒自动切换一次
        autoPlayInterval = setInterval(showNextSlide, 5000);

        // 当鼠标悬停在轮播区域时暂停自动轮播
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }

    // 初始化轮播图
    loadScreenshotData();
});