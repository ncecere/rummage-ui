"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard, downloadFile } from "@/lib/utils" // Import utils

// interface ScrapeTabProps {
// No props needed for these utils anymore
// }

export default function ScrapeTab(/* Removed props */) {
  const [singleUrl, setSingleUrl] = useState("")
  const [singleResults, setSingleResults] = useState<{
    markdown?: string
    html?: string
    links?: string[]
    metadata?: any
  }>({})
  const [selectedFormat, setSelectedFormat] = useState("markdown")
  const [onlyMainContent, setOnlyMainContent] = useState(true) // Specific to this tab now
  const [formats, setFormats] = useState<string[]>(["markdown", "html", "links"]) // Specific to this tab
  const [isLoadingSingle, setIsLoadingSingle] = useState(false)
  const { toast } = useToast()

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormats([...formats, format])
    } else {
      setFormats(formats.filter((f) => f !== format))
    }
  }

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
      // Ensure selectedFormat is valid if current formats change
      if (data.data && formats.length > 0 && !formats.includes(selectedFormat)) {
        setSelectedFormat(formats[0])
      } else if (data.data && formats.length === 0 && Object.keys(data.data).length > 0) {
        // If no formats selected but results exist (e.g. metadata always returned)
        setSelectedFormat(Object.keys(data.data)[0]);
      }


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

  return (
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
                        onClick={() => copyToClipboard(singleResults.markdown || "", toast)}
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
                        onClick={() => copyToClipboard(singleResults.html || "", toast)}
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
                        onClick={() => copyToClipboard(singleResults.links?.join("\n") || "", toast)}
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
                            onClick={() => copyToClipboard(JSON.stringify(singleResults.metadata, null, 2) || "", toast)}
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
  )
}
