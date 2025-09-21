/**
 * Get the ISO week number for a given date
 * @param date - The date to get the ISO week number for
 * @returns The ISO week number
 */
export const getISOWeek = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/**
 * Get the default date for week selection
 * @returns Default date set to July 1, 2024
 */
export const getDefaultWeekDate = (): Date => {
  return new Date(2024, 6, 1);
};
