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
            'projects/hoverplay.html',
            'projects/cambio.html',
            'projects/cryptoplay.html'
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
    // 'type' can be 'image', 'video', or 'text'.
    // 'src' can be a local path (e.g. 'assets/images/pic.png') or an external link.
    const panelMockData = [
        // Panel 1 Data
        [
            {
                title: "HoloHome VisualEz",
                desc: "Visualez is a high-performance tile visualization application tailored for tile retailers. By leveraging Addressables for dynamic, on-demand asset delivery, Visualez empowers users to seamlessly create, share, and sell stunning tile designs without compromising on app size or rendering speed.",
                type: "video",
                src: "https://www.visualez.com/assets/HomePageFinal-7ad0549d.mp4"
            },
            {
                title: "Orientbell Quicklook",
                desc: "Quicklook by Orientbell is a powerful tile visualization app designed exclusively for Orientbell employees, retailers, and channel partners. With its extensive features, Quicklook empowers to create, share, and sell stunning tile designs effortlessly. <br><br> <a href='https://play.google.com/store/apps/details?id=com.orientbell.Quicklook' target='_blank' style='color: var(--color-accent); text-decoration: underline;'>Orientbell Quicklook on Play Store</a>",
                type: "image",
                src: "https://play-lh.googleusercontent.com/A5F_GOP298s86-sZzkG3JuhYygp42KFiMLcCDQ3sYRgrXPq1EQQm0Bcm3hjaY5KwO4IeisT1MiAuwwkDwpt-Ip8=w5120-h2880-rw" 
            },
        ],
                // Panel 2 Data
        [
                {
                    title: "iXR Engineering Demo",
                desc: "An immersive VR demo designed for engineering students, featuring concept of Jet Engine and other learning modules that transform complex technical concepts into hands-on, engaging virtual experiences.",
                type: "video",
                src: "https://scontent-iad3-1.oculuscdn.com/v/t64.7195-25/38974547_821909769649859_6261195562533128975_n.mp4?_nc_cat=108&ccb=1-7&_nc_sid=b20b63&_nc_ohc=BuOAHsZ68OsQ7kNvwHsksdP&_nc_oc=Adpiefin9OY74fzO3-qxDsXYUK7beydvvqe9L9IxGC2d3-pgWAU8kbAELKjjnK4UWkTLLoH9j16cNjjeMvkjCmBi&_nc_zt=28&_nc_ht=scontent-iad3-1.oculuscdn.com&_nc_gid=D_RWY-Xn30qc1ZTLe-kkbg&_nc_ss=7b289&oh=00_Af_y2W5c8Q5-kMUEOG19l8UyPdI69acFcfR2X3C5I6gn-A&oe=6A401A9C" 
            },
                {
                    title: "Thermal Power Plant",
                desc: "An immersive VR tour of a thermal power plant, designed to educate users about the inner workings of power generation. This experience allows users to explore the plant's components and understand the processes involved in generating electricity.",
                type: "video",
                src: "https://scontent-iad3-1.oculuscdn.com/v/t64.7195-25/38974547_821909769649859_6261195562533128975_n.mp4?_nc_cat=108&ccb=1-7&_nc_sid=b20b63&_nc_ohc=BuOAHsZ68OsQ7kNvwHsksdP&_nc_oc=Adpiefin9OY74fzO3-qxDsXYUK7beydvvqe9L9IxGC2d3-pgWAU8kbAELKjjnK4UWkTLLoH9j16cNjjeMvkjCmBi&_nc_zt=28&_nc_ht=scontent-iad3-1.oculuscdn.com&_nc_gid=D_RWY-Xn30qc1ZTLe-kkbg&_nc_ss=7b289&oh=00_Af_y2W5c8Q5-kMUEOG19l8UyPdI69acFcfR2X3C5I6gn-A&oe=6A401A9C" 
            }
        ]        
    ];

    showcaseWrappers.forEach((wrapper, panelIndex) => {
        const pPrevBtn = wrapper.querySelector('.panel-prev');
                        const pNextBtn = wrapper.querySelector('.panel-next');
                        const pDotsTrack = wrapper.querySelector('.panel-dots-track');
                        const titleEl = wrapper.querySelector('.info-title');
                        const descEl = wrapper.querySelector('.info-desc');
                        const mediaContainer = wrapper.querySelector('.project-media');

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
                        const contentElements = [titleEl, descEl, mediaContainer];
            contentElements.forEach(el => {
                if(el) el.style.opacity = 0;
            });

            setTimeout(() => {
                if(titleEl) titleEl.textContent = data.title;
                        if(descEl) descEl.innerHTML = data.desc;

                        if (mediaContainer) {
                    if (data.type === 'video') {
                            mediaContainer.innerHTML = `<video src="${data.src}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"></video>`;
                    } else if (data.type === 'image') {
                            mediaContainer.innerHTML = `<img src="${data.src}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                    } else {
                            // Fallback text
                            mediaContainer.innerHTML = `<span class="media-text" style="color: var(--color-text-muted); font-size: 1.2rem;">{${data.src || data.media}}</span>`;
                    }
                }
                
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
                        if(mediaContainer) mediaContainer.style.transition = 'opacity 0.2s ease-in-out';

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