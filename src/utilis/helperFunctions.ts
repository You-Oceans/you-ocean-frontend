interface DateOptions {
  isTime?: boolean;
  now?: boolean;
}

export const formatDate = (dateInput?: string | boolean, options: DateOptions = {}): string => {
  const date = typeof dateInput === 'boolean' && dateInput 
    ? new Date()
    : typeof dateInput === 'string' 
      ? new Date(dateInput)
      : new Date();

  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();

  const formattedDate = `${weekday}, ${month} ${day}`;

  if (options.isTime) {
    const time = date.toLocaleString('en-US', { 
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    return `${formattedDate} ${time}`;
  }

  return formattedDate;
};
