/**
 * Minimal structured logger. Swap this out for pino/winston in production —
 * the interface (info/warn/error/debug) is kept small on purpose so that's a
 * drop-in change.
 */
const ts = () => new Date().toISOString();

function line(level, msg, meta) {
  const payload = { ts: ts(), level, msg, ...(meta ? { meta } : {}) };
  const out = JSON.stringify(payload);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

export const logger = {
  info: (msg, meta) => line("info", msg, meta),
  warn: (msg, meta) => line("warn", msg, meta),
  error: (msg, meta) => line("error", msg, meta),
  debug: (msg, meta) => {
    if (process.env.DEBUG) line("debug", msg, meta);
  },
};
