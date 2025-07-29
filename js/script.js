

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});



// Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function changeSlide(direction) {
    currentSlide += direction;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    showSlide(currentSlide);
}

// Professional loading and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }, 1000);
    
    // Ensure first slide is active
    if (slides.length > 0) {
        showSlide(0);
    }
    
    // Scroll Animation Observer
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, scrollObserverOptions);
    
    // Observe all scroll animation elements
    const scrollElements = document.querySelectorAll('.scroll-animate, .scroll-slide-left, .scroll-slide-right, .scroll-scale');
    scrollElements.forEach(el => scrollObserver.observe(el));
});

// Auto-advance slideshow
setInterval(() => {
    if (slides.length > 0) {
        changeSlide(1);
    }
}, 5000);

// Academy Moments Slideshow
let currentMomentSlide = 0;
const momentSlides = document.querySelectorAll('.moment-slide');

function changeMomentSlide(direction) {
    if (momentSlides.length === 0) return;
    
    momentSlides[currentMomentSlide].classList.remove('active');
    currentMomentSlide = (currentMomentSlide + direction + momentSlides.length) % momentSlides.length;
    momentSlides[currentMomentSlide].classList.add('active');
}

// Auto-advance moment slides
setInterval(() => {
    if (momentSlides.length > 0) {
        changeMomentSlide(1);
    }
}, 4000);



// Hamburger menu functionality
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

// Enrollment form functionality
document.addEventListener('DOMContentLoaded', function() {
    const enrollmentForm = document.getElementById('enrollmentForm');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('studentName').value;
            const email = document.getElementById('studentEmail').value;
            const phone = document.getElementById('studentPhone').value;
            const course = document.getElementById('courseSelect').value;
            
            // Create WhatsApp message
            const message = `New Enrollment Request from Chords Music Academy:
Name: ${name}
Email: ${email}
Phone: ${phone}
Course: ${course}
Time: ${new Date().toLocaleString()}`;
            
            // Open WhatsApp with the message
            const whatsappUrl = `https://api.whatsapp.com/send?phone=917981585309&text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('Thank you! Your enrollment request has been sent. We will contact you soon.');
            
            // Reset form
            enrollmentForm.reset();
        });
    }
});
