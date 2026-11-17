const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 5180;
const JOBS_PATH = path.join(__dirname, "data", "jobs.json");
const RENTALS_PATH = path.join(__dirname, "data", "rentals.json");
const REVIEWS_PATH = path.join(__dirname, "data", "reviews.json");
const RENTAL_REVIEWS_PATH = path.join(__dirname, "data", "rental-reviews.json");

const CITY_ORDER = ["台北市", "台中市", "高雄市"];
const CATEGORY_ORDER = ["美甲", "餐飲", "美術設計", "計時人員"];
const KEYWORDS = ["美甲師", "咖啡師", "外場服務人員", "插畫設計師", "平面設計師", "美甲助理", "烘焙助手", "門市計時人員"];
const HOME_CATEGORY_ORDER = ["獨立套房", "分租套房", "整層住家", "雅房"];
const HOME_KEYWORDS = ["獨立套房", "分租套房", "整層住家", "雅房"];
const SITES = {
  job: { name: "Mai Job", href: "/", other: "/home" },
  home: { name: "Mai Home", href: "/home", other: "/" },
};
const LANES = [
  { id: "watching", title: "最多人在看" },
  { id: "heat", title: "求職熱度高" },
  { id: "foryou", title: "你可能會喜歡" },
];

const EMPLOYMENT_LABEL = {
  FULL_TIME: "全職",
  PART_TIME: "兼職",
};

function loadJson(filePath) {
  const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    items,
    byId: new Map(items.map((item) => [item.id, item])),
  };
}

function loadJobs() {
  return loadJson(JOBS_PATH);
}

function loadRentals() {
  return loadJson(RENTALS_PATH);
}

function loadReviews() {
  const items = JSON.parse(fs.readFileSync(REVIEWS_PATH, "utf8"));
  const byJob = new Map();
  for (const review of items) {
    const list = byJob.get(review.jobId) || [];
    list.push(review);
    byJob.set(review.jobId, list);
  }
  return { items, byJob };
}

function loadRentalReviews() {
  const items = JSON.parse(fs.readFileSync(RENTAL_REVIEWS_PATH, "utf8"));
  const byRental = new Map();
  for (const review of items) {
    const list = byRental.get(review.rentalId) || [];
    list.push(review);
    byRental.set(review.rentalId, list);
  }
  return { items, byRental };
}

const RENTAL_REVIEW_SCORES = [
  ["lightingAndVentilation", "採光通風"],
  ["soundproofing", "隔音"],
  ["landlordAttitude", "屋主態度"],
  ["locationConvenience", "生活機能"],
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function orderedUnique(jobs, pick, order) {
  const present = new Set(jobs.map(pick));
  const known = order.filter((item) => present.has(item));
  const extra = [...present].filter((item) => !order.includes(item));
  return [...known, ...extra];
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleJobs(jobs) {
  const copy = [...jobs];
  const rand = mulberry32(0x4d61694a);
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy;
}

function splitLanes(jobs) {
  const shuffled = shuffleJobs(jobs);
  const size = Math.ceil(shuffled.length / LANES.length);
  return LANES.map((lane, index) => ({
    ...lane,
    jobs: shuffled.slice(index * size, (index + 1) * size),
  }));
}

function jobPosting(job, pageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    url: pageUrl,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.address.streetAddress,
        addressLocality: job.address.addressLocality,
        addressRegion: job.address.addressRegion,
        addressCountry: job.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: job.geo.latitude,
        longitude: job.geo.longitude,
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "TWD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: String(job.salary.text || "").startsWith("時薪") ? "HOUR" : "MONTH",
      },
    },
  };
}

function header(mode, index) {
  const site = SITES[mode] || SITES.job;
  const brand = index
    ? `<h1 class="brand"><a href="${site.href}">${site.name}</a></h1>`
    : `<a class="brand" href="${site.href}">${site.name}</a>`;
  return `<header class="topbar">
    ${brand}
    <nav class="nav" aria-label="功能">
      <button type="button" class="nav-register" data-stub>註冊</button>
      <button type="button" class="nav-login" data-stub>登入</button>
      <a class="nav-mode" href="${site.other}">切換模式</a>
    </nav>
  </header>`;
}

function stubDialog() {
  return `<dialog id="fake-notice">
    <p>此為假網站，所有資訊皆為隨機產生，用來純展示爬蟲用，請勿當真。</p>
    <form method="dialog"><button type="submit">我知道了</button></form>
  </dialog>
  <dialog id="stub-dialog">
    <p>此功能開發中</p>
    <form method="dialog"><button type="submit">關閉</button></form>
  </dialog>`;
}

