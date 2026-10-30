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

/**
 * Format a 24-hour time string ("HH:MM") into a readable 12-hour format ("h:MM AM/PM").
 * E.g. "14:30" -> "2:30 PM", "09:05" -> "9:05 AM"
 */
export function formatTime24To12(time24: string): string {
  if (!time24) return '';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return time24;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

export interface PublicMeetupSpot {
  id: string;
  name: string;
  distanceText: string;
  popular: boolean;
}

/**
 * The 2 standard, highly practical community public meetup spots:
 * 1) A bustling, safe local cafe
 * 2) A neighborhood community public library
 */
export const DEFAULT_PUBLIC_MEETUP_SPOTS: PublicMeetupSpot[] = [
  {
    id: 'spot-1',
    name: 'Riverside Coffee, Rampura',
    distanceText: '0.4 km from you · 0.3 km from owner',
    popular: true,
  },
  {
    id: 'spot-2',
    name: 'Elm Park Library entrance',
    distanceText: '0.8 km from you · 0.6 km from owner',
    popular: false,
  },
];

