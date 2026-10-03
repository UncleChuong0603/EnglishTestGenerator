// Visual-QA harness only: leave the CMS override table empty while the local
// PostgreSQL service is unavailable. Application source keeps its fail-closed
// production behavior.
const pg = require("pg");

const originalQuery = pg.Pool.prototype.query;

pg.Pool.prototype.query = function mockContentQuery(config, values, callback) {
  const text = typeof config === "string" ? config : config?.text;
  if (typeof text === "string" && text.includes('from "content_posts"')) {
    const result = { command: "SELECT", rowCount: 0, oid: null, rows: [], fields: [] };
    const done = typeof values === "function" ? values : callback;
    if (typeof done === "function") {
      queueMicrotask(() => done(null, result));
      return;
    }
    return Promise.resolve(result);
  }
  return originalQuery.apply(this, arguments);
};
