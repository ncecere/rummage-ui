"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Download, Copy, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { copyToClipboard, downloadFile } from "@/lib/utils"

export default function MapTab() {
  const [mapUrl, setMapUrl] = useState("")
  const [isLoadingMap, setIsLoadingMap] = useState(false)
  const [mapSearch, setMapSearch] = useState("")
  const [mapIgnoreSitemap, setMapIgnoreSitemap] = useState(false)
  const [mapSitemapOnly, setMapSitemapOnly] = useState(false)
  const [mapIncludeSubdomains, setMapIncludeSubdomains] = useState(false)
  const [mapLimit, setMapLimit] = useState<number | string>(100)
  const [mapResults, setMapResults] = useState<string[]>([])
  const { toast } = useToast()

  const mapSite = async () => {
    if (!mapUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to map",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingMap(true)
      setMapResults([])

      const response = await fetch("/api/map-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mapUrl,
          search: mapSearch || undefined,
          ignoreSitemap: mapIgnoreSitemap,
          sitemapOnly: mapSitemapOnly,
          includeSubdomains: mapIncludeSubdomains,
          limit: Number.parseInt(mapLimit.toString()),
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "API request failed")
      }
      setMapResults(data.links || [])
      toast({
        title: "URL Discovery Complete",
        description: `Found ${data.links?.length || 0} URLs`,
      })
    } catch (error) {
      console.error("URL mapping error:", error)
      toast({
        title: "URL Discovery Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMap(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl">URL Discovery</CardTitle>
        <CardDescription>
          Discover URLs from a starting point using sitemap.xml and HTML links
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="map-url" className="font-medium">Site URL</Label>
            <Input id="map-url" placeholder="https://example.com" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} className="bg-background border-input" />
          </div>

          <Accordion type="single" collapsible defaultValue="map-options" className="border rounded-md">
            <AccordionItem value="map-options" className="border-0 px-1">
              <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-secondary rounded-md font-medium">Discovery Options</AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 pt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="map-search">Search Term (optional)</Label>
                    <Input id="map-search" placeholder="blog, product, etc." value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} className="bg-background border-input" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="map-limit">URL Limit</Label>
                    <Input id="map-limit" type="number" min="1" max="1000" value={mapLimit} onChange={(e) => setMapLimit(e.target.value === "" ? "" : Number.parseInt(e.target.value) || 100)} onBlur={(e) => setMapLimit(isNaN(Number.parseInt(e.target.value)) ? 100 : Number.parseInt(e.target.value))} className="bg-background border-input" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2"><Checkbox id="map-ignore-sitemap" checked={mapIgnoreSitemap} onCheckedChange={(checked) => setMapIgnoreSitemap(checked === true)} /><label htmlFor="map-ignore-sitemap" className="text-sm font-medium">Ignore Sitemap</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="map-sitemap-only" checked={mapSitemapOnly} onCheckedChange={(checked) => setMapSitemapOnly(checked === true)} /><label htmlFor="map-sitemap-only" className="text-sm font-medium">Sitemap Only</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="map-include-subdomains" checked={mapIncludeSubdomains} onCheckedChange={(checked) => setMapIncludeSubdomains(checked === true)} /><label htmlFor="map-include-subdomains" className="text-sm font-medium">Include Subdomains</label></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={mapSite} disabled={isLoadingMap} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isLoadingMap ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Discovering URLs...</>) : ("Discover URLs")}
          </Button>

          {mapResults.length > 0 && (
            <div className="grid gap-3 mt-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Discovered URLs ({mapResults.length})</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(mapResults.join("\n"), toast)} className="border-input bg-background hover:bg-secondary"><Copy className="h-4 w-4 mr-2" />Copy All</Button>
                  <Button variant="outline" size="sm" onClick={() => downloadFile(mapResults.join("\n"), "discovered-urls", "txt")} className="border-input bg-background hover:bg-secondary"><Download className="h-4 w-4 mr-2" />Download</Button>
                </div>
              </div>
              <div className="bg-muted rounded-md overflow-hidden">
                <div className="h-[500px] max-h-[500px] overflow-auto">
                  <ul className="p-4 space-y-2">
                    {mapResults.map((url, index) => (
                      <li key={index} className="break-all hover:bg-muted-foreground/10 p-1 rounded">
                        <div className="flex items-center">
                          <Link2 className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{url}</a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
