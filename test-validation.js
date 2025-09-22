// Quick test to validate our CSV parsing logic
const testRecord = {
  item_id: 10167070,
  item_name: 'Kettle Studio Tabasco Sauce Flavour Potato Chips',
  manufacturer_id: 66,
  manufacturer_name: 'Indo Nissin',
  city_id: 334,
  city_name: 'Bhavnagar',
  category: 'Organic & Premium',
  date: '9/10/2025',
  qty_sold: 1,
  mrp: '99', // Testing as string
};

console.log('Test record:', testRecord);

// Test CSV parsing line by line
const csvLine = '10167070,Kettle Studio Tabasco Sauce Flavour Potato Chips,66,Indo Nissin,334,Bhavnagar,Organic & Premium,9/10/2025,1,99';
const values = csvLine.split(',').map(v => v.trim().replace(/"/g, ''));
console.log('Parsed values:', values);

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
  mrp: String(parseFloat(values[9]) || 0),
};

console.log('Final record:', record);