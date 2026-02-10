const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/infinitepay', async (req, res) => {
  try {
    const payload = req.body;

    // Sempre responder rápido
    res.sendStatus(200);

    if (payload.status !== 'PAID') {
      console.log('[WEBHOOK] Ignorado status:', payload.status);
      return;
    }

    const order_nsu = payload.order_nsu;

    console.log('[WEBHOOK] Pagamento aprovado:', order_nsu);

    await axios.post(process.env.BOT_CALLBACK_URL, {
      order_nsu,
      amount: payload.amount,
      status: payload.status
    });

  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
  }
});

module.exports = router;
