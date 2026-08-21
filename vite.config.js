import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { copyFile, mkdir, readdir, stat } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"
import process from "node:process"

const supportedImages = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"])
const downloadedImages = process.env.GOS_ASSET_SOURCE || path.join(homedir(), "Downloads", "geek-on-sites-frontend", "public", "images")
const activeImages = path.resolve("public", "images")

async function copyNewerImages(sourceDir = downloadedImages, relativeDir = "") {
  let entries
  try {
    entries = await readdir(path.join(sourceDir, relativeDir), { withFileTypes: true })
  } catch {
    return
  }

  await Promise.all(entries.map(async (entry) => {
    const relativePath = path.join(relativeDir, entry.name)
    if (entry.isDirectory()) return copyNewerImages(sourceDir, relativePath)
    if (!supportedImages.has(path.extname(entry.name).toLowerCase())) return

    const source = path.join(sourceDir, relativePath)
    const destination = path.join(activeImages, relativePath)
    const sourceStat = await stat(source)
    let destinationStat
    try { destinationStat = await stat(destination) } catch { destinationStat = null }
    if (destinationStat && destinationStat.mtimeMs >= sourceStat.mtimeMs && destinationStat.size === sourceStat.size) return

    await mkdir(path.dirname(destination), { recursive: true })
    await copyFile(source, destination)
  }))
}

function syncDownloadedImages() {
  return {
    name: "gos-sync-downloaded-images",
    async buildStart() {
      await copyNewerImages()
    },
    configureServer(server) {
      copyNewerImages()
      server.watcher.add(downloadedImages)
      server.watcher.on("all", async (event, changedPath) => {
        if (event !== "add" && event !== "change") return
        const relativePath = path.relative(downloadedImages, changedPath)
        if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !supportedImages.has(path.extname(relativePath).toLowerCase())) return

        const destination = path.join(activeImages, relativePath)
        await mkdir(path.dirname(destination), { recursive: true })
        await copyFile(changedPath, destination)
        server.ws.send({ type: "full-reload" })
      })
    },
  }
}

function productionRouterFallback() {
  return {
    name: "gos-production-router-fallback",
    apply: "build",
    transform(code, id) {
      if (!/[\\/]node_modules[\\/]react-router[\\/]/.test(id) || !code.includes("http://localhost")) return null
      return code.replaceAll("http://localhost", "https://geekonsites.com")
    },
  }
}

export default defineConfig({
  plugins: [syncDownloadedImages(), productionRouterFallback(), react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
})
