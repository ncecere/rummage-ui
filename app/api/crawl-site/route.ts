import { NextResponse } from "next/server"

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

    // Call the Rummage API
    const response = await fetch("https://rummage.thebitop.net/v1/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
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
      }),
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
      throw new Error(data.error || `API returned ${response.status}: ${response.statusText}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error starting crawl:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

