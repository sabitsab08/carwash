/* ============================================================
   Onyx Auto Spa — Shared interactivity (vanilla JS, no deps)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initDropdowns();
  initActiveNavLink();
  initAccordion();
  initCarousel();
  initBookingForm();
  initScrollReveal();
  initCounters();
});

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a plain link (not a dropdown toggle) is clicked
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.matches('.has-dropdown > .nav-link')) return;
      if (window.innerWidth <= 960) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

/* ---------- Dropdown menus (Services / Service Areas) ---------- */
function initDropdowns() {
  var dropdownParents = document.querySelectorAll('.has-dropdown');

  dropdownParents.forEach(function (parent) {
    var trigger = parent.querySelector('.nav-link');
    if (!trigger) return;

    // Hover on desktop
    parent.addEventListener('mouseenter', function () {
      if (window.innerWidth > 960) parent.classList.add('open');
    });
    parent.addEventListener('mouseleave', function () {
      if (window.innerWidth > 960) parent.classList.remove('open');
    });

    // Click for mobile / keyboard access
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth <= 960) {
        e.preventDefault();
        var wasOpen = parent.classList.contains('open');
        dropdownParents.forEach(function (p) { p.classList.remove('open'); });
        parent.classList.toggle('open', !wasOpen);
      }
    });
  });

  // Close dropdowns when clicking outside (desktop)
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      dropdownParents.forEach(function (p) { p.classList.remove('open'); });
    }
  });
}

/* ---------- Active nav link highlighting ---------- */
function initActiveNavLink() {
  var current = window.location.pathname.split('/').pop();
  if (current === '') current = 'index.html';

  document.querySelectorAll('.nav-link, .dropdown a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var hrefPage = href.split('#')[0];
    if (hrefPage === current) {
      link.classList.add('active');
      var parentDropdown = link.closest('.has-dropdown');
      if (parentDropdown) {
        var parentLink = parentDropdown.querySelector('.nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });

  document.querySelectorAll('.footer-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.split('#')[0] === current) {
      link.style.color = 'var(--accent)';
    }
  });
}

/* ---------- FAQ Accordion ---------- */
function initAccordion() {
  var items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    var body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all others (single-open accordion behavior)
      items.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.accordion-body').style.maxHeight = null;
        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ---------- Testimonial Carousel ---------- */
function initCarousel() {
  var carousel = document.querySelector('.carousel');
  if (!carousel) return;

  var track = carousel.querySelector('.carousel-slides');
  var slides = carousel.querySelectorAll('.carousel-slide');
  var prevBtn = carousel.querySelector('.carousel-prev');
  var nextBtn = carousel.querySelector('.carousel-next');
  var dotsWrap = carousel.querySelector('.carousel-dots');
  var index = 0;

  if (!track || !slides.length) return;

  // Build dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
  }

  function update() {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.carousel-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === index);
      });
    }
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

  // Autoplay
  var autoplay = setInterval(function () { goTo(index + 1); }, 6000);
  carousel.addEventListener('mouseenter', function () { clearInterval(autoplay); });
  carousel.addEventListener('mouseleave', function () {
    autoplay = setInterval(function () { goTo(index + 1); }, 6000);
  });

  update();
}

/* ---------- Booking Form Validation ---------- */
function initBookingForm() {
  var form = document.getElementById('booking-form');
  if (!form) return;

  var successBox = document.getElementById('form-success');

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9+\-\s()]{8,}$/;

  function setError(field, message) {
    var wrapper = field.closest('.field');
    if (!wrapper) return;
    wrapper.classList.add('error');
    var errorEl = wrapper.querySelector('.field-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field) {
    var wrapper = field.closest('.field');
    if (!wrapper) return;
    wrapper.classList.remove('error');
  }

  function validateField(field) {
    var value = field.value.trim();
    clearError(field);

    if (field.hasAttribute('required') && !value) {
      setError(field, 'This field is required.');
      return false;
    }
    if (field.type === 'email' && value && !emailPattern.test(value)) {
      setError(field, 'Enter a valid email address.');
      return false;
    }
    if (field.type === 'tel' && value && !phonePattern.test(value)) {
      setError(field, 'Enter a valid phone number.');
      return false;
    }
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      setError(field, 'Please confirm to continue.');
      return false;
    }
    return true;
  }

  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input, select, textarea');
    var isValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (isValid) {
      if (successBox) {
        successBox.classList.add('show');
        successBox.textContent = 'Thanks! Your booking request has been received — our team will confirm your appointment shortly.';
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    } else {
      var firstError = form.querySelector('.field.error input, .field.error select, .field.error textarea');
      if (firstError) firstError.focus();
      if (successBox) successBox.classList.remove('show');
    }
  });
}

/* ---------- Scroll-reveal animations ---------- */
function initScrollReveal() {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = document.querySelectorAll(
    '.card, .pricing-card, .review-card, .step, .step-row, .area-chip, ' +
    '.section-head, .split > *, .featured-area, .stat-block, .accordion-item, ' +
    '.carousel, .form-card, .form-card + div > .card'
  );

  targets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // Stagger siblings within the same grid/parent for a cascading effect
  var groups = {};
  targets.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var key = '_revealIndex';
    if (!parent[key]) parent[key] = 0;
    el.style.transitionDelay = Math.min(parent[key] * 70, 350) + 'ms';
    parent[key] += 1;
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('.hero-stats strong, .stat-block strong');
  if (!counters.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  counters.forEach(function (el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return;

    var numText = match[1];
    var suffix = match[2];
    var target = parseFloat(numText.replace(/,/g, ''));
    var isDecimal = numText.indexOf('.') !== -1;
    var hasComma = numText.indexOf(',') !== -1;
    if (isNaN(target)) return;

    var duration = 1400;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        var startTime = null;
        function tick(now) {
          if (startTime === null) startTime = now;
          var progress = Math.min((now - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = target * eased;
          var display = isDecimal ? current.toFixed(1) : Math.round(current).toString();
          if (hasComma) display = Number(display).toLocaleString('en-US', isDecimal ? { minimumFractionDigits: 1, maximumFractionDigits: 1 } : {});
          el.textContent = display + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    observer.observe(el);
  });
}
