import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import localeData from "dayjs/plugin/localeData.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/uk.js";
import "dayjs/locale/en.js";

dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

export type { Dayjs };

const WEEK_ID_PATTERN = /^\d{4}-W\d{2}$/;

const pad2 = (value: number): string => String(value).padStart(2, "0");

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const isoWeeksInYear = (year: number): number =>
  dayjs(`${year}-12-28`).isoWeek();

export const weekIdFromDate = (date: Date | Dayjs): string => {
  const d = dayjs(date);
  return `${d.isoWeekYear()}-W${pad2(d.isoWeek())}`;
};

export const currentWeekId = (): string => weekIdFromDate(dayjs());

export const isValidWeekId = (value: string): boolean => {
  if (!WEEK_ID_PATTERN.test(value)) return false;
  const week = Number(value.slice(6));
  return week >= 1 && week <= isoWeeksInYear(Number(value.slice(0, 4)));
};

export const mondayOf = (weekId: string): Dayjs => {
  const year = Number(weekId.slice(0, 4));
  const week = Number(weekId.slice(6));
  return dayjs(`${year}-01-04`)
    .startOf("isoWeek")
    .add(week - 1, "week");
};

export const addWeeks = (weekId: string, count: number): string =>
  weekIdFromDate(mondayOf(weekId).add(count, "week"));

export const daysOfWeek = (weekId: string): Dayjs[] => {
  const monday = mondayOf(weekId);
  return Array.from({ length: 7 }, (_, index) => monday.add(index, "day"));
};

export const monthIdOf = (date: Date | Dayjs): string =>
  dayjs(date).format("YYYY-MM");

export const currentMonthId = (): string => monthIdOf(dayjs());

export const weekTitle = (weekId: string): string =>
  `${capitalize(mondayOf(weekId).format("MMMM YYYY"))} · ${weekId.slice(5)}`;

export const dayLabel = (day: Dayjs): string =>
  `${capitalize(day.format("dd"))} ${day.format("D.MM")}`;

export interface WeekDay {
  iso: number;
  label: string;
  initial: string;
  isToday: boolean;
}

export const weekDays = (weekId: string, locale: string): WeekDay[] => {
  const today = dayjs();
  return daysOfWeek(weekId).map((day) => {
    const localized = day.locale(locale);
    const short = capitalize(localized.format("dd"));
    return {
      iso: day.isoWeekday(),
      label: `${short} ${localized.format("D.MM")}`,
      initial: short.charAt(0),
      isToday: day.isSame(today, "day"),
    };
  });
};

export const initialDayIndex = (weekId: string): number => {
  const today = dayjs();
  const index = daysOfWeek(weekId).findIndex((day) => day.isSame(today, "day"));
  return index >= 0 ? index : 0;
};

export const setTimeLocale = (locale: string): void => {
  dayjs.locale(locale);
};
