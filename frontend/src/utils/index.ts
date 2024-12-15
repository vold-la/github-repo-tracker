export const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
  
    try {
      const timestamp = parseInt(dateString);
      const date = isNaN(timestamp) ? new Date(dateString) : new Date(timestamp);
  
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
  
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });
  
      return formatter.format(date);
    } catch {
      return 'Not available';
    }
  };
  