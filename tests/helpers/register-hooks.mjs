// Тести запускають pages/api/autopost.js напряму в Node: Next дозволяє імпорти без розширення ('../../lib/posts'),
// чистий Node ESM — ні. Цей хук лише додає «.js» до відносних специфікаторів без розширення. Нічого більше не змінює.
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (e) {
      if (e && e.code === 'ERR_MODULE_NOT_FOUND' && /^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw e
    }
  },
})
