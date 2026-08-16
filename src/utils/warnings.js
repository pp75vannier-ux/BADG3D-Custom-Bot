const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../../data/warnings.json");

function ensureFile() {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
}

function read() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function write(data) {
  ensureFile();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function add(guildId, userId, reason, moderatorId) {
  const data = read();
  data[guildId] ??= {};
  data[guildId][userId] ??= [];

  data[guildId][userId].push({
    reason,
    moderatorId,
    date: new Date().toISOString()
  });

  write(data);
  return data[guildId][userId];
}

function get(guildId, userId) {
  const data = read();
  return data[guildId]?.[userId] || [];
}

function clear(guildId, userId) {
  const data = read();
  if (data[guildId]) delete data[guildId][userId];
  write(data);
}

module.exports = { add, get, clear };
