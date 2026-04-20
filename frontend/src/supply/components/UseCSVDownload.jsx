import { useCallback } from 'react';

export function UseCSVDownload() {
  const downloadCSV = useCallback((data, filename = 'data.csv') => {
    if (!data || data.length === 0) {
        if (filename === 'rawdata.csv') {
            alert('No data has been justified yet!');
        }
        return;
    }
    
    const headers = Object.keys(data[0]);
    
    const csvRows = data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName] === null || row[fieldName] === undefined 
          ? '' 
          : String(row[fieldName]).replace(/"/g, '""');
        return `"${value}"`;
      }).join(',')
    );
    
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return downloadCSV;
}