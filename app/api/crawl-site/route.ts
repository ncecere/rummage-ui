import { NextResponse } from "next/server"
import { getRummageApiEndpoint } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const {
      url,
      excludePaths,
      includePaths,
      maxDepth,
      ignoreSitemap,
      ignoreQueryParameters,
      limit,
      allowBackwardLinks,
      allowExternalLinks,
      scrapeOptions,
    } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    console.log("Crawling URL:", url, "with options:", {
      excludePaths,
      includePaths,
      maxDepth,
      ignoreSitemap,
      ignoreQueryParameters,
      limit,
      allowBackwardLinks,
      allowExternalLinks,
      scrapeOptions,
    })

    // Build request body, omitting undefined, empty arrays, and empty objects
    const crawlBody: Record<string, unknown> = { url }
    if (excludePaths && Array.isArray(excludePaths) && excludePaths.length > 0) crawlBody.excludePaths = excludePaths
    if (includePaths && Array.isArray(includePaths) && includePaths.length > 0) crawlBody.includePaths = includePaths
    if (maxDepth !== undefined) crawlBody.maxDepth = maxDepth
    if (ignoreSitemap !== undefined) crawlBody.ignoreSitemap = ignoreSitemap
    if (ignoreQueryParameters !== undefined) crawlBody.ignoreQueryParameters = ignoreQueryParameters
    if (limit !== undefined) crawlBody.limit = limit
    if (allowBackwardLinks !== undefined) crawlBody.allowBackwardLinks = allowBackwardLinks
    if (allowExternalLinks !== undefined) crawlBody.allowExternalLinks = allowExternalLinks

    // Only include scrapeOptions if it has at least one meaningful property
    if (
      scrapeOptions &&
      typeof scrapeOptions === "object" &&
      Object.keys(scrapeOptions).some(
        (key) =>
          scrapeOptions[key] !== undefined &&
          !(
            (Array.isArray(scrapeOptions[key]) && scrapeOptions[key].length === 0) ||
            (typeof scrapeOptions[key] === "object" && Object.keys(scrapeOptions[key]).length === 0)
          )
      )
    ) {
      crawlBody.scrapeOptions = scrapeOptions
    }
    console.log("Final crawl body being sent:", crawlBody)

    // Call the FireCrawl API
    const response = await fetch(getRummageApiEndpoint("/v1/crawl"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: JSON.stringify(crawlBody),
    })

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      // If not JSON, get the text and provide it in the error
      const text = await response.text()
      console.error("Non-JSON response:", text.substring(0, 200) + "...")
      throw new Error(`API returned non-JSON response with status ${response.status}`)
    }

    const data = await response.json()

    if (!response.ok) {
      // Pass through backend error details and crawl job ID if present
      return NextResponse.json(
        {
          success: false,
          error: data.error || `API returned ${response.status}: ${response.statusText}`,
          crawlJobId: data.id || undefined,
          details: data.details || undefined,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error starting crawl:", error)
    // If error has a response with JSON, try to include it
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "An unknown error occurred",
        details: error?.details || undefined,
      },
      { status: 500 },
    )
  }
}
