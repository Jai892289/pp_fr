/**
 * Formats a date string into a localized date format
 * @param dateString - The date string to format (e.g., '2023-01-01')
 * @returns Formatted date string (e.g., 'Jan 1, 2023')
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return '-';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
