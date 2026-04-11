import { describe, it, expect } from "vitest";
import { deepUnwrapValue, parseForExport, parseForDelete } from "../src/lib/dsr-utils";

describe("DSR unwrapping utilities", () => {
  it("deepUnwrapValue should unwrap nested stringified array -> stringified JSON", () => {
    const nested = '["{\\"ts\\":123,\\"subject\\":\\"alice\\"}"]';
    const res = deepUnwrapValue(nested);
    expect(res).toEqual({ ts: 123, subject: "alice" });
  });

  it("parseForExport should parse common Upstash wrapped LRANGE items", () => {
    const list = [
      '["{\\"ts\\":123,\\"subject\\":\\"bob\\"}"]',
      '["{\\"ts\\":124,\\"subject\\":\\"carol\\"}"]',
    ];
    const res = parseForExport(list);
    expect(Array.isArray(res)).toBe(true);
    expect(res).toContainEqual({ ts: 123, subject: "bob" });
    expect(res).toContainEqual({ ts: 124, subject: "carol" });
  });

  it("parseForDelete should return parsed objects for deletion checks", () => {
    const list = [
      '["{\\"ts\\":200,\\"subject\\":\\"delete-me\\"}"]',
    ];
    const parsed = parseForDelete(list);
    expect(parsed[0]).toEqual({ ts: 200, subject: "delete-me" });
  });

  it("parseForExport should wrap unparsable strings as {raw:...}", () => {
    const res = parseForExport(["not-json-at-all"]);
    expect(res[0]).toEqual({ raw: "not-json-at-all" });
  });
});
