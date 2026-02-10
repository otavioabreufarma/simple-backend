const express = require('express');

const app = express();

// ⚠️ NÃO usar body-parser que bloqueia webhook
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/checkout', require('./routes/checkout'));
app.use('/webhook', require('./routes/webhook'));
app.use('/steam', require('./routes/steam'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[BACKEND] Online na porta ${PORT}`);
});
