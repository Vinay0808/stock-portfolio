const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const bodyParser = require('body-parser');

const ExcelJS = require('exceljs');



const app = express();

const PORT = process.env.PORT || 5000;



app.use(cors());

app.use(bodyParser.json());



mongoose.connect('mongodb://localhost:27017/stockDB', { useNewUrlParser: true, useUnifiedTopology: true });



const stockSchema = new mongoose.Schema({
   date: String,
   stockName: String,
   price: Number,
   charges: Number,
   quantity: Number,
   type: {
     type: String,
     enum: ['Buy', 'Sell'],
     required: true
   }
 });
 



const Stock = mongoose.model('Stock', stockSchema);



app.post('/api/stocks', async (req, res) => {

   const stock = new Stock(req.body);

   await stock.save();

   res.send(stock);

});



app.get('/api/stocks', async (req, res) => {

   const stocks = await Stock.find();

   res.send(stocks);

});



app.put('/api/stocks/:id', async (req, res) => {

   const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });

   res.send(stock);

});



app.delete('/api/stocks/:id', async (req, res) => {

   await Stock.findByIdAndDelete(req.params.id);

   res.send({ message: 'Stock deleted' });

});



app.get('/api/download', async (req, res) => {

   const stocks = await Stock.find();

   const workbook = new ExcelJS.Workbook();

   const worksheet = workbook.addWorksheet('Stocks');



   worksheet.columns = [

       { header: 'Date', key: 'date' },

       { header: 'Stock Name', key: 'stockName' },

       { header: 'Price', key: 'price' },

       { header: 'Charges', key: 'charges' },

       { header: 'Quantity', key: 'quantity' },

       { header: 'Type', key: 'type' }

   ];



   stocks.forEach(stock => {

       worksheet.addRow(stock);

   });



   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

   res.setHeader('Content-Disposition', 'attachment; filename=stocks.xlsx');

   await workbook.xlsx.write(res);

   res.end();

});



app.listen(PORT, () => {

   console.log(`Server is running on port ${PORT}`);

});










