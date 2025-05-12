import { NextResponse } from "next/server"
import { getRummageApiEndpoint } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const { 
      query, 
      limit, 
      tbs, // Time-based search, e.g., "qdr:d" for past day
      lang, 
      country,
      scrapeOptions // Object like { formats: ["markdown"], onlyMainContent: true }
    } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    const body: Record<string, any> = { query }
    if (limit) body.limit = Number(limit)
    if (tbs) body.tbs = tbs
    if (lang) body.lang = lang
    if (country) body.country = country
    if (scrapeOptions) body.scrapeOptions = scrapeOptions

    console.log("Searching with query:", query, "and body:", body)

    // Call the Rummage API (which proxies to Firecrawl)
    const response = await fetch(getRummageApiEndpoint("/v1/search"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response from search API:", text.substring(0, 500))
      throw new Error(`Search API returned non-JSON response with status ${response.status}`)
    }

    const data = await response.json()

    if (!response.ok) {
      console.error("Search API returned error:", data)
      throw new Error(data.error || `Search API returned ${response.status}: ${response.statusText}`)
    }

    // The Firecrawl search response has "success", "data", "warning"
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in /api/search:", error)
    return NextResponse.json(
      {
        success: false, // Ensure our error response also has a success field
        error: error instanceof Error ? error.message : "An unknown error occurred during search",
      },
      { status: 500 },
    )
  }
}
