export interface HandoverDateOption {
  day: string;
  date: string;
  val: string;
}

/**
 * Returns dynamic upcoming dates starting from today
 * so handover/meetup dates are never back-dated.
 */
export function getUpcomingHandoverDates(): HandoverDateOption[] {
  const options: HandoverDateOption[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[d.getDay()];
    const dateFormatted = `${d.getDate()} ${months[d.getMonth()]}`;
    options.push({
      day: dayName,
      date: dateFormatted,
      val: `${dayName} ${dateFormatted}`,
    });
  }
  return options;
}
