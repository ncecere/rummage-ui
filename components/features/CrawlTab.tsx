"use client"

import { useState } from "react"
import JSZip from "jszip" // Keep for downloadAsZip if used locally, or remove if downloadAllMarkdown uses util
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown, Loader2, Download, Copy, Globe, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { copyToClipboard, downloadFile, downloadAsZip } from "@/lib/utils"

export default function CrawlTab() {
  const [siteUrl, setSiteUrl] = useState("")
  const [isLoadingSite, setIsLoadingSite] = useState(false)
  const [crawlJobId, setCrawlJobId] = useState("")
  const [crawlStatus, setCrawlStatus] = useState("")
  const [crawlErrorMessage, setCrawlErrorMessage] = useState<string | null>(null)
  const [crawlProgress, setCrawlProgress] = useState({ total: 0, completed: 0 })
  const [crawlResults, setCrawlResults] = useState<
    Array<{
      markdown?: string
      html?: string
      links?: string[]
      metadata?: {
        title: string
        sourceURL: string
        statusCode: number
      }
    }>
  >([])
  const { toast } = useToast()

  // Crawl options specific to this tab
  const [onlyMainContent, setOnlyMainContent] = useState(true)
  const [excludePaths, setExcludePaths] = useState("")
  const [includePaths, setIncludePaths] = useState("")
  const [maxDepth, setMaxDepth] = useState<number | string>(3)
  const [ignoreSitemap, setIgnoreSitemap] = useState(false) // Note: this was also a top-level state, ensure it's distinct if needed elsewhere
  const [ignoreQueryParameters, setIgnoreQueryParameters] = useState(true)
  const [limit, setLimit] = useState<number | string>(100)
  const [allowBackwardLinks, setAllowBackwardLinks] = useState(false)
  const [allowExternalLinks, setAllowExternalLinks] = useState(false)
  const [crawlFormats, setCrawlFormats] = useState<string[]>(["markdown"])

  const handleCrawlFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setCrawlFormats([...crawlFormats, format])
    } else {
      setCrawlFormats(crawlFormats.filter((f) => f !== format))
    }
  }

  const startCrawl = async () => {
    if (!siteUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a site URL to crawl",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingSite(true)
      setCrawlResults([])
      setCrawlJobId("")
      setCrawlStatus("starting")
      setCrawlErrorMessage(null)
      setCrawlProgress({ total: 0, completed: 0 })

      const excludePathsArray = excludePaths.split(",").map((p) => p.trim()).filter(Boolean)
      const includePathsArray = includePaths.split(",").map((p) => p.trim()).filter(Boolean)

      const response = await fetch("/api/crawl-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: siteUrl,
          excludePaths: excludePathsArray,
          includePaths: includePathsArray,
          maxDepth: Number.parseInt(maxDepth.toString()),
          ignoreSitemap,
          ignoreQueryParameters,
          limit: Number.parseInt(limit.toString()),
          allowBackwardLinks,
          allowExternalLinks,
          scrapeOptions: {
            formats: crawlFormats,
            onlyMainContent,
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const errorPayload: any = { message: data.error || `API request failed with status ${response.status}` }
        if (data.crawlJobId) errorPayload.crawlJobId = data.crawlJobId
        if (data.details) errorPayload.details = data.details
        throw errorPayload
      }
      const jobId = data.id
      if (!jobId) {
        throw new Error("No job ID returned from API despite successful call.")
      }
      setCrawlJobId(jobId)
      setCrawlStatus("processing")
      await pollCrawlStatus(jobId)
    } catch (error: any) {
      setCrawlStatus("error")
      const description = error?.message || "An unknown error occurred while starting crawl."
      setCrawlErrorMessage(description + (error?.crawlJobId ? ` (Job ID: ${error.crawlJobId})` : "") + (error?.details ? ` Details: ${JSON.stringify(error.details)}` : ""))
      toast({ title: "Crawling Failed", description, variant: "destructive" })
      setIsLoadingSite(false)
    }
  }

  const pollCrawlStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/crawl-status?id=${jobId}`)
      if (!response.ok) throw new Error("Failed to get crawl status")
      const data = await response.json()
      if (!data.success) throw new Error(data.error || "API returned an error during status check")

      const status = data.status
      setCrawlStatus(status || "unknown")
      setCrawlProgress({ total: data.total || 0, completed: data.completed || 0 })

      if (status === "completed") {
        const resultsArray = data.data || []
        setCrawlResults(resultsArray)
        toast({ title: "Crawling Complete", description: `Successfully crawled ${resultsArray.length || 0} pages` })
        setIsLoadingSite(false)
      } else if (status === "error" || data.status === "error") {
        throw new Error("Crawl job failed as reported by API")
      } else {
        setTimeout(() => pollCrawlStatus(jobId), 2000)
      }
    } catch (error) {
      setCrawlStatus("error")
      toast({ title: "Polling Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" })
      setIsLoadingSite(false)
    }
  }

  const downloadAllMarkdown = async () => {
    const filesToDownload = crawlResults
      .filter(result => result.markdown && result.metadata?.sourceURL)
      .map(result => {
        try {
          const urlObj = new URL(result.metadata!.sourceURL)
          let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, "")
          if (!filename) filename = urlObj.hostname
          return { content: result.markdown!, filename, extension: "md" }
        } catch (e) {
          return { content: result.markdown!, filename: `page-${Math.random().toString(36).substring(7)}`, extension: "md" }
        }
      })
    await downloadAsZip(filesToDownload, toast) // Pass toast here
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl">Crawl Entire Site</CardTitle>
        <CardDescription>
          Enter a site URL to crawl and convert all pages to your preferred format
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="site-url" className="font-medium">
              Site URL
            </Label>
            <Input
              id="site-url"
              placeholder="https://example.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="bg-background border-input"
            />
          </div>

          <Accordion type="single" collapsible defaultValue="formats" className="border rounded-md">
            <AccordionItem value="formats" className="border-0 px-1">
              <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-secondary rounded-md font-medium">
                Format Options
              </AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crawl-markdown-format"
                        checked={crawlFormats.includes("markdown")}
                        onCheckedChange={(checked) => handleCrawlFormatChange("markdown", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="crawl-markdown-format" className="text-sm font-medium">Markdown</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crawl-html-format"
                        checked={crawlFormats.includes("html")}
                        onCheckedChange={(checked) => handleCrawlFormatChange("html", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="crawl-html-format" className="text-sm font-medium">HTML</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crawl-links-format"
                        checked={crawlFormats.includes("links")}
                        onCheckedChange={(checked) => handleCrawlFormatChange("links", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="crawl-links-format" className="text-sm font-medium">Links</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="crawl-main-content"
                      checked={onlyMainContent}
                      onCheckedChange={(checked) => setOnlyMainContent(checked === true)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="crawl-main-content" className="text-sm font-medium">Only extract main content</label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="crawl-options" className="border-0 px-1">
              <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-secondary rounded-md font-medium">
                Crawl Options
              </AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 pt-2">
                  <div className="grid gap-2"><Label htmlFor="exclude-paths">Exclude Paths (comma separated)</Label><Input id="exclude-paths" placeholder="/admin, /private" value={excludePaths} onChange={(e) => setExcludePaths(e.target.value)} /></div>
                  <div className="grid gap-2"><Label htmlFor="include-paths">Include Only Paths (comma separated)</Label><Input id="include-paths" placeholder="/blog, /docs" value={includePaths} onChange={(e) => setIncludePaths(e.target.value)} /></div>
                  <div className="grid gap-2"><Label htmlFor="max-depth">Max Depth</Label><Input id="max-depth" type="number" min="1" max="10" value={maxDepth} onChange={(e) => setMaxDepth(e.target.value === "" ? "" : Number.parseInt(e.target.value) || 3)} onBlur={(e) => setMaxDepth(isNaN(Number.parseInt(e.target.value)) ? 3 : Number.parseInt(e.target.value))} /></div>
                  <div className="grid gap-2"><Label htmlFor="limit">Page Limit</Label><Input id="limit" type="number" min="1" max="500" value={limit} onChange={(e) => setLimit(e.target.value === "" ? "" : Number.parseInt(e.target.value) || 100)} onBlur={(e) => setLimit(isNaN(Number.parseInt(e.target.value)) ? 100 : Number.parseInt(e.target.value))} /></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2"><Checkbox id="ignore-sitemap" checked={ignoreSitemap} onCheckedChange={(checked) => setIgnoreSitemap(checked === true)} /><label htmlFor="ignore-sitemap" className="text-sm font-medium">Ignore Sitemap</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="ignore-query-params" checked={ignoreQueryParameters} onCheckedChange={(checked) => setIgnoreQueryParameters(checked === true)} /><label htmlFor="ignore-query-params" className="text-sm font-medium">Ignore Query Parameters</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="allow-backward-links" checked={allowBackwardLinks} onCheckedChange={(checked) => setAllowBackwardLinks(checked === true)} /><label htmlFor="allow-backward-links" className="text-sm font-medium">Allow Backward Links</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="allow-external-links" checked={allowExternalLinks} onCheckedChange={(checked) => setAllowExternalLinks(checked === true)} /><label htmlFor="allow-external-links" className="text-sm font-medium">Allow External Links</label></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={startCrawl} disabled={isLoadingSite} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isLoadingSite ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{crawlStatus === "starting" ? "Starting Crawl..." : crawlStatus === "processing" ? `Crawling... ${crawlProgress.completed}/${crawlProgress.total || "?"}` : crawlStatus === "completed" ? `Completed ${crawlProgress.completed}/${crawlProgress.total || "?"}` : "Processing..."}</>) : ("Crawl Site")}
          </Button>

          {isLoadingSite && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{crawlStatus === "starting" ? "Initiating crawl..." : crawlStatus === "processing" ? "Crawling in progress..." : crawlStatus === "completed" ? "Crawl completed! Finalizing..." : crawlStatus === "error" ? "An error occurred." : "Processing..."}</span><span className="text-sm text-muted-foreground">{crawlProgress.completed} / {crawlProgress.total || "?"}</span></div>
              <Progress value={crawlStatus === "completed" ? 100 : crawlProgress.total > 0 ? (crawlProgress.completed / crawlProgress.total) * 100 : 0} className="w-full h-2 [&>div]:bg-primary" />
            </div>
          )}
          {crawlStatus === "error" && crawlErrorMessage && !isLoadingSite && (
            <div className="bg-destructive/10 p-4 rounded-md flex items-start mt-4"><AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" /><p className="text-sm text-destructive">{crawlErrorMessage}</p></div>
          )}
          {crawlResults.length > 0 && (
            <div className="grid gap-3 mt-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between"><Label className="font-medium">Results ({crawlResults.length} pages)</Label><Button variant="outline" size="sm" onClick={downloadAllMarkdown} className="border-input bg-background hover:bg-secondary"><FileDown className="h-4 w-4 mr-2" />Download All</Button></div>
              <div className="bg-muted rounded-md overflow-hidden">
                <div className="h-[500px] max-h-[500px] overflow-auto relative">
                  <table className="w-full min-w-full table-fixed">
                    <thead className="sticky top-0 bg-background"><tr className="border-b border-border"><th className="text-left p-3 font-medium">URL</th><th className="text-right p-3 w-32 font-medium">Actions</th></tr></thead>
                    <tbody className="relative">
                      {crawlResults.map((result, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="p-3 truncate max-w-[300px]"><div className="flex items-center"><Globe className="h-4 w-4 mr-2 flex-shrink-0 text-primary" /><span className="truncate">{result.metadata?.sourceURL}</span></div></td>
                          <td className="p-3 text-right">
                            {result.markdown && (<>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.markdown || "", toast)} title="Copy markdown" className="hover:bg-secondary"><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                              <Button variant="ghost" size="sm" onClick={() => { if (!result.markdown || !result.metadata?.sourceURL) return; try { const urlObj = new URL(result.metadata.sourceURL); let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, ""); if (!filename) filename = urlObj.hostname; downloadFile(result.markdown, filename, "md") } catch (e) { downloadFile(result.markdown, `page-${index}`, "md") } }} title="Download markdown" className="hover:bg-secondary"><Download className="h-4 w-4" /><span className="sr-only">Download</span></Button>
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
