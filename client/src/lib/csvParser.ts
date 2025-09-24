export function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = [
    'item_id', 'item_name', 'manufacturer_id', 'manufacturer_name',
    'city_id', 'city_name', 'category', 'date', 'qty_sold', 'mrp'
  ];

  // Validate headers
  const hasAllRequiredHeaders = expectedHeaders.every(header => 
    headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
  );

  if (!hasAllRequiredHeaders) {
    throw new Error(`CSV file must contain the required columns: ${expectedHeaders.join(', ')}`);
  }

  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length !== headers.length) {
      console.warn(`Skipping malformed row ${i + 1}`);
      continue;
    }

    try {
      const record = {
        item_id: parseInt(values[0]) || 0,
        item_name: values[1] || '',
        manufacturer_id: parseInt(values[2]) || 0,
        manufacturer_name: values[3] || '',
        city_id: parseInt(values[4]) || 0,
        city_name: values[5] || '',
        category: values[6] || '',
        date: values[7] || '',
        qty_sold: parseInt(values[8]) || 0,
        mrp: parseFloat(values[9]) || 0,
      };

      records.push(record);
    } catch (error) {
      console.warn(`Skipping invalid row ${i + 1}:`, error);
    }
  }

  return records;
}

export function validateCSVStructure(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // If it's an Excel file, allow it. We'll validate on the server.
    if (/\.xlsx$|\.xls$/i.test(file.name)) {
      resolve(true);
      return;
    }
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.trim().split('\n');
        
        if (lines.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const expectedCount = 10; // Expected number of columns
        
        if (headers.length !== expectedCount) {
          reject(new Error(`Expected ${expectedCount} columns, found ${headers.length}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file.slice(0, 1024)); // Read first 1KB to check structure
  });
}
