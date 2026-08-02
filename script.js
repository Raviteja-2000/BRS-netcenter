// script.js
// Final site behavior: slider, nav, form, back-to-top, reveal, dark mode, sticky header
// Defensive, minimal, no external libraries

(function(){
  'use strict';

  // Helpers
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    // ---------- TESTIMONIALS SLIDER (preserved behavior) ----------
    const slides = $('#slides');
    const dots = $('#dots');

    if (slides && dots) {
      const count = slides.children.length;
      let idx = 0;
      let intervalId = null;

      function createDots(){
        for (let i=0;i<count;i++){
          const d = document.createElement('button');
          d.type = 'button';
          d.className = 'dot'+(i===0?' active':'');
          d.setAttribute('aria-label', `Go to slide ${i+1}`);
          d.addEventListener('click', ()=>go(i));
          dots.appendChild(d);
        }
      }

      function go(n){
        idx = n;
        slides.style.transform = `translateX(-${100*idx}%)`;
        Array.from(dots.children).forEach((el,i)=>el.classList.toggle('active', i===idx));
      }

      function start(){
        if(intervalId) clearInterval(intervalId);
        intervalId = setInterval(()=>go((idx+1)%count), 3500);
      }

      createDots();
      go(0);
      start();

      // pause on hover/focus
      slides.addEventListener('mouseenter', ()=>{ if(intervalId) clearInterval(intervalId); });
      slides.addEventListener('mouseleave', ()=> start());
      slides.addEventListener('focusin', ()=>{ if(intervalId) clearInterval(intervalId); });
      slides.addEventListener('focusout', ()=> start());
    }

    // ---------- FOOTER YEAR ----------
    const y = $('#y'); if (y) y.textContent = new Date().getFullYear();

    // ---------- MOBILE NAV TOGGLE ----------
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.getElementById('primary-navigation');
    const body = document.body;

    if (navToggle && navLinks){
      navToggle.addEventListener('click', ()=>{
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        navLinks.classList.toggle('open', !expanded);
        body.classList.toggle('no-scroll', !expanded);
        if(!expanded){
          // focus first link
          const first = navLinks.querySelector('a'); if(first) first.focus();
        } else { navToggle.focus(); }
      });

      // close menu on link click
      navLinks.addEventListener('click', (e)=>{
        if(e.target.tagName === 'A' && navLinks.classList.contains('open')){
          navToggle.setAttribute('aria-expanded','false');
          navLinks.classList.remove('open');
          body.classList.remove('no-scroll');
        }
      });

      // close on Escape
      document.addEventListener('keydown',(e)=>{
        if(e.key === 'Escape' && navLinks.classList.contains('open')){
          navToggle.setAttribute('aria-expanded','false');
          navLinks.classList.remove('open');
          body.classList.remove('no-scroll');
          navToggle.focus();
        }
      });
    }

    // ---------- STICKY NAV ON SCROLL (adds .scrolled) ----------
    const header = document.querySelector('header');
    if(header){
      const onScroll = ()=>{
        if(window.scrollY > 8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
      };
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
    }

    // ---------- BACK TO TOP BUTTON ----------
    (function(){
      const btn = document.createElement('button');
      btn.className = 'back-to-top'; btn.type='button'; btn.title='Back to top'; btn.setAttribute('aria-label','Back to top');
      btn.innerHTML = '↑';
      btn.style.display = 'none';
      document.body.appendChild(btn);

      const toggle = ()=>{ btn.style.display = (window.scrollY > 300 ? 'flex' : 'none'); };
      toggle(); window.addEventListener('scroll', toggle, {passive:true});
      btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
      btn.addEventListener('keyup', (e)=>{ if(e.key==='Enter') window.scrollTo({top:0,behavior:'smooth'}); });
    })();

    // ---------- REVEAL ON SCROLL (IntersectionObserver) ----------
    (function(){
      if(!('IntersectionObserver' in window)){
        // reveal all
        $$('.reveal').forEach(el=>el.classList.add('is-visible'));
        return;
      }
      const io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(ent=>{
          if(ent.isIntersecting){ ent.target.classList.add('is-visible'); obs.unobserve(ent.target); }
        });
      },{threshold:0.08});
      $$('.reveal, section, .card, .slide, .gallery img').forEach(el=>{ el.classList.add('reveal'); io.observe(el); });
    })();

    // ---------- DARK MODE TOGGLE (localStorage) ----------
    (function(){
      const key = 'brs-theme';
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const stored = localStorage.getItem(key);
      const root = document.documentElement;
      const apply = (mode)=>{
        if(mode==='dark') root.classList.add('theme-dark'); else root.classList.remove('theme-dark');
      };
      apply(stored || (prefersDark? 'dark':'light'));

      // add toggle to header (inject)
      const btn = document.createElement('button');
      btn.className='theme-toggle'; btn.type='button'; btn.title='Toggle dark mode'; btn.setAttribute('aria-label','Toggle dark mode');
      btn.innerHTML='🌓';
      const nav = document.querySelector('.nav'); if(nav) nav.appendChild(btn);

      btn.addEventListener('click', ()=>{
        const isDark = root.classList.toggle('theme-dark');
        localStorage.setItem(key, isDark ? 'dark' : 'light');
      });
    })();

    // ---------- CONTACT FORM: Formspree AJAX, validation, honeypot ----------
    (function(){
      const form = $('#contact-form');
      if(!form) return;
      const status = $('#form-status');
      const submitBtn = form.querySelector('button[type=submit]');

      function setStatus(msg, ok=true){
        if(status){ status.textContent = msg; status.style.color = ok ? '' : '#ffb4b4'; }
      }

      function validate(){
        const name = form.querySelector('[name="name"]');
        const email = form.querySelector('[name="email"]');
        const message = form.querySelector('[name="message"]');
        if(!name || !email || !message) return false;
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(name.value.trim().length < 2) { setStatus('Please enter your name', false); name.focus(); return false; }
        if(!emailRe.test(email.value.trim())) { setStatus('Please enter a valid email', false); email.focus(); return false; }
        if(message.value.trim().length < 6) { setStatus('Please enter a short message', false); message.focus(); return false; }
        return true;
      }

      function setLoading(loading){
        if(submitBtn){ submitBtn.disabled = loading; submitBtn.setAttribute('aria-busy', String(loading)); }
      }

      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        setStatus('');
        if(!validate()) return;
        // honeypot
        const hp = form.querySelector('[name="hp"]');
        if(hp && hp.value){ // likely bot
          setStatus('Spam detected.'); return;
        }
        // prepare data
        const data = new FormData(form);
        // replace with your Formspree ID
        const endpoint = 'https://formspree.io/f/your_form_id';
        setLoading(true);
        setStatus('Sending...');

        fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
          .then(response=>{
            setLoading(false);
            if(response.ok){
              setStatus('Thanks! I will contact you soon.');
              form.reset();
            } else return response.json().then(err => { throw err; });
          }).catch(err=>{
            setLoading(false);
            setStatus('There was an error sending the message. Please try again later.', false);
            console.error('Form submission error', err);
          });
      });
    })();

    // ---------- Final safety: remove inline handlers and ensure no console errors ----------
    (function(){
      // remove any inline onsubmit attributes if present
      $$('.card form[onsubmit]').forEach(f=>f.removeAttribute('onsubmit'));
    })();

    // End DOMContentLoaded
  });
})();
