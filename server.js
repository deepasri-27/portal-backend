const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import all route modules
const loginRouter = require('./services/login');
// const profileRouter = require('./services/profile');
 const goodsRouter = require('./services/goods');
const memoRouter = require('./services/memo');
 const purchaseRouter = require('./services/purchase');
const agingRouter = require('./services/aging');
const rfqRouter = require('./services/rfq');
const invoiceRoutes = require('./services/invoice');
// const invoicePdfRoute = require('./services/invoicePdf');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Mount all routes with /api prefix
app.use('/api', loginRouter);
// app.use('/api', profileRouter);
 app.use('/api', goodsRouter);
 app.use('/api', memoRouter);
 app.use('/api', purchaseRouter);
app.use('/api', agingRouter);
app.use('/api', rfqRouter);
app.use('/api', invoiceRoutes);
// app.use('/api', invoicePdfRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
