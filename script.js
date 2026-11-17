const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// 1. Split the name into letters for the entrance animation
const heading = document.querySelector(".hero h1");
if (heading && !reduce) {
  const text = heading.textContent.trim();
  heading.setAttribute("aria-label", text);
  heading.classList.add("split");
  heading.textContent = "";
  text.split("").forEach(function (letter, i) {
    const span = document.createElement("span");
    span.className = "ch";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", i);
    span.textContent = letter;
    heading.appendChild(span);
  });
}

// 2. Stagger cards that share a parent
document.querySelectorAll(".reveal").forEach(function (el) {
  const group = Array.from(el.parentElement.children).filter(function (c) {
    return c.classList.contains("reveal");
  });
  el.style.setProperty("--d", group.indexOf(el) * 110 + "ms");
});

// 3. Count-up numbers
function countUp(el) {
  const end = Number(el.dataset.count);
  const from = Number(el.dataset.from || 0);
  const suffix = el.dataset.suffix || "";
  if (reduce) { el.textContent = end + suffix; return; }
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / 1400, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (end - from) * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// 4. Reveal on scroll
function show(el) {
  if (el.classList.contains("bar")) { el.classList.add("on"); return; }
  if (el.dataset.count) { countUp(el); return; }
  if (el.classList.contains("block")) { el.classList.add("seen"); return; }
  el.classList.add("in");
  setTimeout(function () {
    el.classList.add("done");
    el.style.removeProperty("--d");
  }, 1300);
}

const targets = document.querySelectorAll(".reveal, .bar, .block, [data-count]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  targets.forEach(function (t) { observer.observe(t); });
} else {
  targets.forEach(show);
}

// 5. Scroll progress bar
const progress = document.querySelector(".progress");
function onScroll() {
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  progress.style.setProperty("--p", max > 0 ? (root.scrollTop / max).toFixed(4) : 0);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 6. Highlight the nav link of the section in view
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(function (link) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });
}

// 7. Desktop only: card tilt and spotlight, cursor glow
if (fine && !reduce) {
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (card.classList.contains("reveal")) {
        card.style.setProperty("--ry", ((x / r.width - 0.5) * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y / r.height) * 7).toFixed(2) + "deg");
        card.style.setProperty("--ty", "-4px");
      }
    });
    card.addEventListener("pointerleave", function () {
      ["--rx", "--ry", "--ty"].forEach(function (v) { card.style.removeProperty(v); });
    });
  });

  const glow = document.querySelector(".cursor-glow");
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2, gx = tx, gy = ty;
  window.addEventListener("pointermove", function (e) {
    tx = e.clientX; ty = e.clientY;
    glow.classList.add("on");
  });
  (function loop() {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.setProperty("--x", gx + "px");
    glow.style.setProperty("--y", gy + "px");
    requestAnimationFrame(loop);
  })();
}