function createTags() {
  const id = crypto.randomBytes(3).toString("hex");
  const wrapName = `x-${id}`;
  const decoyName = `y-${id}`;
  const bait = [
    ["誘餌工程師", "月薪 1～2 元", "不存在市樣本區幻想路"],
    ["標籤測試員", "時薪 0 元", "隱藏市路段"],
    ["空白職缺", "面議", "測試市東區"],
  ];
  return {
    style: `<style>${wrapName}{display:contents}${decoyName}{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>`,
    decoyHtml: bait.map((row, index) => `<${decoyName} aria-hidden="true"><p>${row[0]} ${id}${index}</p><p>${row[1]}</p><p>${row[2]}</p></${decoyName}>`).join(""),
    open() {
      const mark = crypto.randomBytes(2).toString("hex");
      return `<${wrapName} data-${id}="${mark}">`;
    },
    close() {
      return `</${wrapName}>`;
    },
    wrap(html) {
      return `${this.open()}${html}${this.close()}`;
    },
  };
}

function layout({ title, body, jsonLd, mode = "job", index = false, tags }) {
  const ld = jsonLd
    ? `<script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
  ${tags.style}
  ${ld}
</head>
<body>
  ${header(mode, index)}
  ${body}
  ${tags.decoyHtml}
  ${stubDialog()}
  <script src="/site.js"></script>
</body>
</html>`;
}

const pin = `<svg class="pin" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5z"/></svg>`;

function actionBar(label, tags) {
  return `<div class="action-bar">
      ${tags.wrap(`<div class="share-row">
        <button type="button" data-stub>分享</button>
        <button type="button" data-stub>收藏</button>
      </div>`)}
      <button type="button" class="action-primary" data-stub>${escapeHtml(label)}</button>
    </div>`;
}

function jobCard(job, tags) {
  const haystack = [
    job.title,
    job.company,
    job.displayAddress,
    job.category,
    job.address.addressRegion,
    job.address.addressLocality,
  ].join(" ").toLowerCase();
  return tags.wrap(`<a class="card" href="/job/${escapeHtml(job.id)}" target="_blank" rel="noopener noreferrer" data-category="${escapeHtml(job.category)}" data-city="${escapeHtml(job.address.addressRegion)}" data-text="${escapeHtml(haystack)}">
    <span class="card-title">${escapeHtml(job.title)}</span>
    <span class="card-company">${escapeHtml(job.company)}</span>
    <span class="card-place">${escapeHtml(job.displayAddress)}</span>
    <span class="card-salary">${escapeHtml(job.salary.text)}</span>
  </a>`);
}

