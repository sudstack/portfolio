document.addEventListener('DOMContentLoaded', () => {
    const computedStyles = getComputedStyle(document.documentElement);
    function getCSSVar(name) { return computedStyles.getPropertyValue(name).trim(); }
    function getCSSVarRGB(name, alpha) { return `rgba(${getCSSVar(name)}, ${alpha})`; }

    const scrollContainer = document.getElementById('scroll-container');
    const caveBg = document.getElementById('cave-bg');
    const panels = document.querySelectorAll('.panel');

    // 1. Intersection Observer for Animations (Trigger every time as requested)
    const observerOptions = {
        root: scrollContainer,
        threshold: 0.4 // Trigger when 40% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const elementsToAnimate = entry.target.querySelectorAll('.animate-on-scroll');

            if (entry.isIntersecting) {
                // Add class to animate in
                elementsToAnimate.forEach(el => el.classList.add('show'));
            } else {
                // Remove class to reset animation so it replays on next entry
                elementsToAnimate.forEach(el => el.classList.remove('show'));
            }
        });
    }, observerOptions);

    panels.forEach(panel => observer.observe(panel));

    // 2. Parallax Zoom Effect based on scroll
    const caveBgEditor = document.getElementById('cave-bg-editor');
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;
        // Total scrollable distance
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;

        // Scale from 1.0 to 1.6 to simulate moving deep into the cave over 10+ scrolls
        const scale = 1 + (scrollFraction * 0.6);
        if (caveBg) caveBg.style.transform = `scale(${scale})`;
        if (caveBgEditor) {
            caveBgEditor.style.transform = `scale(${scale})`;
        }
    });

    // 4. Fireflies Canvas Effect
    const canvas = document.getElementById('fireflies');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    const NUM_PARTICLES = 50;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Firefly {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.6 - 0.3;
            this.speedY = Math.random() * -1 - 0.2; // Drift upwards slowly
            this.life = Math.random() * 100;
            this.fadeSpeed = Math.random() * 0.02 + 0.01;
            this.opacity = 0;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life++;

            // Sine wave for pulsing opacity
            this.opacity = Math.sin(this.life * this.fadeSpeed) * 0.4 + 0.4;

            // Wrap around screen
            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = getCSSVarRGB('--color-accent-rgb', this.opacity); // Glowing crystals
            ctx.shadowBlur = 15;
            ctx.shadowColor = getCSSVar('--color-accent');
            ctx.fill();
        }
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(new Firefly());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();

    // 5. Iframe Projects Carousel
    const projectIframe = document.getElementById('project-iframe');
    const prevBtn = document.getElementById('prev-project');
    const nextBtn = document.getElementById('next-project');
    const dotsTrack = document.querySelector('.iframe-dots-track');

    if (projectIframe && prevBtn && nextBtn && dotsTrack) {
        const iframeProjects = [
            'projects/project1.html',
            'projects/project2.html',
            'projects/project3.html',
            'projects/project2.html',
            'projects/project1.html',
            'projects/project2.html',
            'projects/project3.html',
        ];
        let currentIframeIndex = 0;
        const dots = [];

        // Generate dots
        dotsTrack.innerHTML = '';
        iframeProjects.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.background = getCSSVar('--color-dot-inactive');
            dot.style.flexShrink = '0';
            dot.style.transition = 'all 0.3s ease';
            dotsTrack.appendChild(dot);
            dots.push(dot);
        });

        function loadIframeProject(index) {
            currentIframeIndex = index;
            // Add a small fade effect by setting opacity
            projectIframe.style.opacity = 0;
            setTimeout(() => {
                projectIframe.src = iframeProjects[currentIframeIndex];
                projectIframe.onload = () => {
                    projectIframe.style.opacity = 1;
                };
            }, 200);

            // Update dots (Instagram style)
            dots.forEach((dot, i) => {
                const diff = Math.abs(currentIframeIndex - i);

                if (diff === 0) {
                    dot.style.background = getCSSVar('--color-accent');
                    dot.style.transform = 'scale(1.3)';
                    dot.style.opacity = '1';
                    dot.style.boxShadow = '0 0 8px ' + getCSSVarRGB('--color-accent-rgb', 0.8);
                } else if (diff === 1) {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(1)';
                    dot.style.opacity = '0.8';
                    dot.style.boxShadow = 'none';
                } else if (diff === 2) {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(0.6)';
                    dot.style.opacity = '0.5';
                    dot.style.boxShadow = 'none';
                } else {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(0.3)';
                    dot.style.opacity = '0';
                    dot.style.boxShadow = 'none';
                }
            });

            // Translate track so the active dot is centered
            // Dot width = 8, gap = 12 => step = 20. Active dot center = (i * 20) + 4
            const offset = (currentIframeIndex * 20) + 4;
            dotsTrack.style.transform = `translateX(-${offset}px)`;
        }

        // Setup initial transition style for iframe
        projectIframe.style.transition = 'opacity 0.2s ease-in-out';

        // Initial load to set up the dots perfectly
        loadIframeProject(currentIframeIndex);

        prevBtn.addEventListener('click', () => {
            let newIndex = currentIframeIndex - 1;
            if (newIndex < 0) newIndex = iframeProjects.length - 1;
            loadIframeProject(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            let newIndex = currentIframeIndex + 1;
            if (newIndex >= iframeProjects.length) newIndex = 0;
            loadIframeProject(newIndex);
        });

    }

    // 6. Generic Showcase Panels Carousel
    const showcaseWrappers = document.querySelectorAll('.project-showcase-panel .projects-wrapper');
    
    // Mock data for each panel
    const panelMockData = [
        // Panel 1 Data
        [
            { 
                title: "HoloHome VisualEz", 
                desc: "First major release focusing on multiplayer connectivity and VR optimizations. Achieved top charts.", 
                media: "https://play.google.com/store/apps/details?id=com.visualez.visualezai&hl=en_IN" 
            },
            { 
                title: "Orientbell Quicklook", 
                desc: "Quicklook by Orientbell is a powerful tile visualization app designed exclusively for Orientbell employees, retailers, and channel partners. With its extensive features, Quicklook empowers to create, share, and sell stunning tile designs effortlessly.", 
                media: "Lobby Screenshot" 
            },
        ],
        // Panel 2 Data
        [
            { 
                title: "Mobile RPG Setup", 
                desc: "This project pushed the boundaries of mobile performance with custom shaders and logic.", 
                media: "Gameplay 1" },
            { 
                title: "Combat System", 
                desc: "Developed fluid action combat with combo chains and parry mechanics.", 
                media: "Combat GIF" 
            },
            { 
                title: "Inventory UI", 
                desc: "Created a highly responsive and drag-and-drop enabled inventory system.", 
                media: "UI Screenshot" 
            }
        ]
    ];

    showcaseWrappers.forEach((wrapper, panelIndex) => {
        const pPrevBtn = wrapper.querySelector('.panel-prev');
        const pNextBtn = wrapper.querySelector('.panel-next');
        const pDotsTrack = wrapper.querySelector('.panel-dots-track');
        const titleEl = wrapper.querySelector('.info-title');
        const descEl = wrapper.querySelector('.info-desc');
        const mediaEl = wrapper.querySelector('.media-text');
        
        if (!pPrevBtn || !pNextBtn || !pDotsTrack) return;

        const projectsData = panelMockData[panelIndex] || panelMockData[0];
        let currentIndex = 0;
        const pDots = [];

        // Generate dots
        pDotsTrack.innerHTML = '';
        projectsData.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.background = getCSSVar('--color-dot-inactive');
            dot.style.flexShrink = '0';
            dot.style.transition = 'all 0.3s ease';
            pDotsTrack.appendChild(dot);
            pDots.push(dot);
        });

        function updatePanel(index) {
            currentIndex = index;
            const data = projectsData[currentIndex];

            // Add a small fade effect for content
            const contentElements = [titleEl, descEl, mediaEl];
            contentElements.forEach(el => {
                if(el) el.style.opacity = 0;
            });

            setTimeout(() => {
                if(titleEl) titleEl.textContent = data.title;
                if(descEl) descEl.textContent = data.desc;
                if(mediaEl) mediaEl.textContent = `{${data.media}}`;
                
                contentElements.forEach(el => {
                    if(el) el.style.opacity = 1;
                });
            }, 200);

            // Update dots (Instagram style)
            pDots.forEach((dot, i) => {
                const diff = Math.abs(currentIndex - i);
                
                if (diff === 0) {
                    dot.style.background = getCSSVar('--color-accent');
                    dot.style.transform = 'scale(1.3)';
                    dot.style.opacity = '1';
                    dot.style.boxShadow = '0 0 8px ' + getCSSVarRGB('--color-accent-rgb', 0.8);
                } else if (diff === 1) {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(1)';
                    dot.style.opacity = '0.8';
                    dot.style.boxShadow = 'none';
                } else if (diff === 2) {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(0.6)';
                    dot.style.opacity = '0.5';
                    dot.style.boxShadow = 'none';
                } else {
                    dot.style.background = getCSSVar('--color-dot-inactive');
                    dot.style.transform = 'scale(0.3)';
                    dot.style.opacity = '0';
                    dot.style.boxShadow = 'none';
                }
            });

            // Translate track so the active dot is centered
            const offset = (currentIndex * 20) + 4;
            pDotsTrack.style.transform = `translateX(-${offset}px)`;
        }

        // Setup transitions
        if(titleEl) titleEl.style.transition = 'opacity 0.2s ease-in-out';
        if(descEl) descEl.style.transition = 'opacity 0.2s ease-in-out';
        if(mediaEl) mediaEl.style.transition = 'opacity 0.2s ease-in-out';

        updatePanel(currentIndex);

        pPrevBtn.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = projectsData.length - 1;
            updatePanel(newIndex);
        });

        pNextBtn.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= projectsData.length) newIndex = 0;
            updatePanel(newIndex);
        });
    });

    // 7. Mouse Spotlight Effect
    document.addEventListener('mousemove', (e) => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
});