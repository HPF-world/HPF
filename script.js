document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const contactForm = document.getElementById('contactForm');
    const customSelect = document.getElementById('customSelect');
    const revealItems = document.querySelectorAll('.reveal');

    const closeMenu = () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('mobile-open');
        hamburger?.setAttribute('aria-expanded', 'false');
    };

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
            hamburger.setAttribute('aria-expanded', navMenu.classList.contains('mobile-open') ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return;

        link.addEventListener('click', event => {
            event.preventDefault();
            const target = document.getElementById(href.slice(1));
            if (!target) return;

            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                behavior: 'smooth'
            });

            closeMenu();
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    if (customSelect) {
        initCustomSelect(customSelect);
    }

    if ('IntersectionObserver' in window && revealItems.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('visible'));
    }

    const updateActiveNavLink = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const position = window.scrollY + 100;
        let activeId = '';

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (position >= top && position < bottom) {
                activeId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
    };

    updateActiveNavLink();
    window.addEventListener('scroll', debounce(updateActiveNavLink, 80), { passive: true });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});

async function handleContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const status = document.getElementById('status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || 'Send Message';
    const actionPath = form.getAttribute('action') || 'contact_handler.php';
    const actionUrl = window.location.port === '5500'
        ? 'http://localhost/HPF.WORLD/contact_handler.php'
        : new URL(actionPath, window.location.href).href;

    if (status) {
        status.textContent = 'Sending message...';
        status.style.backgroundColor = '#f3f4f6';
        status.style.color = '#374151';
    }

    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(actionUrl, {
            method: (form.getAttribute('method') || 'POST').toUpperCase(),
            headers: { Accept: 'application/json' },
            body: formData
        });

        const responseText = await response.text();
        let data = {};

        if (responseText.trim()) {
            data = JSON.parse(responseText);
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Message could not be sent.');
        }

        if (status) {
            status.textContent = 'Message sent successfully.';
            status.style.backgroundColor = '#10b981';
            status.style.color = '#ffffff';
        }

        form.reset();
        const selected = document.querySelector('#customSelect .select-selected');
        const hiddenInput = document.getElementById('interest');
        if (selected) selected.textContent = 'Select an area';
        if (hiddenInput) hiddenInput.value = '';
    } catch (error) {
        if (status) {
            status.textContent = error.message || 'Message could not be sent. Please try again later.';
            status.style.backgroundColor = '#ef4444';
            status.style.color = '#ffffff';
        }
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

function initCustomSelect(customSelect) {
    const selected = customSelect.querySelector('.select-selected');
    const items = customSelect.querySelector('.select-items');
    const hiddenInput = document.getElementById('interest');

    if (!selected || !items || !hiddenInput) return;

    selected.addEventListener('click', event => {
        event.stopPropagation();
        items.classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
    });

    items.querySelectorAll('[data-value]').forEach(option => {
        option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            hiddenInput.value = option.getAttribute('data-value') || '';
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
            items.querySelectorAll('[data-value]').forEach(item => {
                item.classList.toggle('selected', item === option);
            });
        });
    });

    document.addEventListener('click', event => {
        if (!customSelect.contains(event.target)) {
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        }
    });
}

function debounce(func, wait) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
}

/* Social sidebar keyboard navigation & reduced-motion handling */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.social-sidebar');
    if (!sidebar) return;

    const links = Array.from(sidebar.querySelectorAll('.social-link'));
    if (!links.length) return;

    sidebar.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        const idx = links.indexOf(active);
        if (idx === -1) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            links[(idx + 1) % links.length].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            links[(idx - 1 + links.length) % links.length].focus();
        }
    });

    // Make sure icons are focusable and announce themselves
    links.forEach(link => {
        link.setAttribute('tabindex', '0');
        // Add an accessible tooltip for screen readers
        if (!link.getAttribute('title')) {
            const label = link.getAttribute('aria-label') || 'social link';
            link.setAttribute('title', label);
        }
    });

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) links.forEach(l => l.style.transition = 'none');
});

// Floating scroll-down button behavior
document.addEventListener('DOMContentLoaded', () => {
    const scrollBtn = document.getElementById('scrollDownBtn');
    if (!scrollBtn) return;

    let lastScroll = window.scrollY;

    const showOnScroll = () => {
        const threshold = 120; // px scrolled from top before showing
        if (window.scrollY > threshold) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
        lastScroll = window.scrollY;
    };

    // initial check
    showOnScroll();

    window.addEventListener('scroll', debounce(showOnScroll, 80), { passive: true });

    // On click, animate ripple and scroll one viewport down (or to next section)
    scrollBtn.addEventListener('click', (e) => {
        // ripple class toggles the ::after animation
        scrollBtn.classList.add('ripple');
        setTimeout(() => scrollBtn.classList.remove('ripple'), 520);

        // Prefer scrolling to the next section element after hero
        const sections = Array.from(document.querySelectorAll('main section'));
        const y = window.scrollY;
        let targetY = y + window.innerHeight; // fallback: one viewport down

        for (const sec of sections) {
            const top = sec.getBoundingClientRect().top + window.pageYOffset;
            if (top > y + 10) { targetY = top - 72; break; }
        }

        window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
});
