// 每日兩字 home screen widget for Scriptable (iOS).
// Setup: open Scriptable, tap +, paste this whole file, name it "每日兩字".
// Then add a Scriptable widget (medium size) to the home screen and choose this script.
// Tapping the widget opens today's reel.

const BASE = "https://linray0709.github.io/daily-two/";

async function loadDay() {
  const fm = FileManager.local();
  const cache = fm.joinPath(fm.cacheDirectory(), "daily-two-day.json");
  try {
    const latest = await new Request(BASE + "latest.json?t=" + Date.now()).loadJSON();
    const day = await new Request(BASE + "days/" + latest.date + ".json").loadJSON();
    fm.writeString(cache, JSON.stringify(day));
    return day;
  } catch (e) {
    if (fm.fileExists(cache)) return JSON.parse(fm.readString(cache));
    return null;
  }
}

function build(day, family) {
  const w = new ListWidget();
  const ink = Color.dynamic(new Color("#101828"), new Color("#E9EDF5"));
  const mute = Color.dynamic(new Color("#5B667A"), new Color("#98A3B8"));
  w.backgroundColor = Color.dynamic(new Color("#FFFFFF"), new Color("#161D2E"));
  w.setPadding(14, 16, 14, 16);
  w.url = BASE;

  if (!day) {
    const t = w.addText("每日兩字\n連上網路後會顯示今天的內容");
    t.font = Font.systemFont(13);
    t.textColor = mute;
    return w;
  }

  const m = day.date.split("-");
  const kick = w.addText(Number(m[1]) + " 月 " + Number(m[2]) + " 日 · " + day.topic);
  kick.font = Font.mediumSystemFont(11);
  kick.textColor = mute;
  w.addSpacer(4);

  if (family !== "small") {
    const title = w.addText(day.title);
    title.font = Font.boldSystemFont(16);
    title.textColor = ink;
    title.lineLimit = 2;
    title.minimumScaleFactor = 0.8;
    w.addSpacer(8);
  }

  for (const word of day.words) {
    const row = w.addStack();
    row.backgroundColor = new Color("#FFD84D");
    row.cornerRadius = 5;
    row.setPadding(3, 7, 3, 7);
    const t = row.addText(word.term);
    t.font = Font.semiboldSystemFont(family === "small" ? 12 : 13);
    t.textColor = new Color("#231A00");
    t.lineLimit = 1;
    t.minimumScaleFactor = 0.7;
    w.addSpacer(5);
  }
  w.addSpacer();

  const next = new Date();
  next.setMinutes(next.getMinutes() + 30);
  w.refreshAfterDate = next;
  return w;
}

const day = await loadDay();
if (config.runsInWidget) {
  Script.setWidget(build(day, config.widgetFamily));
} else {
  await build(day, "medium").presentMedium();
}
Script.complete();
