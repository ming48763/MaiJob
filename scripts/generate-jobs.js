const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const segments = JSON.parse(
  fs.readFileSync(path.join(root, "data", "street-segments.json"), "utf8")
);

const categories = ["美甲", "餐飲", "加油站", "美術"];

const catalog = {
  美甲: {
    titles: ["美甲師", "美甲助理", "凝膠指甲設計師", "美甲店店長", "美甲講師", "手足保養師", "美甲行政", "美睫美甲顧問"],
    companies: ["指尖日常", "釉光指甲室", "巷口美甲", "石紋指甲", "慢乾美甲", "澄色指甲所", "小指頭工作室", "月相美甲", "原木甲藝", "晴天凝膠"],
    salaries: [
      [30000, 38000],
      [34000, 45000],
      [38000, 52000],
    ],
  },
  餐飲: {
    titles: ["外場服務員", "廚房助手", "飲料調製員", "咖啡師", "早班廚師", "餐飲店長", "烘焙師", "收銀外場"],
    companies: ["巷口餐桌", "第三杯店", "晨間爐火", "島台食堂", "青石咖啡", "晚班廚房", "木匙便當", "河岸早午餐", "燈下食堂", "市集小館"],
    salaries: [
      [28000, 34000],
      [32000, 40000],
      [36000, 48000],
    ],
  },
  加油站: {
    titles: ["加油員", "油站班長", "油站收銀員", "夜班加油員", "洗車人員", "油站倉管", "油站正職服務", "油站場地人員"],
    companies: ["路燈加油站", "城南油品", "平原加油示範站", "港邊油站", "山線加油", "綠燈油品", "夜班油站", "河岸油站", "街角油品", "示範油站"],
    salaries: [
      [30000, 36000],
      [33000, 42000],
      [38000, 48000],
    ],
  },
  美術: {
    titles: ["美術老師", "插畫師", "畫室助教", "展覽佈置人員", "美術設計助理", "陶藝助教", "壁畫繪師", "兒童美教室助教"],
    companies: ["南窗畫室", "白牆工作室", "色素教室", "速寫角落", "陶皿工作室", "街牆壁畫組", "紙上美術", "午後畫班", "藍灰藝廊", "木框工作室"],
    salaries: [
      [30000, 40000],
      [35000, 48000],
      [40000, 56000],
    ],
  },
};

