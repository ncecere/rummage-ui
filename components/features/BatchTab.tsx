"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown, Loader2, Download, Copy, Globe, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { copyToClipboard, downloadFile, downloadAsZip } from "@/lib/utils"

export default function BatchTab() {
  const [batchUrls, setBatchUrls] = useState("")
  const [isLoadingBatch, setIsLoadingBatch] = useState(false)
  const [batchJobId, setBatchJobId] = useState("")
  const [batchStatus, setBatchStatus] = useState("")
  const [batchProgress, setBatchProgress] = useState({ total: 0, completed: 0 })
  const [batchFormats, setBatchFormats] = useState<string[]>(["markdown"])
  const [batchIgnoreInvalidURLs, setBatchIgnoreInvalidURLs] = useState(true)
  const [batchResults, setBatchResults] = useState<
    Array<{
      markdown?: string
      html?: string
      links?: string[]
      metadata?: {
        title: string
        sourceURL: string
        statusCode: number
        error?: string
      }
    }>
  >([])
  const [onlyMainContent, setOnlyMainContent] = useState(true) // Specific to this tab
  const { toast } = useToast()

  const handleBatchFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setBatchFormats([...batchFormats, format])
    } else {
      setBatchFormats(batchFormats.filter((f) => f !== format))
    }
  }

  const startBatchScrape = async () => {
    if (!batchUrls.trim()) {
      toast({ title: "URLs Required", description: "Please enter at least one URL to scrape", variant: "destructive" })
      return
    }
    if (batchFormats.length === 0) {
      toast({ title: "Format Required", description: "Please select at least one format", variant: "destructive" })
      return
    }
    try {
      setIsLoadingBatch(true)
      setBatchResults([])
      setBatchJobId("")
      setBatchStatus("starting")
      setBatchProgress({ total: 0, completed: 0 })
      const urlsArray = batchUrls.split("\n").map((url) => url.trim()).filter(Boolean)
      const response = await fetch("/api/batch-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlsArray, formats: batchFormats, onlyMainContent, ignoreInvalidURLs: batchIgnoreInvalidURLs }),
      })
      if (!response.ok) throw new Error("Failed to start batch scrape")
      const data = await response.json()
      if (!data.success) throw new Error(data.error || "API returned an error when starting batch job")
      const jobId = data.id
      if (!jobId) throw new Error("No job ID returned from API after starting batch job")
      setBatchJobId(jobId)
      setBatchStatus("processing")
      await pollBatchStatus(jobId)
    } catch (error) {
      setBatchStatus("error")
      toast({ title: "Batch Scraping Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" })
      setIsLoadingBatch(false)
    }
  }

  const pollBatchStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/batch-status?id=${jobId}`)
      if (!response.ok) throw new Error("Failed to get batch status")
      const data = await response.json()
      const status = data.status
      setBatchStatus(status || "unknown")
      setBatchProgress({ total: data.total || 0, completed: data.completed || 0 })
      if (status === "completed") {
        setBatchResults(data.data || [])
        toast({ title: "Batch Scraping Complete", description: `Successfully scraped ${data.data?.length || 0} URLs` })
        setIsLoadingBatch(false)
      } else if (status === "error") {
        throw new Error("Batch job failed as reported by Firecrawl status API")
      } else {
        setTimeout(() => pollBatchStatus(jobId), 2000)
      }
    } catch (error) {
      setBatchStatus("error")
      toast({ title: "Polling Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" })
      setIsLoadingBatch(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl">Batch Scrape</CardTitle>
        <CardDescription>Process multiple URLs asynchronously and convert to your preferred format</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="batch-urls">URLs (one per line)</Label>
            <textarea id="batch-urls" placeholder="https://example.com&#10;https://example.org&#10;https://example.net" value={batchUrls} onChange={(e) => setBatchUrls(e.target.value)} className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <Accordion type="single" collapsible defaultValue="batch-formats" className="border rounded-md">
            <AccordionItem value="batch-formats" className="border-0 px-1">
              <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-secondary rounded-md font-medium">Format Options</AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2"><Checkbox id="batch-markdown-format" checked={batchFormats.includes("markdown")} onCheckedChange={(checked) => handleBatchFormatChange("markdown", checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="batch-markdown-format" className="text-sm font-medium">Markdown</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="batch-html-format" checked={batchFormats.includes("html")} onCheckedChange={(checked) => handleBatchFormatChange("html", checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="batch-html-format" className="text-sm font-medium">HTML</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="batch-links-format" checked={batchFormats.includes("links")} onCheckedChange={(checked) => handleBatchFormatChange("links", checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="batch-links-format" className="text-sm font-medium">Links</label></div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2"><Checkbox id="batch-main-content" checked={onlyMainContent} onCheckedChange={(checked) => setOnlyMainContent(checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="batch-main-content" className="text-sm font-medium">Only extract main content</label></div>
                  <div className="flex items-center space-x-2 mt-2"><Checkbox id="batch-ignore-invalid" checked={batchIgnoreInvalidURLs} onCheckedChange={(checked) => setBatchIgnoreInvalidURLs(checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="batch-ignore-invalid" className="text-sm font-medium">Ignore invalid URLs</label></div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button onClick={startBatchScrape} disabled={isLoadingBatch} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isLoadingBatch ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{batchStatus === "starting" ? "Starting Batch..." : batchStatus === "processing" ? `Processing... ${batchProgress.completed}/${batchProgress.total || "?"}` : batchStatus === "completed" ? `Completed ${batchProgress.completed}/${batchProgress.total || "?"}` : "Processing..."}</>) : ("Start Batch Scrape")}
          </Button>
          {isLoadingBatch && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{batchStatus === "starting" ? "Initiating batch scrape..." : batchStatus === "processing" ? "Processing in progress..." : batchStatus === "completed" ? "Batch scrape completed! Finalizing..." : batchStatus === "error" ? "An error occurred." : "Processing..."}</span><span className="text-sm text-muted-foreground">{batchProgress.completed} / {batchProgress.total || "?"}</span></div>
              <Progress value={batchStatus === "completed" ? 100 : batchProgress.total > 0 ? (batchProgress.completed / batchProgress.total) * 100 : 0} className="w-full h-2 [&>div]:bg-primary" />
            </div>
          )}
          {batchStatus === "error" && !isLoadingBatch && (<div className="bg-destructive/10 p-4 rounded-md flex items-start mt-4"><AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" /><p className="text-sm text-destructive">An error occurred during batch processing. Please check your URLs and try again.</p></div>)}
          {batchResults.length > 0 && (
            <div className="grid gap-3 mt-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between"><Label className="font-medium">Results ({batchResults.length} URLs)</Label><Button variant="outline" size="sm" onClick={async () => { const filesToDownload = batchResults.filter(result => result.markdown && result.metadata?.sourceURL).map((result, index) => { try { const urlObj = new URL(result.metadata!.sourceURL); let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, ""); if (!filename) filename = urlObj.hostname; return { content: result.markdown!, filename, extension: "md" } } catch (e) { return { content: result.markdown!, filename: `batch-${index}`, extension: "md" } } }); await downloadAsZip(filesToDownload, toast) }} className="border-input bg-background hover:bg-secondary"><FileDown className="h-4 w-4 mr-2" />Download All</Button></div>
              <div className="bg-muted rounded-md overflow-hidden">
                <div className="h-[500px] max-h-[500px] overflow-auto relative">
                  <table className="w-full min-w-full table-fixed">
                    <thead className="sticky top-0 bg-background"><tr className="border-b border-border"><th className="text-left p-3 font-medium">URL</th><th className="text-right p-3 w-32 font-medium">Actions</th></tr></thead>
                    <tbody className="relative">
                      {batchResults.map((result, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="p-3 truncate max-w-[300px]"><div className="flex items-center"><Globe className="h-4 w-4 mr-2 flex-shrink-0 text-primary" /><span className="truncate">{result.metadata?.sourceURL}</span></div></td>
                          <td className="p-3 text-right">
                            {result.markdown && (<>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.markdown || "", toast)} title="Copy markdown" className="hover:bg-secondary"><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                              <Button variant="ghost" size="sm" onClick={() => { if (!result.markdown || !result.metadata?.sourceURL) return; try { const urlObj = new URL(result.metadata.sourceURL); let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, ""); if (!filename) filename = urlObj.hostname; downloadFile(result.markdown, filename, "md") } catch (e) { downloadFile(result.markdown, `batch-${index}`, "md") } }} title="Download markdown" className="hover:bg-secondary"><Download className="h-4 w-4" /><span className="sr-only">Download</span></Button>
                            </>)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
