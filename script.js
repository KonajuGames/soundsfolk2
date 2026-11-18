/* ==========================================================
   SoundsFolk – line-up data and page behaviour
   Edit the ACTS array to update the line-up and running order.
   `origin` is optional (shown under the name). Acts named "TBA" show in
   the line-up but are left out of the running order.
   NOTE: stages and times are placeholders until the real running order is set.
   ========================================================== */

const FESTIVAL_START = new Date("2027-03-21T12:00:00+10:00"); // Brisbane (AEST, no DST)

const ACTS = [
  { name: "Dlu",              origin: "Scotland", stage: "Main Stage",   time: "12:30pm" },
  { name: "The Burning Hell", origin: "Canada",   stage: "Main Stage",   time: "2:00pm" },
  { name: "Kris Mizzi",       origin: "Victoria", stage: "Garden Stage", time: "3:00pm" },
  { name: "Cigany Weaver",                        stage: "Main Stage",   time: "4:00pm" },
  { name: "Amaídi",                               stage: "Garden Stage", time: "5:00pm" },
  { name: "Kristina Olsen",   origin: "USA",      stage: "Main Stage",   time: "6:00pm" },
  { name: "TBA" },
  { name: "TBA" },
];

/* ---------- Line-up ---------- */
const lineupList = document.getElementById("lineup-list");

ACTS.forEach((act, i) => {
  const li = document.createElement("li");
  li.className = `c${i % 5}${act.name === "TBA" ? " tba" : ""}`;
  const name = document.createElement("span");
  name.className = "lineup__name";
  name.textContent = act.name;
  li.appendChild(name);
  if (act.origin) {
    const origin = document.createElement("span");
    origin.className = "lineup__origin";
    origin.textContent = act.origin;
    li.appendChild(origin);
  }
  lineupList.appendChild(li);
});

/* ---------- Running order with stage tabs ---------- */
const toMinutes = t => {
  const [, h, m, ap] = t.match(/(\d+):(\d+)\s*(am|pm)/i);
  let hrs = +h % 12; if (ap.toLowerCase() === "pm") hrs += 12;
  return hrs * 60 + +m;
};

const scheduledActs = ACTS.filter(a => a.time);
const stages = ["All stages", ...new Set(scheduledActs.map(a => a.stage))];
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
  scheduledActs.filter(a => stage === "All stages" || a.stage === stage)
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
