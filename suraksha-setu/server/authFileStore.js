const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_FILE = path.join(__dirname, "data", "users.json");

async function readAll() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(users) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

/**
 * @returns {Promise<{ _id: string, phone: string, fullName: string, passwordHash: string, dob: string }>}
 */
async function registerUser({ phone, passwordHash, fullName, dob }) {
  const users = await readAll();
  if (users.some((u) => u.phone === phone)) {
    const err = new Error("DUPLICATE_PHONE");
    err.statusCode = 409;
    throw err;
  }
  const user = {
    _id: randomUUID(),
    phone,
    passwordHash,
    fullName: fullName || "",
    dob: dob || "",
    scores: {},
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeAll(users);
  return user;
}

async function findByPhone(phone) {
  const users = await readAll();
  return users.find((u) => u.phone === phone) || null;
}

async function findById(id) {
  const users = await readAll();
  return users.find((u) => String(u._id) === String(id)) || null;
}

function mergeScores(existing, incoming) {
  const o = { ...(existing || {}) };
  for (const [k, v] of Object.entries(incoming || {})) {
    if (v === undefined || v === null) continue;
    if (k === "quizLast" || k === "quizAt" || k === "quizTotalQs") {
      o[k] = v;
    } else if (typeof v === "number" && (k.endsWith("Best") || k === "compareAnswered")) {
      o[k] = Math.max(o[k] ?? 0, v);
    } else if (typeof v === "string" || typeof v === "boolean") {
      o[k] = v;
    } else if (typeof v === "number") {
      o[k] = Math.max(o[k] ?? 0, v);
    }
  }
  return o;
}

async function updateScoresById(id, incomingScores) {
  const users = await readAll();
  const idx = users.findIndex((u) => String(u._id) === String(id));
  if (idx === -1) return null;
  users[idx].scores = mergeScores(users[idx].scores || {}, incomingScores);
  await writeAll(users);
  return users[idx];
}

module.exports = { registerUser, findByPhone, findById, updateScoresById, mergeScores, DATA_FILE };
