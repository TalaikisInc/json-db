# Local JSON Database

This is simple, fast, small (12.5 KB), no dependencies, local disk, table-level Node.js JSON database, which we often use in large development workloads.

## Install

```bash
npm i -S @talaikis/json-db
```

## Fucntions

All functions need `baseDir`, where the database is stored. For example: `join(__dirname, '.data')`.

### Create item in a table

```js
import { create } from '@talaikis/json-db'
await create(baseDir, table, itemName, jsonData).catch((e) => ...)
```

### Read item from the table

```js
import { read } from '@talaikis/json-db'
const jsonData = await read(baseDir, table, itemName).catch((e) => ...)
```

### Update the item in a table

```js
import { update } from '@talaikis/json-db'
await update(baseDir, table, itemName, newJsonData).catch((e) => ...)
```

### Delete item from the table

```js
import { destroy } from '@talaikis/json-db'
await destroy(baseDir, table, itemName).catch((e) => ...)
```

### List table items

```js
import { list } from '@talaikis/json-db'
await list(baseDir, table).catch((e) => ...)
```

### Delete table

```js
import { destroyTable } from '@talaikis/json-db'
await destroyTable(baseDir, table).catch((e) => ...)
```

## Test

```bash
npm run test
```

## Licence

MIT
