const http = require("http")
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..", "dist")
const port = Number(process.env.PORT || 5173)
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)

  if (pathname.startsWith("/api/") || pathname === "/api") {
    const proxy = http.request({
      hostname: "127.0.0.1",
      port: 8080,
      path: request.url,
      method: request.method,
      headers: { ...request.headers, host: "127.0.0.1:8080" },
    }, (backendResponse) => {
      response.writeHead(backendResponse.statusCode || 502, backendResponse.headers)
      backendResponse.pipe(response)
    })

    proxy.on("error", () => {
      response.writeHead(502, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ message: "The local backend is unavailable." }))
    })

    request.pipe(proxy)
    return
  }

  const relative = pathname.replace(/^\/+/, "")
  const requested = path.resolve(root, relative)
  const safePath = requested.startsWith(root) ? requested : root
  const file = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(root, "index.html")

  response.setHeader("Content-Type", types[path.extname(file).toLowerCase()] || "application/octet-stream")
  response.setHeader("Cache-Control", file.endsWith("index.html") ? "no-store" : "public, max-age=3600")
  fs.createReadStream(file)
    .on("error", () => {
      response.statusCode = 500
      response.end("Unable to serve the application.")
    })
    .pipe(response)
})

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`GeekOnSites ready at http://127.0.0.1:${port}\n`)
})
