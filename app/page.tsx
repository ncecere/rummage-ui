"use client"

import { useState } from "react"
import JSZip from "jszip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Loader2, Download, Copy, Globe, AlertCircle, Link2, List, SearchIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ScrapeTab from "@/components/features/ScrapeTab"
import CrawlTab from "@/components/features/CrawlTab"
import MapTab from "@/components/features/MapTab"
import BatchTab from "@/components/features/BatchTab"
import SearchTab from "@/components/features/SearchTab" // Import the new SearchTab component
import { copyToClipboard, downloadFile, downloadAsZip } from "@/lib/utils" // Import utils

export default function Home() {
  // All tab-specific states and functions have been moved to their respective components.
  // The Home component now only needs to manage the overall layout and import the tab components.
  // const { toast } = useToast() // toast is used by individual tabs via their own useToast hook

  // Map options and related states were moved to MapTab.tsx
  // Batch options and related states were moved to BatchTab.tsx
  // Search states were moved to SearchTab.tsx

  // Crawl options and related states were moved to CrawlTab.tsx
  // handleCrawlFormatChange was moved to CrawlTab.tsx
  // handleBatchFormatChange was moved to BatchTab.tsx
  // mapSite function was moved to MapTab.tsx
  // startBatchScrape and pollBatchStatus functions were moved to BatchTab.tsx
  // scrapeSingleUrl was moved to ScrapeTab.tsx
  // startCrawl and pollCrawlStatus were moved to CrawlTab.tsx
  // startSearch function was moved to SearchTab.tsx

  // copyToClipboard, downloadFile, downloadAsZip were moved to lib/utils.ts
  // They will be called directly from lib/utils, passing 'toast' where needed.
  // downloadAllMarkdown was moved to CrawlTab.tsx

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-3">Rummage</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Convert web pages to markdown and other formats with ease
        </p>
      </div>

      <Tabs defaultValue="single" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-5 mb-8 bg-secondary">
          <TabsTrigger
            value="single"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Scrape
          </TabsTrigger>
          <TabsTrigger
            value="site"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Crawl
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Map
          </TabsTrigger>
          <TabsTrigger
            value="batch"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Batch
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <SearchTab />
        </TabsContent>
        
        <TabsContent value="single">
          <ScrapeTab />
        </TabsContent>

        <TabsContent value="map">
          <MapTab />
        </TabsContent>

        <TabsContent value="batch">
          <BatchTab />
        </TabsContent>

        <TabsContent value="site">
          <CrawlTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
