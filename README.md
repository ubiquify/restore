# Simple block store for local network

REST API for storing and retrieving blocks of data. The blocks are stored locally in a `lmdb` database.

## Usage

```sh
npm start
```

## SSL

The relay expects two files in the `ssl` folder:

- `server.key` - Private key.
- `server.crt` - Certificate.

A self signed certificate can be generated in linux with `openssl`:

```sh
cd ssl/
openssl req -nodes -new -x509 -keyout server.key -out server.crt
```

## Build

```sh
npm run clean
npm install
npm run build
npm run test
```

## Licenses

Licensed under either [Apache 2.0](http://opensource.org/licenses/MIT) or [MIT](http://opensource.org/licenses/MIT) at your option.
