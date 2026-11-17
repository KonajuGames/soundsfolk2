/* ==========================================================
   SoundsFolk – line-up data and page behaviour
   Edit the ACTS array to update the line-up and running order.
   (The names below are placeholders until the real line-up is announced.)
   ========================================================== */

const FESTIVAL_START = new Date("2027-03-21T12:00:00+10:00"); // Brisbane (AEST, no DST)

const ACTS = [
  { name: "The Paperbark Strings", stage: "Main Stage", time: "8:00pm", headliner: true,
    blurb: "Five-piece string band weaving Australian bush ballads with Appalachian fiddle tunes. Our closing act." },
  { name: "Wren & Willow", stage: "Main Stage", time: "6:45pm", headliner: true,
    blurb: "Close-harmony duo whose songs about rivers, ranges and long drives home have filled halls across Queensland." },
  { name: "Bunya Row", stage: "Main Stage", time: "5:30pm",
    blurb: "Banjo, bouzouki and a stomp box. Expect foot-tapping reels and a singalong or two." },
  { name: "Maggie Lark", stage: "Garden Stage", time: "4:45pm",
    blurb: "Singer-songwriter with a finger-picked guitar and stories that land somewhere between heartbreak and humour." },
  { name: "Old Possum Jug Band", stage: "Main Stage", time: "4:15pm",
    blurb: "Washboard, jug, kazoo and the occasional saw – a joyful racket for all ages." },
  { name: "Saltwater Hymnal", stage: "Garden Stage", time: "3:30pm",
    blurb: "Unaccompanied sea shanties and work songs, sung in rich four-part harmony." },
  { name: "Clover Kingfisher", stage: "Main Stage", time: "3:00pm",
    blurb: "Celtic-flavoured trio led by uilleann pipes and bodhrán." },
  { name: "The Brunswick Ramblers", stage: "Garden Stage", time: "2:15pm",
    blurb: "New Farm locals playing old-time country and western swing." },
  { name: "Juniper Moon", stage: "Main Stage", time: "1:45pm",
    blurb: "Dreamy indie-folk with autoharp, cello and layered vocals." },
  { name: "Fern Gully Fiddlers", stage: "Garden Stage", time: "1:00pm",
    blurb: "A youth fiddle ensemble kicking off the Garden Stage with plenty of energy." },
  { name: "Riverbend Session", stage: "Main Stage", time: "12:30pm",
    blurb: "Open the day with a gentle acoustic set from this Brisbane collective." },
  { name: "Open Jam Circle", stage: "Garden Stage", time: "12:00pm",
    blurb: "Bring an instrument and join in. All levels welcome – just follow the tune." },
];

/* ---------- Line-up word cloud ---------- */
const lineupList = document.getElementById("lineup-list");
const detail = document.getElementById("act-detail");

// Headliners first, then the rest in poster order
const lineupOrder = [...ACTS.filter(a => a.headliner), ...ACTS.filter(a => !a.headliner)];

lineupOrder.forEach((act, i) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = act.name;
  btn.className = `c${i % 5}${act.headliner ? " headliner" : ""}`;
  btn.setAttribute("aria-pressed", "false");
  btn.setAttribute("aria-controls", "act-detail");
  btn.addEventListener("click", () => showAct(act, btn));
  li.appendChild(btn);
  lineupList.appendChild(li);
});

function showAct(act, btn) {
  const wasOpen = btn.getAttribute("aria-pressed") === "true";
  lineupList.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
  if (wasOpen) { detail.hidden = true; return; }
  btn.setAttribute("aria-pressed", "true");
  detail.querySelector(".act-detail__name").textContent = act.name;
  detail.querySelector(".act-detail__meta").textContent = `${act.stage} · ${act.time}`;
  detail.querySelector(".act-detail__blurb").textContent = act.blurb;
  detail.hidden = false;
  detail.style.animation = "none"; void detail.offsetWidth; detail.style.animation = "";
  if (window.matchMedia("(max-width: 700px)").matches) {
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

detail.querySelector(".act-detail__close").addEventListener("click", () => {
  detail.hidden = true;
  lineupList.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
});

/* ---------- Running order with stage tabs ---------- */
const toMinutes = t => {
  const [, h, m, ap] = t.match(/(\d+):(\d+)\s*(am|pm)/i);
  let hrs = +h % 12; if (ap.toLowerCase() === "pm") hrs += 12;
  return hrs * 60 + +m;
};

const stages = ["All stages", ...new Set(ACTS.map(a => a.stage))];
const tabs = document.getElementById("stage-tabs");
const scheduleList = document.getElementById("schedule-list");

stages.forEach((stage, i) => {
  const b = document.createElement("button");
  b.className = "stage-tab";
  b.type = "button";
  b.setAttribute("role", "tab");
  b.setAttribute("aria-selected", i === 0 ? "true" : "false");
  b.textContent = stage;
  b.addEventListener("click", () => {
    tabs.querySelectorAll(".stage-tab").forEach(t => t.setAttribute("aria-selected", "false"));
    b.setAttribute("aria-selected", "true");
    renderSchedule(stage);
  });
  tabs.appendChild(b);
});

function renderSchedule(stage) {
  scheduleList.innerHTML = "";
  ACTS.filter(a => stage === "All stages" || a.stage === stage)
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
    .forEach(act => {
      const li = document.createElement("li");
      const time = document.createElement("span");
      time.className = "schedule__time";
      time.textContent = act.time;
      const name = document.createElement("span");
      name.className = "schedule__act";
      name.textContent = act.name;
      const note = document.createElement("span");
      note.className = "schedule__note";
      note.textContent = act.stage;
      name.appendChild(note);
      li.append(time, name);
      scheduleList.appendChild(li);
    });
}
renderSchedule("All stages");

/* ---------- Countdown ---------- */
const cd = document.getElementById("countdown");
const units = {
  days: cd.querySelector('[data-unit="days"]'),
  hours: cd.querySelector('[data-unit="hours"]'),
  mins: cd.querySelector('[data-unit="mins"]'),
  secs: cd.querySelector('[data-unit="secs"]'),
};
function tick() {
  let diff = Math.max(0, FESTIVAL_START - Date.now());
  if (diff === 0) {
    cd.innerHTML = '<p class="hero__venue" style="margin:0">It’s festival day!</p>';
    return;
  }
  const s = Math.floor(diff / 1000);
  units.days.textContent = Math.floor(s / 86400);
  units.hours.textContent = String(Math.floor(s / 3600) % 24).padStart(2, "0");
  units.mins.textContent = String(Math.floor(s / 60) % 60).padStart(2, "0");
  units.secs.textContent = String(s % 60).padStart(2, "0");
  setTimeout(tick, 1000);
}
tick();
cd.setAttribute("aria-live", "off"); // avoid announcing every second

/* ---------- Mobile nav ---------- */
const toggle = document.querySelector(".nav__toggle");
const links = document.getElementById("nav-links");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  links.classList.toggle("is-open", !open);
});
links.addEventListener("click", e => {
  if (e.target.closest("a")) {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }
});

/* ---------- Ticket placeholders ---------- */
document.querySelectorAll("[data-ticket]").forEach(a => {
  if (a.getAttribute("href") === "#") {
    a.addEventListener("click", e => {
      e.preventDefault();
      alert("Ticket sales open soon – check back shortly!");
    });
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