function chevron(direction) {
  const path = direction === "prev"
    ? "M14.5 5.5 8 12l6.5 6.5"
    : "M9.5 5.5 16 12l-6.5 6.5";
  return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function multiSelect(name, label, options) {
  const boxes = options
    .map((option) => `<label><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(option)}">${escapeHtml(option)}</label>`)
    .join("");
  return `<div class="multi" data-filter="${escapeHtml(name)}">
      <button type="button" class="multi-toggle" aria-expanded="false" aria-haspopup="true">${escapeHtml(label)}</button>
      <div class="multi-menu" hidden>${boxes}</div>
    </div>`;
}

function renderList({
  items,
  mode,
  card,
  searchLabel,
  placeholder,
  categoryLabel,
  categoryOrder,
  keywords,
  emptyText,
  tags,
  extra = "",
}) {
  const site = SITES[mode];
  const cities = orderedUnique(items, (item) => item.address.addressRegion, CITY_ORDER);
  const categories = orderedUnique(items, (item) => item.category, categoryOrder);
  const keywordButtons = keywords
    .map((word) => `<button type="button" data-keyword="${escapeHtml(word)}">${escapeHtml(word)}</button>`)
    .join("");
  const lanes = splitLanes(items)
    .map((lane) => `<section class="lane" data-lane="${escapeHtml(lane.id)}">
        <div class="lane-head">
          <h2>${escapeHtml(lane.title)}</h2>
          <div class="lane-nav">
            <button type="button" data-dir="prev" aria-label="上一組">${chevron("prev")}</button>
            <button type="button" data-dir="next" aria-label="下一組">${chevron("next")}</button>
          </div>
        </div>
        <div class="scroller">
          ${lane.jobs.map((item) => card(item, tags)).join("\n")}
        </div>
        <p class="lane-empty" hidden>${escapeHtml(emptyText)}</p>
      </section>`)
    .join("\n");

  const body = `<main>
      <div class="search-gap" aria-hidden="true"></div>
      <div class="search-dock">
        <form class="search-bar" role="search">
          <label class="sr-only" for="q">${escapeHtml(searchLabel)}</label>
          <input id="q" type="search" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
          <button type="submit">搜尋</button>
        </form>
      </div>
      <section class="search-panel">
        <div class="filter-row">
          ${multiSelect("city", "地區", cities)}
          ${multiSelect("category", categoryLabel, categories)}
        </div>
        <div class="keywords">
          <span class="keywords-label">熱門關鍵字</span>
          ${keywordButtons}
        </div>
      </section>
      <div class="board">
      ${lanes}
      ${extra || ""}
      </div>
    </main>`;

  return layout({
    title: site.name,
    body,
    mode,
    index: true,
    tags,
  });
}

function reviewCard(review, linked) {
  const title = linked
    ? `<a href="/job/${escapeHtml(review.jobId)}">${escapeHtml(review.jobTitle)}</a>`
    : escapeHtml(review.jobTitle);
  const tags = (review.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const questions = (review.questions || []).map((question) => `<li>${escapeHtml(question)}</li>`).join("");
  return `<article class="review" data-review="${escapeHtml(review.id)}">
      <div class="review-head">
        <h3 class="review-title">${title}</h3>
      </div>
      <p class="company">${escapeHtml(review.company)}</p>
      <p class="review-place">${escapeHtml(review.displayAddress)}</p>
      <div class="review-highlight review-trio">
        <div><span>難度</span><strong>${escapeHtml(review.difficulty)}</strong></div>
        <div><span>結果</span><strong>${escapeHtml(review.result)}</strong></div>
        <div><span>分數</span><strong>${escapeHtml(Number(review.rating).toFixed(1))}</strong></div>
      </div>
      <dl class="facts review-facts">
        <div><dt>面試者</dt><dd>${escapeHtml(review.reviewer)}</dd></div>
        <div><dt>面試日期</dt><dd>${escapeHtml(review.interviewDate)}</dd></div>
        <div><dt>待遇</dt><dd>${escapeHtml(review.salaryOffered)}</dd></div>
        <div><dt>類別</dt><dd>${escapeHtml(review.category)}</dd></div>
      </dl>
      <p class="review-tags">${tags}</p>
      <h4>面試流程</h4>
      <p>${escapeHtml(review.process)}</p>
      <h4>面試問題</h4>
      <ol class="review-questions">${questions}</ol>
      <h4>評論內容</h4>
      <p class="description">${escapeHtml(review.comment)}</p>
    </article>`;
}

function hotReview(review, tags) {
  return tags.wrap(`<section class="hot-review">
      <h2>熱門評論</h2>
      ${reviewCard(review, true)}
    </section>`);
}

function reviewBlock(reviews, tags) {
  return tags.wrap(`<section class="job-reviews">
      <h2>面試評論</h2>
      ${reviews.map((review) => reviewCard(review, false)).join("\n")}
    </section>`);
}

function renderJobs(jobs, tags) {
  const { items } = loadReviews();
  const picked = items[Math.floor(Math.random() * items.length)];
  return renderList({
    items: jobs,
    mode: "job",
    card: jobCard,
    searchLabel: "搜尋職缺",
    placeholder: "搜尋職稱、公司或地點",
    categoryLabel: "工作別",
    categoryOrder: CATEGORY_ORDER,
    keywords: KEYWORDS,
    emptyText: "沒有符合的職缺。",
    tags,
    extra: hotReview(picked, tags),
  });
}

function rentalCard(rental, tags) {
  const haystack = [
    rental.title,
    rental.landlord.name,
    rental.displayAddress,
    rental.category,
    rental.buildingType,
    rental.address.addressRegion,
    rental.address.addressLocality,
  ].join(" ").toLowerCase();
  return tags.wrap(`<a class="card" href="/home/${escapeHtml(rental.id)}" target="_blank" rel="noopener noreferrer" data-category="${escapeHtml(rental.category)}" data-city="${escapeHtml(rental.address.addressRegion)}" data-text="${escapeHtml(haystack)}">
    <span class="card-title">${escapeHtml(rental.title)}</span>
    <span class="card-company">${escapeHtml(rental.landlord.name)}</span>
    <span class="card-place">${escapeHtml(rental.displayAddress)}</span>
    <span class="card-salary">${escapeHtml(rental.price.text)}</span>
  </a>`);
}

function rentalReviewCard(review, linked) {
  const title = linked
    ? `<a href="/home/${escapeHtml(review.rentalId)}">${escapeHtml(review.rentalTitle)}</a>`
    : escapeHtml(review.rentalTitle);
  const scores = review.subRatings || {};
  const highlights = RENTAL_REVIEW_SCORES.map(([key, label]) => (
    `<div><span>${label}</span><strong>${escapeHtml(scores[key])} 分</strong></div>`
  )).join("");
  const tags = (review.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `<article class="review" data-review="${escapeHtml(review.id)}">
      <div class="review-head">
        <h3 class="review-title">${title}</h3>
        <p class="review-rating">${escapeHtml(Number(review.rating).toFixed(1))}</p>
      </div>
      <p class="company">${escapeHtml(review.category)} · ${escapeHtml(review.buildingType)}</p>
      <p class="review-place">${escapeHtml(review.displayAddress)}</p>
      <div class="review-highlight">
        ${highlights}
        <div><span>實際費用</span><strong class="salary">${escapeHtml(review.actualCostNotes)}</strong></div>
      </div>
      <dl class="facts review-facts">
        <div><dt>評論者</dt><dd>${escapeHtml(review.reviewer)}</dd></div>
        <div><dt>評論日期</dt><dd>${escapeHtml(review.reviewDate)}</dd></div>
        <div><dt>評論類型</dt><dd>${escapeHtml(review.reviewType)}</dd></div>
      </dl>
      <p class="review-tags">${tags}</p>
      <h4>評論內容</h4>
      <p class="description">${escapeHtml(review.comment)}</p>
    </article>`;
}

function hotRentalReview(review, tags) {
  return tags.wrap(`<section class="hot-review">
      <h2>熱門評論</h2>
      ${rentalReviewCard(review, true)}
    </section>`);
}

function rentalReviewBlock(reviews, tags) {
  return tags.wrap(`<section class="job-reviews">
      <h2>看房評論</h2>
      ${reviews.map((review) => rentalReviewCard(review, false)).join("\n")}
    </section>`);
}

function renderHomes(rentals, tags) {
  const { items } = loadRentalReviews();
  const picked = items[Math.floor(Math.random() * items.length)];
  return renderList({
    items: rentals,
    mode: "home",
    card: rentalCard,
    searchLabel: "搜尋物件",
    placeholder: "搜尋標題、房東或地點",
    categoryLabel: "類型",
    categoryOrder: HOME_CATEGORY_ORDER,
    keywords: HOME_KEYWORDS,
    emptyText: "沒有符合的物件。",
    tags,
    extra: hotRentalReview(picked, tags),
  });
}

function renderJob(job, pageUrl, tags) {
  const nature = EMPLOYMENT_LABEL[job.employmentType] || job.employmentType;
  const reviews = loadReviews().byJob.get(job.id) || [];
  const reviewsHtml = reviews.length ? reviewBlock(reviews, tags) : "";
  const body = `<main class="detail has-action">
      <article class="sheet">
        <p class="tags"><span class="tag">${escapeHtml(job.category)}</span><span class="tag tag-soft">${escapeHtml(nature)}</span></p>
        <h1>${escapeHtml(job.title)}</h1>
        <p class="company">${escapeHtml(job.company)}</p>
        ${tags.open()}
        <dl class="facts">
          <div>
            <dt>職務類別</dt>
            <dd class="job-type">${escapeHtml(job.jobCategory)}</dd>
          </div>
          <div>
            <dt>薪資待遇</dt>
            <dd class="salary">${escapeHtml(job.salary.text)}</dd>
          </div>
          <div>
            <dt>工作性質</dt>
            <dd>${escapeHtml(nature)}</dd>
          </div>
          <div>
            <dt>上班地點</dt>
            <dd class="place">${escapeHtml(job.displayAddress)}${pin}</dd>
          </div>
          <div>
            <dt>管理責任</dt>
            <dd>${escapeHtml(job.management)}</dd>
          </div>
          <div>
            <dt>出差外派</dt>
            <dd>${escapeHtml(job.travel)}</dd>
          </div>
          <div>
            <dt>上班時段</dt>
            <dd>${escapeHtml(job.shift)}<span class="hours">${escapeHtml(job.hours)}</span></dd>
          </div>
          <div>
            <dt>休假制度</dt>
            <dd>${escapeHtml(job.leave)}</dd>
          </div>
          <div>
            <dt>可上班日</dt>
            <dd>${escapeHtml(job.availableFrom)}</dd>
          </div>
          <div>
            <dt>需求人數</dt>
            <dd>${escapeHtml(job.headcount)}</dd>
          </div>
        </dl>
        ${tags.close()}
        <h2>職缺說明</h2>
        ${tags.wrap(`<p class="description">${escapeHtml(job.description)}</p>`)}
        ${reviewsHtml}
      </article>
      ${actionBar("應徵", tags)}
    </main>`;

  return layout({
    title: `${job.title}｜${job.company}｜Mai Job`,
    body,
    jsonLd: jobPosting(job, pageUrl),
    mode: "job",
    tags,
  });
}

function renderRental(rental, tags) {
  const landlord = rental.landlord || {};
  const reviews = loadRentalReviews().byRental.get(rental.id) || [];
  const reviewsHtml = reviews.length ? rentalReviewBlock(reviews, tags) : "";
  const body = `<main class="detail has-action">
      <article class="sheet">
        <p class="tags"><span class="tag">${escapeHtml(rental.category)}</span><span class="tag tag-soft">${escapeHtml(rental.buildingType)}</span></p>
        <h1>${escapeHtml(rental.title)}</h1>
        <p class="company">${escapeHtml(landlord.name)}</p>
        ${tags.open()}
        <dl class="facts">
          <div>
            <dt>房屋類型</dt>
            <dd class="job-type">${escapeHtml(rental.category)}</dd>
          </div>
          <div>
            <dt>租金</dt>
            <dd class="salary">${escapeHtml(rental.price.text)}</dd>
          </div>
          <div>
            <dt>坪數</dt>
            <dd>${escapeHtml(rental.areaText)}</dd>
          </div>
          <div>
            <dt>格局</dt>
            <dd>${escapeHtml(rental.layout)}</dd>
          </div>
          <div>
            <dt>樓層</dt>
            <dd>${escapeHtml(rental.floor.text)}</dd>
          </div>
          <div>
            <dt>押金</dt>
            <dd>${escapeHtml(rental.deposit)}</dd>
          </div>
          <div>
            <dt>管理費</dt>
            <dd>${escapeHtml(rental.managementFee)}</dd>
          </div>
          <div>
            <dt>水電</dt>
            <dd>${escapeHtml(rental.utilities)}</dd>
          </div>
          <div>
            <dt>可入住</dt>
            <dd>${escapeHtml(rental.availableFrom)}</dd>
          </div>
          <div>
            <dt>最短租期</dt>
            <dd>${escapeHtml(rental.minLeaseTerm)}</dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd class="place">${escapeHtml(rental.displayAddress)}${pin}<span class="hours">${escapeHtml(rental.nearbyTraffic)}</span></dd>
          </div>
          <div>
            <dt>聯絡人</dt>
            <dd>${escapeHtml(landlord.name)}<span class="hours">${escapeHtml(landlord.role)} ${escapeHtml(landlord.phone)}</span></dd>
          </div>
        </dl>
        ${tags.close()}
        <h2>物件說明</h2>
        ${tags.wrap(`<p class="description">${escapeHtml(rental.description)}</p>`)}
        ${reviewsHtml}
      </article>
      ${actionBar("預約看屋", tags)}
    </main>`;

  return layout({
    title: `${rental.title}｜${landlord.name}｜Mai Home`,
    body,
    mode: "home",
    tags,
  });
}

function renderNotFound(mode, tags) {
  const site = SITES[mode] || SITES.job;
  const heading = mode === "home" ? "找不到這筆物件" : "找不到這筆職缺";
  const body = `<main class="detail">
      <article class="sheet">
        <h1>${heading}</h1>
        <p class="description"><a href="${site.href}">回到${site.name}</a></p>
      </article>
    </main>`;
  return layout({ title: `${heading}｜${site.name}`, body, mode, tags });
}

const app = express();
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  const { items } = loadJobs();
  res.type("html").send(renderJobs(items, createTags()));
});

app.get("/job/:id", (req, res) => {
  const tags = createTags();
  const { byId } = loadJobs();
  const job = byId.get(req.params.id);
  if (!job) {
    res.status(404).type("html").send(renderNotFound("job", tags));
    return;
  }
  const pageUrl = `${req.protocol}://${req.get("host")}/job/${job.id}`;
  res.type("html").send(renderJob(job, pageUrl, tags));
});

app.get("/home", (_req, res) => {
  const { items } = loadRentals();
  res.type("html").send(renderHomes(items, createTags()));
});

app.get("/home/:id", (req, res) => {
  const tags = createTags();
  const { byId } = loadRentals();
  const rental = byId.get(req.params.id);
  if (!rental) {
    res.status(404).type("html").send(renderNotFound("home", tags));
    return;
  }
  res.type("html").send(renderRental(rental, tags));
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mai Job  http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} 已被占用。`);
    process.exit(1);
  }
  throw error;
});
