
import { parseISO, isValid, startOfDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

/**
 * Normalizes a date string to UTC midnight (00:00:00Z)
 * @param dateString ISO date string
 * @param timezone Optional timezone (defaults to UTC)
 * @returns UTC midnight ISO date string
 */
export function normalizeToUtcMidnight(dateString: string, timezone: string = "UTC"): string {
  if (!dateString || !isValid(new Date(dateString))) {
    return dateString;
  }
  
  // Parse the date
  const date = parseISO(dateString);
  
  // Get the start of day in the specified timezone
  const localMidnight = startOfDay(date);
  
  // Convert to UTC
  const utcMidnight = zonedTimeToUtc(localMidnight, timezone);
  
  // Return as ISO string with time portion set to 00:00:00.000Z
  return utcMidnight.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

/**
 * Checks if a date string is properly normalized to UTC midnight
 * @param dateString ISO date string
 * @returns boolean
 */
export function isUtcMidnight(dateString: string): boolean {
  if (!dateString || !isValid(new Date(dateString))) {
    return false;
  }
  
  const date = new Date(dateString);
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0
  );
}

/**
 * Formats a date for display with the user's timezone offset
 * @param dateString ISO date string
 * @param timezone User's timezone
 * @returns formatted date string with timezone offset
 */
export function formatDateWithTimezone(dateString: string, timezone: string): string {
  if (!dateString || !isValid(new Date(dateString))) {
    return "N/A";
  }
  
  const date = parseISO(dateString);
  const formatted = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: timezone
  }).format(date);
  
  // Get timezone offset
  const timezoneOffset = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
  const offsetMinutes = Math.abs(timezoneOffset % 60);
  const offsetSign = timezoneOffset <= 0 ? '+' : '-';
  const offsetFormatted = 
    `${offsetSign}${offsetHours.toString().padStart(2, '0')}${offsetMinutes ? `:${offsetMinutes.toString().padStart(2, '0')}` : ''}`;
  
  return `${formatted} (${offsetFormatted})`;
}