const roles = {
  美甲師: {
    duty: "負責凝膠指甲、基礎保養與卸甲。施作前會和客人確認顏色、長度與形狀，完成後消毒工具並整理工作台。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  美甲助理: {
    duty: "負責工具消毒、補充甲油與耗材，並在施作時協助客人就座和成品拍照。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  凝膠指甲設計師: {
    duty: "依客人提供的參考圖打稿，完成凝膠造型、彩繪與手足保養，並說明居家護甲方式。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  美甲店店長: {
    duty: "安排店內班表、指導新人手法、處理客人意見，並核對甲油與耗材庫存。",
    management: "需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  美甲講師: {
    duty: "規劃店內教學課程，示範凝膠與彩繪手法，並檢視學員作品、說明可改進的地方。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "13:00~21:00",
    leave: "週休二日",
  },
  手足保養師: {
    duty: "進行手部與足部去角質、基礎護理與保濕，並依皮膚狀況調整保養步驟。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  美甲行政: {
    duty: "處理預約、改期與收銀，整理客人資料，並協助現場候位。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  美睫美甲顧問: {
    duty: "接待客人並詢問想要的款式，推薦適合的美甲或美睫療程，再確認施作時間。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~20:00",
    leave: "週休二日",
  },
  外場服務員: {
    duty: "負責點餐、送餐與收拾桌面，尖峰時段支援出餐口，並維持座位整潔。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~21:00",
    leave: "排班制",
  },
  廚房助手: {
    duty: "協助備料、洗滌與簡易配菜，收班時清理工作台與廚房地面。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "10:00~19:00",
    leave: "排班制",
  },
  飲料調製員: {
    duty: "依訂單調製飲料、看顧吧台，並核對當日糖漿與杯材庫存。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "10:00~19:00",
    leave: "排班制",
  },
  咖啡師: {
    duty: "負責咖啡萃取、拉花與吧台出杯，並保養咖啡機與研磨器具。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  早班廚師: {
    duty: "負責早班備餐與烹調，確認當日食材狀況，並在交班前完成出餐紀錄。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "早班",
    hours: "06:00~14:00",
    leave: "排班制",
  },
  餐飲店長: {
    duty: "安排現場人力、驗收食材、處理客人意見，並交代交班事項。",
    management: "需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "09:00~18:00",
    leave: "排班制",
  },
  烘焙師: {
    duty: "負責麵團整理、烘烤與成品裝飾，並記錄出爐時間與當日產量。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "早班",
    hours: "07:00~16:00",
    leave: "排班制",
  },
  收銀外場: {
    duty: "負責收銀、帶位與外場補位，尖峰時段協助出餐和桌面整理。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "11:00~21:00",
    leave: "排班制",
  },
  加油員: {
    duty: "負責加油、引導車道與行車動線，並提醒客人確認油箱蓋與胎壓。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  油站班長: {
    duty: "負責收銀對帳、交班紀錄與現場帶班，並確認便利架補貨。",
    management: "需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  油站收銀員: {
    duty: "負責櫃檯收銀、開立發票與便利商品結帳，並維持櫃台整潔。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  夜班加油員: {
    duty: "負責夜間加油與車道引導，並定時巡視場地安全。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "夜班",
    hours: "22:00~06:00",
    leave: "排班制",
  },
  洗車人員: {
    duty: "負責車輛清洗、擦拭與車道整理，並維護洗車設備。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "09:00~18:00",
    leave: "排班制",
  },
  油站倉管: {
    duty: "整理油品與耗材庫存，核對進貨數量，並維持倉庫動線。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "09:00~18:00",
    leave: "排班制",
  },
  油站正職服務: {
    duty: "輪值加油、支援收銀與場地清潔，並依班表完成交班。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  油站場地人員: {
    duty: "維持車道動線、清理場地，並協助引導進出車輛。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "08:00~17:00",
    leave: "排班制",
  },
  美術老師: {
    duty: "帶領成人或兒童繪畫課程，準備教材，並在課後整理教室。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "13:00~21:00",
    leave: "週休二日",
  },
  插畫師: {
    duty: "負責插畫完稿、色彩提案與修稿，並依委託內容調整畫面。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "10:00~19:00",
    leave: "週休二日",
  },
  畫室助教: {
    duty: "協助老師帶課、準備畫材，並在課後整理教室與學員作品。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "13:00~21:00",
    leave: "週休二日",
  },
  展覽佈置人員: {
    duty: "協助佈展、掛畫、燈位調整與材料進出，檔期期間至展場作業。",
    management: "不需負擔管理責任",
    travel: "需出差外派",
    shift: "日班",
    hours: "09:00~18:00",
    leave: "排班制",
  },
  美術設計助理: {
    duty: "整理設計素材、協助提案排版，並追蹤完稿進度。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "10:00~19:00",
    leave: "週休二日",
  },
  陶藝助教: {
    duty: "支援陶藝與手作課程，維護工具、土料與作品乾燥區。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "13:00~21:00",
    leave: "週休二日",
  },
  壁畫繪師: {
    duty: "繪製牆面草圖，並到業主指定的牆面現場完成壁畫。",
    management: "不需負擔管理責任",
    travel: "需出差外派",
    shift: "日班",
    hours: "09:00~18:00",
    leave: "排班制",
  },
  兒童美教室助教: {
    duty: "協助兒童美術課程、準備材料，並維持教室安全與整潔。",
    management: "不需負擔管理責任",
    travel: "無需出差外派",
    shift: "日班",
    hours: "13:00~21:00",
    leave: "週休二日",
  },
};

const startOptions = ["不限", "可立即上班", "錄取後一週內"];

