import { NextResponse } from "next/server"
import { getRummageApiEndpoint } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Batch job ID is required" }, { status: 400 })
    }

    console.log("Checking batch status for ID:", id)

    // Call the Rummage API to check batch status
    const response = await fetch(getRummageApiEndpoint(`/v1/batch/scrape/${id}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
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
    console.error("Error checking batch status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
