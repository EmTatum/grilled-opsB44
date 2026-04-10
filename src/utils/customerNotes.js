export const normalizeText = (value = "") => value.replace(/\s+/g, " ").trim().toLowerCase();

export const normalizeClientName = (value = "") => normalizeText(value);

export const getDayKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const getNoteDuplicateKey = (note) => {
  const client = normalizeClientName(note.client_name);
  const content = normalizeText(note.content);
  const createdDay = getDayKey(note.created_date);
  if (!client) return "";
  if (content) return `${client}::content::${content}`;
  if (createdDay) return `${client}::date::${createdDay}`;
  return `${client}::id::${note.id}`;
};

const normalizeTags = (tags = []) => [...tags].map((tag) => normalizeText(tag)).filter(Boolean).sort();

const getTagKey = (tags = []) => normalizeTags(tags).join("|");

export const getDeduplicatedNotes = (notes = []) => {
  const dedupeMap = new Map();
  const duplicateGroups = new Map();

  notes.forEach((note) => {
    const clientKey = normalizeClientName(note.client_name);
    const contentKey = normalizeText(note.content);
    const dateKey = getDayKey(note.created_date);
    const tagsKey = getTagKey(note.tags || []);

    const keys = [
      contentKey ? `${clientKey}::content::${contentKey}` : "",
      dateKey ? `${clientKey}::date::${dateKey}` : "",
      dateKey && tagsKey ? `${clientKey}::tags-date::${tagsKey}::${dateKey}` : "",
    ].filter(Boolean);

    const matchedEntry = keys.find((key) => dedupeMap.has(key));

    if (matchedEntry) {
      const primary = dedupeMap.get(matchedEntry);
      const groupId = `${primary.id}::${matchedEntry}`;
      const group = duplicateGroups.get(groupId) || [primary];
      group.push(note);
      duplicateGroups.set(groupId, group);
      return;
    }

    keys.forEach((key) => dedupeMap.set(key, note));
  });

  const duplicateNoteIds = new Set(Array.from(duplicateGroups.values()).flatMap((group) => group.slice(1).map((note) => note.id)));
  const deduped = notes.filter((note) => !duplicateNoteIds.has(note.id));
  const duplicateSets = Array.from(duplicateGroups.values());

  return { deduped, duplicateSets };
};

export const getGeneratedIntelligenceKey = (note) => {
  const clientKey = normalizeClientName(note.client_name);
  const tagsKey = getTagKey(note.tags || []);
  return `${clientKey}::${tagsKey}`;
};

export const getGeneratedDuplicateSets = (notes = []) => {
  const groups = new Map();

  notes.forEach((note) => {
    const key = getGeneratedIntelligenceKey(note);
    const dateKey = getDayKey(note.created_date);
    if (!key || !dateKey) return;
    const groupKey = `${key}::${dateKey}`;
    const group = groups.get(groupKey) || [];
    group.push(note);
    groups.set(groupKey, group);
  });

  return Array.from(groups.values()).filter((group) => group.length > 1);
};

export const getNotePreview = (content = "") => {
  const clean = content.replace(/\r/g, "").trim();
  if (!clean) return "No preview available.";

  if (clean.toUpperCase().includes("CLIENT SALES INTELLIGENCE REPORT")) {
    const lines = clean
      .split("\n")
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line && line.toUpperCase() !== "CLIENT SALES INTELLIGENCE REPORT" && !line.endsWith(":"));

    return (lines.slice(0, 2).join(" • ") || "Client sales intelligence report available.").slice(0, 220);
  }

  return clean.replace(/\n+/g, " ").slice(0, 220);
};