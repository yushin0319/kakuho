// src/services/utils.test.ts
import { NumComma, addTime } from "./utils";

describe("NumComma", () => {
  it("数値をカンマ区切りにする", () => {
    expect(NumComma(1000)).toBe("1,000");
  });

  it("大きい数値をカンマ区切りにする", () => {
    expect(NumComma(1234567890)).toBe("1,234,567,890");
  });

  it("0を正しく処理する", () => {
    expect(NumComma(0)).toBe("0");
  });

  it("負の数を正しく処理する", () => {
    expect(NumComma(-1000)).toBe("-1,000");
  });

  it("小数を正しく処理する", () => {
    expect(NumComma(1234.56)).toBe("1,234.56");
  });
});

describe("addTime", () => {
  it("日を追加する", () => {
    const date = new Date(2025, 0, 1, 0, 0, 0);
    const result = addTime(date, { days: 5 });
    expect(result.getDate()).toBe(6);
  });

  it("月を追加する", () => {
    const date = new Date(2025, 0, 15, 0, 0, 0);
    const result = addTime(date, { months: 2 });
    expect(result.getMonth()).toBe(2); // 3月(0-indexed)
  });

  it("年を追加する", () => {
    const date = new Date(2025, 0, 1, 0, 0, 0);
    const result = addTime(date, { years: 1 });
    expect(result.getFullYear()).toBe(2026);
  });

  it("時間を追加する", () => {
    const date = new Date(2025, 0, 1, 10, 0, 0);
    const result = addTime(date, { hours: 5 });
    expect(result.getHours()).toBe(15);
  });

  it("複数の値を同時に追加する", () => {
    const date = new Date(2025, 0, 1, 0, 0, 0);
    const result = addTime(date, { years: 1, months: 1, days: 1, hours: 1 });
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
    expect(result.getHours()).toBe(1);
  });

  it("引数なしで時間部分のみ保持して返す", () => {
    // 注意: addTimeは分・秒を考慮しないため、時刻部分のみテスト
    const date = new Date(2025, 5, 15, 12, 0, 0);
    const result = addTime(date, {});
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(12);
  });
});
