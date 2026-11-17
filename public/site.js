const fakeNotice = document.querySelector("#fake-notice");
if (fakeNotice) {
  const noticeKey = "maijob-fake-notice";
  const rememberNotice = () => {
    try {
      localStorage.setItem(noticeKey, "1");
    } catch (error) {
      /* 隱私模式寫不進去時，這次關掉即可。 */
    }
  };
  fakeNotice.addEventListener("close", rememberNotice);
  fakeNotice.addEventListener("click", (event) => {
    if (event.target === fakeNotice) fakeNotice.close();
  });
  let seenNotice = false;
  try {
    seenNotice = localStorage.getItem(noticeKey) === "1";
  } catch (error) {
    seenNotice = false;
  }
  if (!seenNotice && typeof fakeNotice.showModal === "function") fakeNotice.showModal();
}

const dialog = document.querySelector("#stub-dialog");

for (const button of document.querySelectorAll("[data-stub]")) {
  button.addEventListener("click", () => {
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  });
}

if (dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const searchForm = document.querySelector(".search-bar");
const search = document.querySelector("#q");
const menus = [...document.querySelectorAll(".multi")];

if (searchForm && search) {
  const cards = [...document.querySelectorAll(".card")];
  const keywords = [...document.querySelectorAll("[data-keyword]")];
  const lanes = [...document.querySelectorAll(".lane")];

  function updateArrows(lane) {
    const scroller = lane.querySelector(".scroller");
    const prev = lane.querySelector("[data-dir='prev']");
    const next = lane.querySelector("[data-dir='next']");
    const max = scroller.scrollWidth - scroller.clientWidth;
    prev.disabled = scroller.scrollLeft <= 2;
    next.disabled = scroller.scrollLeft >= max - 2;
  }

  function closeMenus(except) {
    for (const multi of menus) {
      if (multi === except) continue;
      multi.querySelector(".multi-menu").hidden = true;
      multi.querySelector(".multi-toggle").setAttribute("aria-expanded", "false");
    }
  }

  function selectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
  }

  function refreshToggle(multi) {
    const checked = [...multi.querySelectorAll("input:checked")].map((input) => input.value);
    multi.querySelector(".multi-toggle").textContent = checked.length ? checked.join("、") : multi.dataset.label;
  }

  function markKeywords() {
    const query = search.value.trim().toLowerCase();
    for (const keyword of keywords) {
      keyword.setAttribute("aria-pressed", keyword.dataset.keyword.toLowerCase() === query ? "true" : "false");
    }
  }

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const cities = selectedValues("city");
    const categories = selectedValues("category");
    for (const card of cards) {
      const matchesCity = cities.length === 0 || cities.includes(card.dataset.city);
      const matchesCategory = categories.length === 0 || categories.includes(card.dataset.category);
      const matchesQuery = !query || card.dataset.text.includes(query);
      card.hidden = !(matchesCity && matchesCategory && matchesQuery);
    }
    markKeywords();
    for (const lane of lanes) {
      const visible = lane.querySelectorAll(".card:not([hidden])").length;
      lane.querySelector(".lane-empty").hidden = visible !== 0;
      const scroller = lane.querySelector(".scroller");
      scroller.scrollLeft = 0;
      updateArrows(lane);
    }
  }

  for (const multi of menus) {
    const toggle = multi.querySelector(".multi-toggle");
    const menu = multi.querySelector(".multi-menu");
    multi.dataset.label = toggle.textContent.trim();
    toggle.addEventListener("click", () => {
      const willOpen = menu.hidden;
      closeMenus(multi);
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
    menu.addEventListener("change", () => refreshToggle(multi));
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".multi")) closeMenus();
  });

  const topbar = document.querySelector(".topbar");
  const syncTopbar = () => {
    if (topbar) {
      document.documentElement.style.setProperty("--topbar-height", `${topbar.offsetHeight}px`);
    }
  };
  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    document.body.classList.toggle("is-scrolled", scrolled);
    if (scrolled) closeMenus();
  };
  syncTopbar();
  onScroll();
  window.addEventListener("resize", syncTopbar);
  window.addEventListener("scroll", onScroll, { passive: true });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    closeMenus();
    applyFilters();
  });

  for (const keyword of keywords) {
    keyword.addEventListener("click", () => {
      const word = keyword.dataset.keyword;
      search.value = search.value.trim() === word ? "" : word;
      markKeywords();
      applyFilters();
    });
  }

  for (const lane of lanes) {
    const scroller = lane.querySelector(".scroller");
    const step = () => {
      const card = scroller.querySelector(".card:not([hidden])");
      return card ? card.getBoundingClientRect().width + 14 : scroller.clientWidth;
    };
    lane.querySelector("[data-dir='next']").addEventListener("click", () => {
      scroller.scrollBy({ left: step(), behavior: "smooth" });
    });
    lane.querySelector("[data-dir='prev']").addEventListener("click", () => {
      scroller.scrollBy({ left: -step(), behavior: "smooth" });
    });
    scroller.addEventListener("scroll", () => updateArrows(lane));
    updateArrows(lane);
  }
}
