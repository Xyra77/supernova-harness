#!/usr/bin/env node

import { Context } from '@supernova-ai/cordis'
import { pathToFileURL } from 'node:url'
import Loader from '@supernova-ai/cordis-plugin-loader'

const ctx = new Context()
ctx.baseUrl = pathToFileURL(process.cwd()).href + '/'

await ctx.plugin(Loader)
await ctx.loader.create({
  name: '@supernova-ai/cordis-plugin-include',
  config: {
    path: './cordis.yml',
  },
})
