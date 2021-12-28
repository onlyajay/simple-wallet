const randomId = require('random-id');
function Wallet() {
    function getWalletById(conn, id) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM WALLETS WHERE ID = ?`, [id], function(err, result) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    this.getWallet = function(req,res,next) {
        try {
            req.getConnection(async function (err, conn) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    return next(err);
                } else {
                    const result = await getWalletById(conn, req.params.id);
                    if (result.length >= 1) {
                        res.status(200).send(result[0]);
                    } else {
                        res.status(200).send("Wallet not found");
                    }
                }
            });
        } catch (ex) {
            console.error("Internal error:" + ex);
            return next(ex);
        }
    }

    this.getTransactions = function(req,res,next) {
        try {
            req.getConnection(function(err, conn) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    return next(err);
                } else {
                    let skip = 0;
                    if (req.query && req.query.skip) {
                        skip = parseInt(req.query.skip);
                    }
                    let limit = 10;
                    if (req.query && req.query.limit) {
                        limit = parseInt(req.query.limit);
                    }
                    conn.query("SELECT * FROM TRANSACTIONS WHERE WALLETID = ? ORDER BY DATE DESC LIMIT ?, ?", [req.query.walletId, skip, limit], function(err, result) {
                        if (err) {
                            console.error('SQL error: ', err);
                            return next(err);
                        }
                        if (result.length >= 1) {
                            res.send(result);
                        } else {
                            res.send("Transaction not found");
                        }
                    });
                }
            });
        } catch (ex) {
            console.error("Internal error:" + ex);
            return next(ex);
        }
    };

    function isWalletExists(conn, next, name) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM WALLETS WHERE NAME = ?`, [name], (err, result) => {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    reject(err);
                } else {
                    resolve(!!result.length);
                }
            })
        });
    }

    async function insertTransaction(conn, transactionObj) {
        return new Promise((resolve, reject) => {
            transactionObj["id"] = randomId(8, "0");
            conn.query(`INSERT INTO TRANSACTIONS SET ?`, transactionObj, function(err, result) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    reject(err);
                } else {
                    resolve(transactionObj["id"]);
                }
            })
        });
    }

    this.setup = function(req,res,next) {
        try {
            req.getConnection(async function (err, conn) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    return next(err);
                } else {
                    const {name, balance} = req.body;
                    const isWalletExist = await isWalletExists(conn, next, name)
                    if (!isWalletExist) {
                        const walletId = randomId(6, "0");
                        const insertValues = {
                            "id" : walletId,
                            "name" : name,
                            "balance" : balance,
                        };

                        conn.query("INSERT INTO WALLETS SET ?", insertValues, async function (err, result) {
                            if (err) {
                                console.error('SQL error: ', err);
                                return next(err);
                            }
                            if (result.affectedRows >= 1) {
                                const transactionObj = {
                                    walletId,
                                    amount: balance,
                                    balance,
                                    description: "Setup",
                                    type: "CREDIT"
                                }
                                await insertTransaction(conn, transactionObj);
                                const walletResult = await getWalletById(conn, walletId);
                                res.send(walletResult[0]);
                            } else {
                                res.send('Insert failed');
                            }
                        });
                    } else {
                        res.send("Wallet already exists");
                    }
                }
            });
        } catch (ex) {
            console.error("Internal error:" + ex);
            return next(ex);
        }
    };

    async function updateWallet(conn, walletId, balance) {
        return new Promise((resolve, reject) => {
            conn.query(`UPDATE WALLETS SET BALANCE = ? WHERE ID = ?`, [balance, walletId], function(err, result) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    this.transact = function(req,res,next) {
        try {
            req.getConnection(async function (err, conn) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    return next(err);
                } else {
                    const walletId = req.params.walletId;
                    const { amount, description } = req.body;

                    const walletDetails = await getWalletById(conn, walletId);
                    if (walletDetails.length > 0) {
                        const wallet = walletDetails[0];
                        const balance = wallet["balance"] + amount;
                        const transactionObj = {
                            walletId,
                            amount,
                            balance,
                            description,
                            type: amount > 0 ? "CREDIT" : "DEBIT"
                        }
                        const transactionId = await insertTransaction(conn, transactionObj);
                        await updateWallet(conn, walletId, balance);
                        res.send({balance, transactionId});
                    } else {
                        res.send("Wallet does not exists");
                    }
                }
            });
        } catch (ex) {
            console.error("Internal error:" + ex);
            return next(ex);
        }
    }
}

module.exports = new Wallet();