function fnv1a(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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

function fuzzCoordinate(id, lat, lng) {
  const rand = mulberry32(fnv1a(id));
  const meters = 180 + rand() * 220;
  const angle = rand() * Math.PI * 2;
  const latitude = lat + (meters * Math.cos(angle)) / 111320;
  const longitude =
    lng + (meters * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return {
    latitude: Math.round(latitude * 1e6) / 1e6,
    longitude: Math.round(longitude * 1e6) / 1e6,
    offsetMeters: Math.round(meters),
  };
}

function distanceMeters(aLat, aLng, bLat, bLng) {
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function formatTwd(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function datePosted(index) {
  const date = new Date(Date.UTC(2026, 0, 6));
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
}

function interleaveByCity(rows) {
  const groups = ["台北市", "台中市", "高雄市"].map((city) =>
    rows.filter((row) => row.city === city)
  );
  const max = Math.max(...groups.map((group) => group.length));
  const ordered = [];
  for (let i = 0; i < max; i += 1) {
    for (const group of groups) {
      if (group[i]) ordered.push(group[i]);
    }
  }
  return ordered;
}

function partTimeHours(hours) {
  const match = /^(\d{2}):00~(\d{2}):00$/.exec(hours);
  if (!match) return hours;
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (end <= start) return hours;
  const mid = start + Math.ceil((end - start) / 2);
  return `${String(mid).padStart(2, "0")}:00~${match[2]}:00`;
}

function buildDescription(job, role) {
  return `${job.company}招募${job.title}，上班地點在${job.displayAddress}。${role.duty}`;
}

const ordered = interleaveByCity(segments);
if (ordered.length < 120) {
  throw new Error(`路段不足 120 筆，目前 ${ordered.length}`);
}

const counts = { 美甲: 0, 餐飲: 0, 加油站: 0, 美術: 0 };
const jobs = ordered.slice(0, 120).map((segment, index) => {
  const category = categories[index % categories.length];
  const info = catalog[category];
  const nth = counts[category];
  counts[category] += 1;
  const id = `demo${String(index + 1).padStart(3, "0")}`;
  const [min, max] = info.salaries[nth % info.salaries.length];
  const displayAddress = `${segment.city}${segment.locality}${segment.street}`;
  const geo = fuzzCoordinate(id, segment.lat, segment.lng);
  const offset = distanceMeters(segment.lat, segment.lng, geo.latitude, geo.longitude);
  if (offset < 170 || offset > 420) {
    throw new Error(`${id} 偏移距離異常：${offset}`);
  }

  const title = info.titles[nth % info.titles.length];
  const role = roles[title];
  if (!role) throw new Error(`缺少職缺設定：${title}`);
  const partTime = index % 5 === 0;
  const job = {
    id,
    title,
    category,
    jobCategory: title,
    company: info.companies[nth % info.companies.length],
    employmentType: partTime ? "PART_TIME" : "FULL_TIME",
    datePosted: datePosted(index),
    address: {
      streetAddress: segment.street,
      addressLocality: segment.locality,
      addressRegion: segment.city,
      addressCountry: "TW",
    },
    displayAddress,
    management: role.management,
    travel: role.travel,
    shift: role.shift,
    hours: partTime ? partTimeHours(role.hours) : role.hours,
    leave: partTime ? "依排班" : role.leave,
    availableFrom: startOptions[nth % startOptions.length],
    headcount: role.management.startsWith("需") ? "1人" : `${(nth % 3) + 1}人`,
    salary: {
      min,
      max,
      currency: "TWD",
      text: `月薪${formatTwd(min)}~${formatTwd(max)}元`,
    },
    geo,
  };
  job.description = buildDescription(job, role);
  return job;
});

const ids = new Set(jobs.map((job) => job.id));
if (ids.size !== jobs.length) {
  throw new Error("職缺 id 重複");
}
const engineerWords = ["React", "TypeScript", "Python", "HTML", "CSS", "Docker", "Node.js"];
for (const job of jobs) {
  for (const keyword of engineerWords) {
    if (job.description.includes(keyword)) {
      throw new Error(`${job.id} 工作內容仍含工程師用語 ${keyword}`);
    }
  }
  if (!job.description.includes(job.title) || !job.description.includes(job.company)) {
    throw new Error(`${job.id} 工作內容未對應職缺`);
  }
}

fs.writeFileSync(
  path.join(root, "data", "jobs.json"),
  `${JSON.stringify(jobs, null, 2)}\n`
);

console.log(`wrote ${jobs.length} jobs`);
for (const job of [jobs[0], jobs[1], jobs[2], jobs[3], jobs[4]]) {
  console.log(
    `${job.id} ${job.category} ${job.title} ${job.company} ${job.displayAddress} ${job.geo.latitude},${job.geo.longitude} ±${job.geo.offsetMeters}m`
  );
}
