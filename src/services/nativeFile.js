import { Capacitor } from "@capacitor/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"

export const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

// jsPDF's own `.save()` triggers a browser <a download> click, which the
// Android WebView cannot turn into a real file: there is no download
// manager backing it, so the "download" silently does nothing. On native
// Android we instead write the PDF into the app's cache directory and hand
// it to the OS share sheet, which lets the user save it to Files/Drive,
// open it in a PDF viewer, or send it directly - a real save/open/share
// flow instead of a dead link. Web keeps using pdf.save() unchanged.
export const saveAndSharePdf = async (pdf, fileName, { title = "GeekOnSites Invoice", text = "" } = {}) => {
  const base64 = pdf.output("datauristring").split(",")[1]
  const safeName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`

  const written = await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
  })

  try {
    await Share.share({ title, text, url: written.uri, dialogTitle: "Save or share invoice" })
    return { shared: true, uri: written.uri }
  } catch (error) {
    // The user cancelling the native share sheet throws too; the PDF is
    // still safely written to the cache directory in that case.
    if (error?.message && /cancel/i.test(error.message)) return { shared: false, cancelled: true, uri: written.uri }
    throw error
  }
}
