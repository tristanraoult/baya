document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavScroll();
  initMobileMenu();
  initScrollReveals();
  initStatCounters();
  initBookingForm();
  initProjectFilters();
  initTextReveal();
});

/* ==========================================================================
   CUSTOM CURSOR LOGIC
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  
  if (!cursor || !follower) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position main dot immediately
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth follower logic using requestAnimationFrame
  function updateFollower() {
    // Ease factor
    const ease = 0.15;
    followerX += (mouseX - followerX) * ease;
    followerY += (mouseY - followerY) * ease;

    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Add hover state triggers
  const interactives = document.querySelectorAll('a, button, select, input, textarea, .project-card, .service-row, .filter-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-interactive');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-interactive');
    });
  });
}

/* ==========================================================================
   FLOATING NAV SCROLL EFFECT
   ========================================================================== */
function initNavScroll() {
  const navIsland = document.querySelector('.nav-island');
  if (!navIsland) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navIsland.classList.add('scrolled');
    } else {
      navIsland.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   MOBILE BURGER MENU
   ========================================================================== */
function initMobileMenu() {
  const burgerBtn = document.querySelector('.burger-menu');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');
  const body = document.body;
  
  if (!burgerBtn || !menuOverlay) return;

  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('burger-active');
    menuOverlay.classList.toggle('open');
    body.classList.toggle('no-scroll');
  });

  // Close menu when clicking a link
  const mobileLinks = menuOverlay.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('burger-active');
      menuOverlay.classList.remove('open');
      body.classList.remove('no-scroll');
    });
  });
}

/* ==========================================================================
   SCROLL REVEALS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const staggerItems = document.querySelectorAll('.stagger-item');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Stagger loading for elements grouped together
  const staggerContainers = document.querySelectorAll('.stagger-container');
  staggerContainers.forEach(container => {
    const items = container.querySelectorAll('.stagger-item');
    const containerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 150); // 150ms delay between each item
          });
          containerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    containerObserver.observe(container);
  });
  
  // Backup: if item is not inside a stagger container
  staggerItems.forEach(item => {
    if (!item.closest('.stagger-container')) {
      revealObserver.observe(item);
    }
  });
}

/* ==========================================================================
   STAT COUNTER ANIMATION
   ========================================================================== */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endVal = parseInt(target.getAttribute('data-target'));
        const suffix = target.getAttribute('data-suffix') || '';
        
        animateCountUp(target, 0, endVal, 1500, suffix);
        countObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => countObserver.observe(num));
}

function animateCountUp(element, start, end, duration, suffix) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    
    // Ease out quad
    const easeProgress = progress * (2 - progress);
    const currentVal = Math.floor(easeProgress * (end - start) + start);
    
    element.textContent = currentVal + suffix;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end + suffix;
    }
  }

  window.requestAnimationFrame(step);
}

/* ==========================================================================
   BOOKING APPOINTMENT FORM HANDLER
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const successMessage = document.querySelector('.booking-success-message');
  
  if (!form || !successMessage) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Client Validation
    const name = form.elements['name'].value.strip ? form.elements['name'].value.strip() : form.elements['name'].value;
    const email = form.elements['email'].value;
    const phone = form.elements['phone'].value;
    const company = form.elements['company'].value;
    
    if (!name || !email || !phone) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // 2. Change submit button to loading state
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Envoi en cours...</span>';

    // 3. Simulate API post delay (1.5 seconds)
    setTimeout(() => {
      // Save data locally for demonstration / lead verification
      const leadData = {
        name,
        email,
        phone,
        company,
        service: form.elements['service'].value,
        budget: form.elements['budget'].value,
        desc: form.elements['desc'].value,
        time: form.elements['timePreference'].value,
        date: form.elements['date'].value,
        submittedAt: new Date().toISOString()
      };
      
      // Store in localStorage
      let leads = JSON.parse(localStorage.getItem('baya_leads') || '[]');
      leads.push(leadData);
      localStorage.setItem('baya_leads', JSON.stringify(leads));

      // Reset form fields
      form.reset();

      // Show success screen overlay
      successMessage.classList.add('active');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      // Auto-hide success screen after 5 seconds or on click
      setTimeout(() => {
        successMessage.classList.remove('active');
      }, 5000);
      
    }, 1500);
  });
  
  // Allow clicking on success message to close it early
  successMessage.addEventListener('click', () => {
    successMessage.classList.remove('active');
  });
}

/* ==========================================================================
   PORTFOLIO FILTERING
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterBtns.length === 0 || projectCards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active to current
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-categories').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          // trigger subtle animation entry
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   TEXT REVEAL ANIMATION (SPLIT TEXT)
   ========================================================================== */
function initTextReveal() {
  const splitTitles = document.querySelectorAll('.split-title');
  splitTitles.forEach(title => {
    const text = title.textContent.trim();
    const words = text.split(' ');
    title.innerHTML = '';
    
    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.classList.add('word-reveal');
      
      const innerSpan = document.createElement('span');
      innerSpan.textContent = word + ' ';
      innerSpan.style.animationDelay = `${index * 0.08}s`;
      
      wordSpan.appendChild(innerSpan);
      title.appendChild(wordSpan);
    });
  });
}
