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

export const getDeduplicatedNotes = (notes = []) => {
  const seen = new Set();
  const deduped = [];
  const duplicateGroups = new Map();

  notes.forEach((note) => {
    const byContentKey = normalizeText(note.content)
      ? `${normalizeClientName(note.client_name)}::content::${normalizeText(note.content)}`
      : "";
    const byDateKey = getDayKey(note.created_date)
      ? `${normalizeClientName(note.client_name)}::date::${getDayKey(note.created_date)}`
      : "";

    const matchedKey = [byContentKey, byDateKey].find((key) => key && seen.has(key));
    const primaryKey = byContentKey || byDateKey || `${normalizeClientName(note.client_name)}::id::${note.id}`;

    if (matchedKey) {
      const group = duplicateGroups.get(matchedKey) || [];
      group.push(note);
      duplicateGroups.set(matchedKey, group);
      return;
    }

    deduped.push(note);
    if (byContentKey) {
      seen.add(byContentKey);
      duplicateGroups.set(byContentKey, [note]);
    }
    if (byDateKey) {
      seen.add(byDateKey);
      if (!duplicateGroups.has(byDateKey)) duplicateGroups.set(byDateKey, [note]);
    }
  });

  const duplicateSets = Array.from(new Map(
    Array.from(duplicateGroups.values())
      .filter((group) => group.length > 1)
      .map((group) => [group.map((item) => item.id).sort().join("-"), group])
  ).values());

  return { deduped, duplicateSets };
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