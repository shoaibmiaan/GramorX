export type Holiday = {
  date: string; // ISO date string e.g. 2025-12-25
  name: string;
};

export const holidays: Holiday[] = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-17', name: "St. Patrick's Day" },
  { date: '2025-07-04', name: 'Independence Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
];

export function getHoliday(date: Date): Holiday | undefined {
  const key = date.toISOString().slice(0, 10);
  return holidays.find(h => h.date === key);
}
