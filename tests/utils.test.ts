import { describe, expect, it } from "vitest";
import { cn } from "../lib/utils";

describe("cn", () => {
  it("mescla classes sem duplicar conflitantes", () => {
    expect(cn("p-2", "p-4", "text-white")).toContain("p-4");
  });
});
