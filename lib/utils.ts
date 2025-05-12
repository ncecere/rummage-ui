import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import JSZip from "jszip"
// No direct import for 'toast' here, components will use 'useToast' hook

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = (text: string, toastFn?: (options: any) => void) => {
  navigator.clipboard.writeText(text)
  if (toastFn) {
    toastFn({
      title: "Copied",
      description: "Content copied to clipboard",
    })
  } else {
    // Fallback if toast is not available or needed
    console.log("Content copied to clipboard");
  }
}

export const downloadFile = (content: string, filename: string, extension: string) => {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadAsZip = async (
  files: Array<{ content: string; filename: string; extension: string }>,
  toastFn?: (options: any) => void
) => {
  if (files.length === 0) {
    if (toastFn) {
      toastFn({
        title: "No Files",
        description: "There are no files to download.",
        variant: "destructive",
      })
    }
    return;
  }
  
  if (files.length === 1) {
    const file = files[0]
    downloadFile(file.content, file.filename, file.extension)
    return
  }

  const zip = new JSZip()
  files.forEach((file) => {
    zip.file(`${file.filename}.${file.extension}`, file.content)
  })
  
  const zipContent = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(zipContent)
  const a = document.createElement("a")
  a.href = url
  a.download = `rummage-export-${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  if (toastFn) {
    toastFn({
      title: "Download Started",
      description: `Downloading ${files.length} files as a zip archive`,
    })
  }
}
