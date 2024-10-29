// app/src/services/utils.ts

/**
 * 予約の日時を取得する（日付部分のみ）
 * @param date Date オブジェクト
 * @returns 表示用のフォーマットされた日付
 */
export const getDate = (date: Date): string => {
  return date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  //.replace(/\//g, "-");
};

/**
 * 予約の時刻を取得する（時刻部分のみ）
 * @param date Date オブジェクト
 * @returns 表示用のフォーマットされた時刻
 */
export const getHour = (date: Date): string => {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
