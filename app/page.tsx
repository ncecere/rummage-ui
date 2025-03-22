"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Loader2, Download, Copy, Globe, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  const [singleUrl, setSingleUrl] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [singleResults, setSingleResults] = useState<{
    markdown?: string
    html?: string
    links?: string[]
    metadata?: any
  }>({})
  const [selectedFormat, setSelectedFormat] = useState("markdown")
  const [onlyMainContent, setOnlyMainContent] = useState(true)
  const [formats, setFormats] = useState<string[]>(["markdown", "html", "links"])
  const [isLoadingSingle, setIsLoadingSingle] = useState(false)
  const [isLoadingSite, setIsLoadingSite] = useState(false)
  const [crawlJobId, setCrawlJobId] = useState("")
  const [crawlStatus, setCrawlStatus] = useState("")
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

  // Crawl options
  const [excludePaths, setExcludePaths] = useState("")
  const [includePaths, setIncludePaths] = useState("")
  const [maxDepth, setMaxDepth] = useState(3)
  const [ignoreSitemap, setIgnoreSitemap] = useState(false)
  const [ignoreQueryParameters, setIgnoreQueryParameters] = useState(true)
  const [limit, setLimit] = useState(100)
  const [allowBackwardLinks, setAllowBackwardLinks] = useState(false)
  const [allowExternalLinks, setAllowExternalLinks] = useState(false)
  const [crawlFormats, setCrawlFormats] = useState<string[]>(["markdown"])

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormats([...formats, format])
    } else {
      setFormats(formats.filter((f) => f !== format))
    }
  }

  const handleCrawlFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setCrawlFormats([...crawlFormats, format])
    } else {
      setCrawlFormats(crawlFormats.filter((f) => f !== format))
    }
  }

  // Update the error handling in the scrapeSingleUrl function
  const scrapeSingleUrl = async () => {
    if (!singleUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      })
      return
    }

    if (formats.length === 0) {
      toast({
        title: "Format Required",
        description: "Please select at least one format",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingSingle(true)
      setSingleResults({})

      const response = await fetch("/api/scrape-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: singleUrl,
          formats,
          onlyMainContent,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "API request failed")
      }

      setSingleResults(data.data || {})
      setSelectedFormat(formats[0])

      toast({
        title: "Scraping Complete",
        description: "Successfully scraped the URL",
      })
    } catch (error) {
      console.error("Scraping error:", error)
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSingle(false)
    }
  }

  // Update the error handling in the crawlEntireSite function
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
      setCrawlStatus("")
      setCrawlProgress({ total: 0, completed: 0 })

      // Parse exclude/include paths from comma-separated strings to arrays
      const excludePathsArray = excludePaths
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
      const includePathsArray = includePaths
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)

      const response = await fetch("/api/crawl-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to start crawl")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "API returned an error")
      }

      const jobId = data.data?.id
      if (!jobId) {
        throw new Error("No job ID returned from API")
      }

      setCrawlJobId(jobId)
      setCrawlStatus("processing")

      // Start polling for results
      await pollCrawlStatus(jobId)
    } catch (error) {
      setCrawlStatus("error")
      toast({
        title: "Crawling Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsLoadingSite(false)
    }
  }

  // Update the error handling in the pollCrawlStatus function
  const pollCrawlStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/crawl-status?id=${jobId}`)

      if (!response.ok) {
        throw new Error("Failed to get crawl status")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "API returned an error")
      }

      const status = data.data?.status
      setCrawlStatus(status || "unknown")
      setCrawlProgress({
        total: data.data?.total || 0,
        completed: data.data?.completed || 0,
      })

      if (status === "completed") {
        setCrawlResults(data.data?.data || [])
        toast({
          title: "Crawling Complete",
          description: `Successfully crawled ${data.data?.data?.length || 0} pages`,
        })
        setIsLoadingSite(false)
      } else if (status === "error") {
        throw new Error("Crawl job failed")
      } else {
        // Continue polling
        setTimeout(() => pollCrawlStatus(jobId), 2000)
      }
    } catch (error) {
      setCrawlStatus("error")
      toast({
        title: "Polling Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsLoadingSite(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    })
  }

  const downloadFile = (content: string, filename: string, extension: string) => {
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

  const downloadAllMarkdown = () => {
    crawlResults.forEach((result) => {
      if (!result.markdown || !result.metadata?.sourceURL) return

      try {
        const urlObj = new URL(result.metadata.sourceURL)
        let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, "")
        if (!filename) filename = urlObj.hostname

        downloadFile(result.markdown, filename, "md")
      } catch (e) {
        // Fallback filename
        downloadFile(result.markdown, `page-${Math.random().toString(36).substring(7)}`, "md")
      }
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-3">Rummage</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Convert web pages to markdown and other formats with ease
        </p>
      </div>

      <Tabs defaultValue="single" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
          <TabsTrigger
            value="single"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Single Page
          </TabsTrigger>
          <TabsTrigger
            value="site"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Entire Site
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl">Scrape Single URL</CardTitle>
              <CardDescription>Enter a URL to scrape and convert to your preferred format</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="single-url" className="font-medium">
                    URL
                  </Label>
                  <Input
                    id="single-url"
                    placeholder="https://example.com"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="font-medium">Format Options</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="markdown-format"
                        checked={formats.includes("markdown")}
                        onCheckedChange={(checked) => handleFormatChange("markdown", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="markdown-format"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Markdown
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="html-format"
                        checked={formats.includes("html")}
                        onCheckedChange={(checked) => handleFormatChange("html", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="html-format"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        HTML
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="links-format"
                        checked={formats.includes("links")}
                        onCheckedChange={(checked) => handleFormatChange("links", checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="links-format"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Links
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="main-content"
                    checked={onlyMainContent}
                    onCheckedChange={(checked) => setOnlyMainContent(checked === true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="main-content"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Only extract main content (ignore headers, footers, etc.)
                  </label>
                </div>

                <Button
                  onClick={scrapeSingleUrl}
                  disabled={isLoadingSingle}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                >
                  {isLoadingSingle ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping
                    </>
                  ) : (
                    "Scrape URL"
                  )}
                </Button>

                {singleResults && Object.keys(singleResults || {}).length > 0 && (
                  <div className="grid gap-6 mt-4 pt-6 border-t border-border">
                    <div>
                      <Label className="mb-2 block font-medium">Result Format</Label>
                      <Select defaultValue="markdown" value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="w-full bg-background border-input">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          {singleResults.markdown && <SelectItem value="markdown">Markdown</SelectItem>}
                          {singleResults.html && <SelectItem value="html">HTML</SelectItem>}
                          {singleResults.links && <SelectItem value="links">Links</SelectItem>}
                          {singleResults.metadata && <SelectItem value="metadata">Metadata</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFormat === "markdown" && singleResults.markdown && (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Markdown</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleResults.markdown || "")}
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadFile(
                                  singleResults.markdown || "",
                                  singleResults.metadata?.title || "scraped-content",
                                  "md",
                                )
                              }
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{singleResults.markdown}</pre>
                        </div>
                      </div>
                    )}

                    {selectedFormat === "html" && singleResults.html && (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">HTML</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleResults.html || "")}
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadFile(
                                  singleResults.html || "",
                                  singleResults.metadata?.title || "scraped-content",
                                  "html",
                                )
                              }
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{singleResults.html}</pre>
                        </div>
                      </div>
                    )}

                    {selectedFormat === "links" && singleResults.links && (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Links ({singleResults.links.length})</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleResults.links?.join("\n") || "")}
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadFile(
                                  singleResults.links?.join("\n") || "",
                                  singleResults.metadata?.title || "scraped-links",
                                  "txt",
                                )
                              }
                              className="border-input bg-background hover:bg-secondary"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted rounded-md overflow-auto max-h-[400px]">
                          <ul className="p-4 space-y-2">
                            {singleResults.links &&
                              singleResults.links.map((link, i) => (
                                <li key={i} className="break-all hover:bg-muted-foreground/10 p-1 rounded">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedFormat === "metadata" && singleResults.metadata && (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Metadata</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(singleResults.metadata, null, 2) || "")}
                            className="border-input bg-background hover:bg-secondary"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(singleResults.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
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
                            <label
                              htmlFor="crawl-markdown-format"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Markdown
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="crawl-html-format"
                              checked={crawlFormats.includes("html")}
                              onCheckedChange={(checked) => handleCrawlFormatChange("html", checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="crawl-html-format"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              HTML
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="crawl-links-format"
                              checked={crawlFormats.includes("links")}
                              onCheckedChange={(checked) => handleCrawlFormatChange("links", checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="crawl-links-format"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Links
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="crawl-main-content"
                            checked={onlyMainContent}
                            onCheckedChange={(checked) => setOnlyMainContent(checked === true)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="crawl-main-content"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Only extract main content
                          </label>
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
                        <div className="grid gap-2">
                          <Label htmlFor="exclude-paths" className="font-medium">
                            Exclude Paths (comma separated)
                          </Label>
                          <Input
                            id="exclude-paths"
                            placeholder="/admin, /private"
                            value={excludePaths}
                            onChange={(e) => setExcludePaths(e.target.value)}
                            className="bg-background border-input"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="include-paths" className="font-medium">
                            Include Only Paths (comma separated)
                          </Label>
                          <Input
                            id="include-paths"
                            placeholder="/blog, /docs"
                            value={includePaths}
                            onChange={(e) => setIncludePaths(e.target.value)}
                            className="bg-background border-input"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="max-depth" className="font-medium">
                            Max Depth
                          </Label>
                          <Input
                            id="max-depth"
                            type="number"
                            min="1"
                            max="10"
                            value={maxDepth}
                            onChange={(e) => setMaxDepth(Number.parseInt(e.target.value) || 3)}
                            className="bg-background border-input"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="limit" className="font-medium">
                            Page Limit
                          </Label>
                          <Input
                            id="limit"
                            type="number"
                            min="1"
                            max="500"
                            value={limit}
                            onChange={(e) => setLimit(Number.parseInt(e.target.value) || 100)}
                            className="bg-background border-input"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ignore-sitemap"
                              checked={ignoreSitemap}
                              onCheckedChange={(checked) => setIgnoreSitemap(checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="ignore-sitemap"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Ignore Sitemap
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ignore-query-params"
                              checked={ignoreQueryParameters}
                              onCheckedChange={(checked) => setIgnoreQueryParameters(checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="ignore-query-params"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Ignore Query Parameters
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-backward-links"
                              checked={allowBackwardLinks}
                              onCheckedChange={(checked) => setAllowBackwardLinks(checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="allow-backward-links"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Allow Backward Links
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-external-links"
                              checked={allowExternalLinks}
                              onCheckedChange={(checked) => setAllowExternalLinks(checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="allow-external-links"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Allow External Links
                            </label>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button
                  onClick={startCrawl}
                  disabled={isLoadingSite}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                >
                  {isLoadingSite ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {crawlStatus === "starting" ? "Starting Crawl" : "Crawling..."}
                    </>
                  ) : (
                    "Crawl Site"
                  )}
                </Button>

                {isLoadingSite && crawlStatus === "processing" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Crawling in progress...</span>
                      <span className="text-sm text-muted-foreground">
                        {crawlProgress.completed} / {crawlProgress.total || "?"}
                      </span>
                    </div>
                    <Progress
                      value={(crawlProgress.completed / (crawlProgress.total || 1)) * 100}
                      className="h-2 bg-secondary"
                    />
                  </div>
                )}

                {crawlStatus === "error" && (
                  <div className="bg-destructive/10 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">
                      An error occurred while crawling the site. Please try again with different parameters or check the
                      URL.
                    </p>
                  </div>
                )}

                {crawlResults.length > 0 && (
                  <div className="grid gap-3 mt-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Results ({crawlResults.length} pages)</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAllMarkdown}
                        className="border-input bg-background hover:bg-secondary"
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                    <div className="bg-muted rounded-md overflow-hidden">
                      <div className="max-h-[500px] overflow-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-background">
                            <tr className="border-b border-border">
                              <th className="text-left p-3 font-medium">URL</th>
                              <th className="text-right p-3 w-32 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crawlResults.map((result, index) => (
                              <tr key={index} className="border-b border-border">
                                <td className="p-3 truncate max-w-[300px]">
                                  <div className="flex items-center">
                                    <Globe className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                                    <span className="truncate">{result.metadata?.sourceURL}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  {result.markdown && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(result.markdown || "")}
                                        title="Copy markdown"
                                        className="hover:bg-secondary"
                                      >
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (!result.markdown || !result.metadata?.sourceURL) return

                                          try {
                                            const urlObj = new URL(result.metadata.sourceURL)
                                            let filename = urlObj.pathname.replace(/\//g, "-").replace(/^-/, "")
                                            if (!filename) filename = urlObj.hostname

                                            downloadFile(result.markdown, filename, "md")
                                          } catch (e) {
                                            // Fallback filename
                                            downloadFile(result.markdown, `page-${index}`, "md")
                                          }
                                        }}
                                        title="Download markdown"
                                        className="hover:bg-secondary"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                      </Button>
                                    </>
                                  )}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

