const express = require('express');
const router = express.Router();
const infinitepay = require('../services/infinitepay');

router.post('/create', async (req, res) => {
  try {
    const { discordId, steamId, product } = req.body;

    if (!discordId || !steamId || !product) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const price = product === 'VIP' ? 1500 : 3000;

    const order_nsu = `${product}_${discordId}_${steamId}_${Date.now()}`;

    const data = await infinitepay.createCheckout({
      handle: process.env.INFINITEPAY_HANDLE,
      items: [{
        quantity: 1,
        price,
        description: `${product} Rust - 30 dias`
      }],
      order_nsu,
      redirect_url: 'https://simple-backend-wnh1.onrender.com/sucesso',
      webhook_url: 'https://simple-backend-wnh1.onrender.com/webhook/infinitepay'
    });

    res.json({
      checkout_url: data.url,
      order_nsu
    });

  } catch (err) {
    console.error('[CHECKOUT ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao criar checkout' });
  }
});

module.exports = router;
