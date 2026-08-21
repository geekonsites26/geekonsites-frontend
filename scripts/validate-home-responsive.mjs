import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const defaultViewports = [
  [320, 720],
  [360, 800],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
  [768, 1024],
  [1024, 900],
  [1280, 960],
  [1440, 1100],
  [1920, 1200],
]
const requestedWidths = (process.env.GOS_WIDTHS || "").split(",").map(Number).filter(Boolean)
const viewports = requestedWidths.length
  ? requestedWidths.map((width) => [width, width <= 320 ? 720 : width <= 360 ? 800 : 932])
  : defaultViewports

const browserCandidates = process.platform === "win32"
  ? [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ]
  : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]

const browserPath = process.env.CHROME_PATH || browserCandidates.find(existsSync)
if (!browserPath) throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium browser executable.")

const port = 9300 + Math.floor(Math.random() * 500)
const profile = await mkdtemp(join(tmpdir(), "gos-responsive-"))
const browser = spawn(browserPath, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let target
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json())
    target = targets.find((item) => item.type === "page")
    if (target) break
  } catch {}
  await sleep(100)
}

if (!target) {
  browser.kill()
  throw new Error("Unable to connect to the headless browser.")
}

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})

let commandId = 0
const pending = new Map()
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})

await send("Page.enable")
await send("Runtime.enable")

let failed = false
for (const [width, height] of viewports) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 })
  await send("Page.navigate", { url: process.env.GOS_URL || "http://127.0.0.1:5173/" })
  for (let attempt = 0; attempt < 70; attempt += 1) {
    await sleep(100)
    const settled = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: "document.readyState === 'complete' && !document.querySelector('[aria-label=\"GeekOnSites is starting\"]')",
    })
    if (settled.result.value) break
  }
  await sleep(Number(process.env.GOS_SETTLE_MS || 1800))
  const response = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const fixed = [...document.querySelectorAll('*')].filter((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        const intentionalOverlay = element.matches('[aria-label="GeekOnSites is starting"], [role="dialog"]')
        return !intentionalOverlay && style.position === 'fixed' && style.visibility !== 'hidden' && style.display !== 'none' && rect.width && rect.height
      }).map((element) => ({ tag: element.tagName, label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 30) || '', rect: element.getBoundingClientRect().toJSON() }))
      const collisions = fixed.flatMap((first, index) => fixed.slice(index + 1).filter((second) => {
        const a = first.rect; const b = second.rect
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      }).map((second) => [first.label, second.label]))
      return {
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        collisions,
      }
    })()`,
  })
  const result = response.result.value
  const pass = !result.overflow && result.collisions.length === 0
  failed ||= !pass
  console.log(`${pass ? "PASS" : "FAIL"} ${width}x${height} | scroll ${result.scrollWidth}/${result.innerWidth} | fixed collisions ${result.collisions.length}`)
  if (!pass && result.collisions.length) console.log(result.collisions)
  if (process.env.GOS_SCREENSHOT_DIR && (width === 360 || width === 412)) {
    await mkdir(process.env.GOS_SCREENSHOT_DIR, { recursive: true })
    const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })
    await writeFile(join(process.env.GOS_SCREENSHOT_DIR, `home-${width}x${height}.png`), Buffer.from(screenshot.data, "base64"))
  }
}

socket.close()
browser.kill()
if (failed) process.exitCode = 1
