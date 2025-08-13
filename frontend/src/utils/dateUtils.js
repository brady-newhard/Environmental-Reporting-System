/**
 * Format a date value to MM/DD/YYYY format
 * @param {string|Date} value - The date value to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (value) => {
  if (!value) return '—';
  
  // If it's already in MM/DD/YYYY format, return as is
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    return value;
  }
  
  // If it's in YYYY-MM-DD format, convert it
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  }
  
  // Try to parse as Date object
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

/**
 * Format a date value to include time
 * @param {string|Date} value - The date value to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (value) => {
  if (!value) return '—';
  
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  
  const date = formatDate(d);
  const time = d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${date} ${time}`;
};
