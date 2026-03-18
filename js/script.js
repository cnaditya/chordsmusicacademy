// FAQ toggle
function toggleFaq(btn) {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Academy gallery slideshow (.slide)
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
}

function changeSlide(direction) {
    currentSlide += direction;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    showSlide(currentSlide);
}

// Academy Moments slideshow (.moment-slide)
let currentMoment = 0;
const momentSlides = document.querySelectorAll('.moment-slide');

function showMomentSlide(index) {
    momentSlides.forEach(slide => slide.classList.remove('active'));
    if (momentSlides[index]) momentSlides[index].classList.add('active');
}

function changeMomentSlide(direction) {
    currentMoment += direction;
    if (currentMoment >= momentSlides.length) currentMoment = 0;
    if (currentMoment < 0) currentMoment = momentSlides.length - 1;
    showMomentSlide(currentMoment);
}

// Auto-advance both slideshows
setInterval(() => { if (slides.length > 0) changeSlide(1); }, 5000);
setInterval(() => { if (momentSlides.length > 0) changeMomentSlide(1); }, 4000);

// Hamburger menu
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
    document.querySelector('.hamburger').classList.toggle('active');
}

function closeMenu() {
    document.querySelector('.nav-links').classList.remove('active');
    document.querySelector('.hamburger').classList.remove('active');
}

// Single DOMContentLoaded — initialises everything
document.addEventListener('DOMContentLoaded', function () {

    // Hide loading screen
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
    }, 1000);

    // Ensure first slides are active
    if (slides.length > 0) showSlide(0);
    if (momentSlides.length > 0) showMomentSlide(0);

    // Dynamic copyright year
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Scroll Animation Observer
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-animate, .scroll-slide-left, .scroll-slide-right, .scroll-scale')
        .forEach(el => scrollObserver.observe(el));

    // Enrollment form — WhatsApp submit with inline success message
    const enrollmentForm = document.getElementById('enrollmentForm');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name   = document.getElementById('studentName').value;
            const email  = document.getElementById('studentEmail').value;
            const phone  = document.getElementById('studentPhone').value;
            const course = document.getElementById('courseSelect').value;

            const message = `New Enrollment Request from Chords Music Academy:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourse: ${course}\nTime: ${new Date().toLocaleString()}`;

            window.open(`https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');

            // Inline success — no browser alert
            const successEl = document.getElementById('enrollSuccess');
            if (successEl) {
                successEl.style.display = 'block';
                setTimeout(() => { successEl.style.display = 'none'; }, 6000);
            }

            enrollmentForm.reset();
        });
    }
});
