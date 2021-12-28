const express = require('express');
const router = express.Router();
const wallet = require('../modules/wallet');

router.get('/wallet/:id', function(req, res, next) {
  wallet.getWallet(req, res, next);
});

router.get('/transactions', function(req, res, next) {
  wallet.getTransactions(req, res, next);
});

router.post('/setup', function(req, res, next) {
  wallet.setup(req, res, next);
});

router.post('/transact/:walletId', function(req, res, next) {
  wallet.transact(req, res, next);
});

module.exports = router;
