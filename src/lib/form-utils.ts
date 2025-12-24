/**
 * Format Date object to datetime-local input format (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeLocal(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert datetime-local input value to ISO string
 */
export function dateTimeLocalToISO(dateTimeLocal: string): string {
  return new Date(dateTimeLocal).toISOString();
}