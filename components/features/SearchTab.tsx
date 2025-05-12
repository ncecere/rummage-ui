"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Download, Copy, AlertCircle, SearchIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { copyToClipboard, downloadFile } from "@/lib/utils"

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLimit, setSearchLimit] = useState<number | string>(5)
  const [searchScrapeContent, setSearchScrapeContent] = useState(true)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      title: string
      description: string
      url: string
      markdown?: string
      html?: string
      links?: string[]
      metadata?: {
        title: string
        description: string
        sourceURL: string
        statusCode: number
        error?: string
      }
    }>
  >([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchWarning, setSearchWarning] = useState<string | null>(null)
  const { toast } = useToast()

  const startSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Query Required", description: "Please enter a search query.", variant: "destructive" })
      return
    }
    try {
      setIsLoadingSearch(true)
      setSearchResults([])
      setSearchError(null)
      setSearchWarning(null)
      const body: any = { query: searchQuery, limit: Number(searchLimit) || 5 }
      if (searchScrapeContent) {
        body.scrapeOptions = { formats: ["markdown"], onlyMainContent: true }
      }
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Search API request failed")
      }
      setSearchResults(data.data || [])
      if (data.warning) {
        setSearchWarning(data.warning)
        toast({ title: "Search Warning", description: data.warning, variant: "default" })
      }
      toast({ title: "Search Complete", description: `Found ${data.data?.length || 0} results.` })
    } catch (error) {
      console.error("Search error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setSearchError(errorMessage)
      toast({ title: "Search Failed", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoadingSearch(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl">Web Search</CardTitle>
        <CardDescription>Search the web and optionally scrape content from results.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="search-query">Search Query</Label>
            <Input id="search-query" placeholder="e.g., best AI frameworks, site:example.com news" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-background border-input" />
          </div>
          <Accordion type="single" collapsible defaultValue="search-options" className="border rounded-md">
            <AccordionItem value="search-options" className="border-0 px-1">
              <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-secondary rounded-md font-medium">Search Options</AccordionTrigger>
              <AccordionContent className="px-3">
                <div className="space-y-4 pt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="search-limit">Result Limit (1-50)</Label>
                    <Input id="search-limit" type="number" min="1" max="50" value={searchLimit} onChange={(e) => { const val = e.target.value; setSearchLimit(val === "" ? "" : Math.max(1, Math.min(50, Number.parseInt(val) || 5))); }} onBlur={(e) => { const val = Number.parseInt(e.target.value); setSearchLimit(isNaN(val) || val < 1 || val > 50 ? 5 : val); }} className="bg-background border-input" />
                  </div>
                  <div className="flex items-center space-x-2"><Checkbox id="search-scrape-content" checked={searchScrapeContent} onCheckedChange={(checked) => setSearchScrapeContent(checked === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" /><label htmlFor="search-scrape-content" className="text-sm font-medium">Fetch full markdown content for each result</label></div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button onClick={startSearch} disabled={isLoadingSearch} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
            {isLoadingSearch ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</>) : (<><SearchIcon className="mr-2 h-4 w-4" />Search</>)}
          </Button>
          {isLoadingSearch && (<div className="flex justify-center items-center p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>)}
          {searchError && !isLoadingSearch && (<div className="bg-destructive/10 p-4 rounded-md flex items-start"><AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" /><p className="text-sm text-destructive">{searchError}</p></div>)}
          {searchWarning && !isLoadingSearch && (<div className="bg-yellow-500/10 p-4 rounded-md flex items-start text-yellow-700 dark:text-yellow-300"><AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /><p className="text-sm">{searchWarning}</p></div>)}
          {searchResults.length > 0 && !isLoadingSearch && (
            <div className="grid gap-4 mt-4 pt-6 border-t border-border">
              <Label className="font-medium">Search Results ({searchResults.length})</Label>
              <Accordion type="multiple" className="w-full space-y-2">
                {searchResults.map((result, index) => (
                  <AccordionItem value={`search-result-${index}`} key={index} className="border bg-card rounded-md">
                    <AccordionTrigger className="p-3 hover:no-underline hover:bg-secondary rounded-t-md">
                      <div className="flex flex-col text-left"><span className="font-medium text-primary truncate max-w-xl">{result.title}</span><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate max-w-xl">{result.url}</a></div>
                    </AccordionTrigger>
                    <AccordionContent className="p-3 border-t">
                      <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                      {result.markdown && (
                        <div className="grid gap-3">
                          <div className="flex items-center justify-between"><Label className="font-medium text-xs">Markdown Content</Label><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => copyToClipboard(result.markdown!, toast)} className="border-input bg-background hover:bg-secondary h-7 px-2 text-xs"><Copy className="h-3 w-3 mr-1" />Copy</Button><Button variant="outline" size="sm" onClick={() => downloadFile(result.markdown!, result.metadata?.title || `search-result-${index}`, "md")} className="border-input bg-background hover:bg-secondary h-7 px-2 text-xs"><Download className="h-3 w-3 mr-1" />Download</Button></div></div>
                          <div className="bg-muted p-3 rounded-md overflow-auto max-h-[300px] font-mono text-xs"><pre className="whitespace-pre-wrap">{result.markdown}</pre></div>
                        </div>
                      )}
                      {result.metadata?.error && (<div className="mt-2 bg-destructive/10 p-2 rounded-md text-xs"><p className="text-destructive">Error scraping this page: {result.metadata.error}</p></div>)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
