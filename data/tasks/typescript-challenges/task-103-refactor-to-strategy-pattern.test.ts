import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const WORKSPACE = process.env.BENCH_WORKSPACE ?? process.cwd();

function readFile(filePath: string): string {
  return readFileSync(join(WORKSPACE, filePath), "utf-8");
}

describe("Task 103: Strategy pattern refactor", () => {
  it("should define a PricingStrategy interface", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/interface\s+PricingStrategy/);
  });

  it("should have a calculateDiscount method in the interface", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/calculateDiscount/);
  });

  it("should define RegularStrategy class", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/class\s+RegularStrategy/);
  });

  it("should define PremiumStrategy class", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/class\s+PremiumStrategy/);
  });

  it("should define WholesaleStrategy class", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/class\s+WholesaleStrategy/);
  });

  it("should not use a switch statement anymore", () => {
    const content = readFile("src/pricing.ts");
    expect(content).not.toMatch(/switch\s*\(/);
  });

  it("should still export calculateTotal function", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(
      /export.*function\s+calculateTotal|export.*calculateTotal/,
    );
  });

  it("should handle coupon codes", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/SAVE10/);
    expect(content).toMatch(/FLAT20/);
  });

  it("should preserve the Order interface", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/interface\s+Order/);
  });

  it("should export strategies", () => {
    const content = readFile("src/pricing.ts");
    expect(content).toMatch(/export.*(?:class|interface)\s+PricingStrategy/);
    expect(content).toMatch(/export.*class\s+RegularStrategy/);
  });
});
