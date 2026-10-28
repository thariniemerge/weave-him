import { buildPayload } from "./weave";
import { draftVows } from "./api";

// Vows are written in the background as soon as her answers are known; one request per distinct set of answers
const drafts = new Map();
const late = {};

export const vowsFor = (answers) => {
  const payload = buildPayload(answers);
  const sig = JSON.stringify(payload);
  if (!drafts.has(sig)) {
    if (drafts.size > 4) drafts.delete(drafts.keys().next().value);
    drafts.set(sig, draftVows(payload).then((r) => r.draft).catch(() => null));
  }
  return drafts.get(sig);
};

// A husband woven with template vows can still take the AI vows if they land shortly after
export const setLateDraft = (id, promise) => { late[id] = { promise, at: Date.now() }; };
export const peekLateDraft = (id) => late[id];
export const dropLateDraft = (id) => { delete late[id]; };
