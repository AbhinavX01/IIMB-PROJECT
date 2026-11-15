const revealItems = document.querySelectorAll(".reveal");
const bars = document.querySelectorAll(".bar");

function show(el) {
  el.classList.add(el.classList.contains("bar") ? "on" : "in");
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealItems.forEach(function (item) { observer.observe(item); });
  bars.forEach(function (bar) { observer.observe(bar); });
} else {
  revealItems.forEach(show);
  bars.forEach(show);
}
