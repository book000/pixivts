# pixivts

[pixiv](https://www.pixiv.net/) Unofficial API Library for TypeScript

[![Node CI](https://github.com/book000/pixivts/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/book000/pixivts/actions/workflows/nodejs-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is NOT a fork of [@ibaraki-douji/pixivts](https://www.npmjs.com/package/@ibaraki-douji/pixivts). However, it is used as a reference.

## Packages

| Package | Description |
|---|---|
| [`@book000/pixivts`](packages/core) | Core API client — zero runtime dependencies, Result-typed, ESM + CJS |
| [`@book000/pixivts-db-mysql`](packages/db-mysql) | Optional MySQL recorder using Drizzle ORM |

## Quick Start

```shell
npm install @book000/pixivts
```

```typescript
import { PixivClient } from '@book000/pixivts'

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!)

const result = await client.illusts.detail({ illustId: 12345 })
if (result.isOk) {
  console.log(result.value.illust.title)
}

// Iterate over all pages
for await (const page of client.illusts.search({ word: 'hatsune miku' }).pages()) {
  for (const illust of page.illusts) {
    console.log(illust.id, illust.title)
  }
}
```

## Migration from v1

If you are migrating from the previous version of `@book000/pixivts`, see [MIGRATION.md](MIGRATION.md).

## API Documentation

Full API reference: <https://book000.github.io/pixivts/>

## License

[MIT](LICENSE)
