// script.js
// Moved from inline HTML. Preserves original slider + year functionality.
// Runs after DOM is parsed.

document.addEventListener('DOMContentLoaded', () => {
  // Testimonials slider (same behavior as original)
  const slides = document.getElementById('slides');
  const dots = document.getElementById('dots');

  if (slides && dots) {
    const count = slides.children.length;
    let idx = 0;

    // Create dots for each slide
    for (let i = 0; i < count; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      // Use a click handler to go to slide i
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    }

    // Move to slide n and update active dot
    function go(n) {
      idx = n;
      slides.style.transform = `translateX(-${100 * idx}%)`;
      Array.from(dots.children).forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });
    }

    // Auto-advance
    setInterval(() => go((idx + 1) % count), 3500);

    // Ensure initial state
    slides.style.transform = 'translateX(0%)';
  }

  // Year filler
  const y = document.getElementById('y');
  if (y) {
    y.textContent = new Date().getFullYear();
  }
});
