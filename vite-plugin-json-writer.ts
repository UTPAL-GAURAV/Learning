import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export function jsonWriterPlugin(): Plugin {
  return {
    name: 'json-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/data', async (req, res, next) => {
        if (req.method !== 'POST') return next()

        const filename = req.url?.replace(/^\//, '') ?? ''
        if (!filename || filename.includes('..') || !filename.endsWith('.json')) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid filename' }))
          return
        }

        const dataDir = path.resolve(process.cwd(), 'data')
        const filePath = path.join(dataDir, filename)

        // only allow writes inside data/
        if (!filePath.startsWith(dataDir + path.sep)) {
          res.statusCode = 403
          res.end(JSON.stringify({ error: 'Forbidden' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body)
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Write failed' }))
          }
        })
      })

      // serve data files for reading
      server.middlewares.use('/data', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const filename = req.url?.split('?')[0] ?? ''
        const filePath = path.resolve(process.cwd(), 'data', filename.replace(/^\//, ''))
        if (fs.existsSync(filePath) && filePath.startsWith(path.resolve(process.cwd(), 'data'))) {
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(filePath, 'utf-8'))
        } else {
          next()
        }
      })
    },
  }
}
