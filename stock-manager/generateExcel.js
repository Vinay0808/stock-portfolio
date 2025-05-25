// generateExcel.js
const ExcelJS = require('exceljs');
const Stock = require('./models/Stock');
const path = require('path');

const generateExcel = async () => {
  const stocks = await Stock.find();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stocks');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Stock Name', key: 'stockName', width: 20 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Charges', key: 'charges', width: 10 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Type', key: 'type', width: 10 }
  ];

  stocks.forEach(stock => {
    worksheet.addRow({
      date: stock.date,
      stockName: stock.stockName,
      price: stock.price,
      charges: stock.charges,
      quantity: stock.quantity,
      type: stock.type
    });
  });

  const filePath = path.join(__dirname, 'exports', 'stocks.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Excel file saved to', filePath);
};

module.exports = generateExcel;
