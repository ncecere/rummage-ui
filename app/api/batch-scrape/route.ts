import { NextResponse } from "next/server"
import { getRummageApiEndpoint } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const {
      urls,
      formats,
      onlyMainContent,
      includeTags,
      excludeTags,
      headers,
      waitFor,
      timeout,
      ignoreInvalidURLs,
      webhook,
    } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: false, error: "At least one URL is required" }, { status: 400 })
    }

    console.log("Batch scraping URLs:", urls.length, "URLs with options:", {
      formats,
      onlyMainContent,
      includeTags,
      excludeTags,
      waitFor,
      timeout,
      ignoreInvalidURLs,
    })

    // Call the Rummage API
    const response = await fetch(getRummageApiEndpoint("/v1/batch/scrape"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        urls,
        formats,
        onlyMainContent,
        includeTags,
        excludeTags,
        headers,
        waitFor,
        timeout,
        ignoreInvalidURLs,
        webhook,
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
    console.error("Error starting batch scrape:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
