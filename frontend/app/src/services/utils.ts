// app/src/services/utils.ts
import { format } from "date-fns-tz";

/**
 * JSTの日時を取得し、フォーマットする
 * @param date 日時
 * @param formatType フォーマットの種類
 * @returns 表示用のフォーマットされた日時
 */

type FormatType = "fullDate" | "monthDate" | "time" | "dateTime" | "ISO8601";

export const toJST = (
  date: Date | string | undefined | null,
  formatType: FormatType
): string => {
  if (!date) return "";
  //const jstDate = toZonedTime(new Date(date), "Asia/Tokyo");
  const jstDate = new Date(date);
  const formats = {
    fullDate: "yyyy/M/d (E)",
    monthDate: "M/d (E)",
    time: "HH:mm",
    dateTime: "M/d (E) HH:mm",
    ISO8601: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  };
  const dayOfWeekMap = {
    Sun: "日",
    Mon: "月",
    Tue: "火",
    Wed: "水",
    Thu: "木",
    Fri: "金",
    Sat: "土",
  };
  const formatted = format(jstDate, formats[formatType]);
  return formatted.replace(
    /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/,
    (matched) => dayOfWeekMap[matched as keyof typeof dayOfWeekMap]
  );
};

/**
 * 日本時間に変換する
 * @param date 日時
 * @returns 日本時間の日時
 */

export const toJSTDate = (date: Date | string): Date => {
  //return toZonedTime(new Date(date), "Asia/Tokyo");
  return new Date(date);
};

/**
 * 時間を追加する
 * @param date 日時
 * @param years 年
 * @param months 月
 * @param days 日
 * @param hours 時間
 * @returns 時間を追加した日時
 */

export const addTime = (
  date: Date,
  { years = 0, months = 0, days = 0, hours = 0 }
): Date => {
  return new Date(
    date.getFullYear() + years,
    date.getMonth() + months,
    date.getDate() + days,
    date.getHours() + hours
  );
};

export const NumComma = (num: number): string => {
  return new Intl.NumberFormat("ja-JP").format(num);
};
