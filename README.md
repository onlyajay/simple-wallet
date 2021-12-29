# simple-wallet

## Installation

Simple-wallet requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and start the server.

```sh
cd simple-wallet
npm i
npm run start
```

## API Details

### Setup Wallet
```http
POST /setup
```
#### Body params
| Parameter | Type      | Description                      |
|:----------|:----------|:---------------------------------|
| `name`    | `string`  | **Required**. Wallet name        |
| `balance` | `integer` | **Required**. Wallet init amount |

#### Responses

```javascript
{
    "id": string,
    "name": string,
    "balance": integer,
    "date": ISO Date
}
```

---------

### Add transaction
```http
POST /transact/:walletId
```
#### Path params
| Parameter  | Type      | Description             |
|:-----------|:----------|:------------------------|
| `walletId` | `integer` | **Required**. Wallet id |

#### Body params
| Parameter     | Type      | Description                       |
|:--------------|:----------|:----------------------------------|
| `amount`      | `integer` | **Required**. Transaction amount  |
| `description` | `string`  | **Required**. Transaction details |

#### Responses

```javascript
{
    "balance": integer,
    "transactionId": string
}
```

----------

### Wallet transaction list
```http
GET /transactions
```
#### Query params
| Parameter  | Type      | Description                   |
|:-----------|:----------|:------------------------------|
| `walletId` | `string`  | **Required**. Wallet id       |
| `skip`     | `integer` | **Required**. Pagination skip |
| `limit`    | `integer` | **Required**. Page limit      |

#### Responses

```javascript
[

    {
        "id": string,
        "walletId": string,
        "amount": integer,
        "balance": integer,
        "description": string,
        "type": string,
        "date": ISO Date
    }
]
```

-----------------

### Wallet details
```http
GET /wallet/:id
```
#### Path params
| Parameter | Type      | Description                      |
|:----------|:----------|:---------------------------------|
| `id`      | `string`  | **Required**. Wallet id          |

#### Responses

```javascript
{
    "id": string,
    "name": string,
    "balance": integer,
    "date": ISO Date
}
```