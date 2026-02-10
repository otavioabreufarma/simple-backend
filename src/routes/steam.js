const express = require('express');
const { RelyingParty } = require('openid');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

/**
 * stateId -> { discordId, createdAt }
 */
const pendingStates = new Map();

/**
 * ⚠️ OBS:
 * O return_to BASE será ajustado dinamicamente
 */
const relyingParty = new RelyingParty(
  null,
  null,
  true,
  true,
  []
);

/**
 * 1️⃣ Inicia login Steam
 * GET /steam/auth?discordId=123
 */
router.get('/auth', (req, res) => {
  const { discordId } = req.query;

  if (!discordId) {
    return res.status(400).send('discordId ausente');
  }

  const stateId = crypto.randomUUID();

  pendingStates.set(stateId, {
    discordId,
    createdAt: Date.now()
  });

  // 🔥 STATE NO PATH (ÚNICA FORMA QUE O STEAM DEVOLVE)
  const returnTo = `${process.env.BACKEND_BASE_URL}/steam/return/${stateId}`;

  const rp = new RelyingParty(
    returnTo,
    null,
    true,
    true,
    []
  );

  rp.authenticate(
    'https://steamcommunity.com/openid',
    false,
    (err, authUrl) => {
      if (err || !authUrl) {
        console.error('[STEAM AUTH ERROR]', err);
        return res.status(500).send('Erro ao iniciar autenticação Steam');
      }

      res.redirect(authUrl);
    }
  );
});

/**
 * 2️⃣ Retorno da Steam
 * GET /steam/return/:stateId
 */
router.get('/return/:stateId', (req, res) => {
  const { stateId } = req.params;

  const state = pendingStates.get(stateId);
  if (!state) {
    return res.send('Sessão expirada, tente novamente');
  }

  const rp = new RelyingParty(
    `${process.env.BACKEND_BASE_URL}/steam/return/${stateId}`,
    null,
    true,
    true,
    []
  );

  rp.verifyAssertion(req, async (err, result) => {
    if (err || !result?.authenticated) {
      console.error('[STEAM VERIFY ERROR]', err);
      return res.send('Falha na autenticação Steam');
    }

    const steamId = result.claimedIdentifier?.match(/\d+$/)?.[0];

    if (!steamId) {
      return res.send('SteamID inválido');
    }

    // one-time use
    pendingStates.delete(stateId);

    try {
      await axios.post(process.env.BOT_STEAM_CALLBACK_URL, {
        discordId: state.discordId,
        steamId
      });

      res.send(`
        <h2>✅ Steam vinculada com sucesso</h2>
        <p>Você já pode voltar ao Discord.</p>
      `);
    } catch (e) {
      console.error('[BOT CALLBACK ERROR]', e.message);
      res.send('Erro ao notificar o bot');
    }
  });
});

module.exports = router;
