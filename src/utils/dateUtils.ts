
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const formatLocalDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy");
};

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = parseISO(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return formatLocalDate(dateString);
  }
};

export const formatDateWithTimezone = (dateString: string): {
  localFormatted: string;
  utcFormatted: string;
} => {
  if (!dateString) return { localFormatted: "", utcFormatted: "" };
  
  const date = parseISO(dateString);
  const localFormatted = format(date, "dd MMM yyyy");
  const utcFormatted = formatInTimeZone(date, 'UTC', "yyyy-MM-dd HH:mm'Z'");
  
  return { localFormatted, utcFormatted };
};

export const getUserTimezoneOffset = (): string => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset < 0 ? "+" : "-";
  
  return `(UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")})`;
};
