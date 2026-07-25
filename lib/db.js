// Petite "base de données" fichier JSON, côté serveur uniquement.
// But : avoir une vraie persistance dès maintenant sans dépendre d'un backend externe.
// Elle est isolée dans ce fichier pour qu'on puisse la remplacer plus tard (Medusa, Postgres...)
// simplement en changeant l'implémentation des fonctions ci-dessous, sans toucher au reste du code.

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function writeCollection(name, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

export const db = {
  getAll(name) {
    return readCollection(name);
  },
  getById(name, id) {
    return readCollection(name).find((i) => String(i.id) === String(id)) || null;
  },
  insert(name, item) {
    const collection = readCollection(name);
    const record = { id: nextId(collection), ...item };
    collection.push(record);
    writeCollection(name, collection);
    return record;
  },
  update(name, id, patch) {
    const collection = readCollection(name);
    const idx = collection.findIndex((i) => String(i.id) === String(id));
    if (idx === -1) return null;
    collection[idx] = { ...collection[idx], ...patch, id: collection[idx].id };
    writeCollection(name, collection);
    return collection[idx];
  },
  remove(name, id) {
    const collection = readCollection(name);
    const filtered = collection.filter((i) => String(i.id) !== String(id));
    writeCollection(name, filtered);
    return filtered.length !== collection.length;
  },
  removeWhere(name, predicate) {
    const collection = readCollection(name);
    const filtered = collection.filter((i) => !predicate(i));
    writeCollection(name, filtered);
    return collection.length - filtered.length;
  },
  setAll(name, data) {
    writeCollection(name, data);
  },
};
