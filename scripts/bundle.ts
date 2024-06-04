#!/bin/env bun
import { $ } from "bun"

await $`mkdir -p ./dist/src`
await $`mkdir -p ./dist/tests`
await $`mkdir -p ./dist/examples`
await $`mkdir -p ./dist/benchmarks`
await $`mkdir -p ./dist/bundle`

try {
  const t = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist/src/',
    external: ["tjs:*"],
    target: "bun",
    minify: {
      whitespace: true,
      identifiers: false,
      syntax: true,
    },
    /*plugins: [
      dts()
    ],*/
  })
}
catch (e) { console.error(e) }

await $`./node_modules/.bin/dts-bundle-generator -o ./dist/bundle/[module].d.ts ./src/index.ts --no-check --export-referenced-types=false`

const old = await Bun.file("./dist/bundle/[module].d.ts").text()
await Bun.write("./dist/bundle/[module].d.ts", `
/**
 * Typebox Txiki module interface
 *
 * @module tjs:__MODULE__
 */
declare module 'tjs:__MODULE__' {
  ${old.replaceAll('declare', '')}
}

`)

await Bun.write("./dist/src/module.c", `#include "module.h"
#include "../../utils.h"

void tjs__mod___MODULE___init(JSContext *ctx, JSValue ns) {
}`)
await Bun.write("./dist/src/module.h", `#pragma once

#include "../../private.h"
#include "../../utils.h"

#ifdef __cplusplus
extern "C" {
#endif
void tjs__mod___MODULE___init(JSContext *ctx, JSValue ns);
#ifdef __cplusplus
}
#endif`)
await $`mv ./dist/src/index.js ./dist/bundle/[module].js`
await $`cp ./license ./dist/LICENCE`

