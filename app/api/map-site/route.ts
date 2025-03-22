import { NextResponse } from "next/server"
import { getRummageApiEndpoint } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const {
      url,
      search,
      ignoreSitemap,
      sitemapOnly,
      includeSubdomains,
      limit,
    } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    console.log("Mapping URL:", url, "with options:", {
      search,
      ignoreSitemap,
      sitemapOnly,
      includeSubdomains,
      limit,
    })

    // Call the Rummage API
    const response = await fetch(getRummageApiEndpoint("/v1/map"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url,
        search,
        ignoreSitemap,
        sitemapOnly,
        includeSubdomains,
        limit,
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
    console.error("Error mapping URL:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
