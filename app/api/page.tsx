import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">API Reference</h1>
        <p className="text-muted-foreground mb-8">Learn how to use the Rummage API in your applications</p>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>Introduction to the Rummage API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  The Rummage API allows you to programmatically convert web pages to markdown and other formats. It
                  provides endpoints for scraping single pages and crawling entire websites.
                </p>
                <p className="mt-4">
                  All API endpoints are available at <code>https://rummage.thebitop.net/v1</code>. The API uses JSON for
                  request and response bodies.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileText className="mr-2 h-4 w-4" />
                    Download API Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Quick start guide for using the API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>To get started with the Rummage API, you'll need to:</p>
                <ol className="mt-4 space-y-2">
                  <li>Sign up for an API key</li>
                  <li>Include your API key in the Authorization header</li>
                  <li>Make requests to the API endpoints</li>
                </ol>
                <p className="mt-4">
                  Check out our comprehensive API documentation for detailed information on endpoints, request
                  parameters, and response formats.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available API endpoints and their usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scrape">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
                  <TabsTrigger
                    value="scrape"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Scrape Endpoint
                  </TabsTrigger>
                  <TabsTrigger
                    value="crawl"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Crawl Endpoint
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scrape">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-medium mb-3">Scrape Single URL</h3>
                    <p>
                      <code>POST /v1/scrape</code>
                    </p>
                    <p className="mt-4">Scrapes a single URL and returns the content in the requested formats.</p>
                    <h4 className="font-medium mt-6 mb-2">Request Body</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                      {`{
  "url": "https://example.com",
  "formats": ["markdown", "html", "links"],
  "onlyMainContent": true
}`}
                    </pre>
                    <h4 className="font-medium mt-6 mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                      {`{
  "success": true,
  "data": {
    "markdown": "# Example Page\\n\\nThis is an example page...",
    "html": "<h1>Example Page</h1><p>This is an example page...</p>",
    "links": ["https://example.com/page1", "https://example.com/page2"],
    "metadata": {
      "title": "Example Page",
      "sourceURL": "https://example.com",
      "statusCode": 200
    }
  }
}`}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="crawl">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-medium mb-3">Crawl Website</h3>
                    <p>
                      <code>POST /v1/crawl</code>
                    </p>
                    <p className="mt-4">
                      Starts a crawl job for the specified website. Returns a job ID that can be used to check the
                      status and retrieve results.
                    </p>
                    <h4 className="font-medium mt-6 mb-2">Request Body</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                      {`{
  "url": "https://example.com",
  "excludePaths": ["/admin", "/private"],
  "includePaths": ["/blog", "/docs"],
  "maxDepth": 3,
  "ignoreSitemap": false,
  "ignoreQueryParameters": true,
  "limit": 100,
  "allowBackwardLinks": false,
  "allowExternalLinks": false,
  "scrapeOptions": {
    "formats": ["markdown"],
    "onlyMainContent": true
  }
}`}
                    </pre>
                    <h4 className="font-medium mt-6 mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                      {`{
  "success": true,
  "data": {
    "id": "job_123456",
    "status": "processing"
  }
}`}
                    </pre>

                    <h3 className="text-lg font-medium mt-8 mb-3">Check Crawl Status</h3>
                    <p>
                      <code>GET /v1/crawl/{"{id}"}</code>
                    </p>
                    <p className="mt-4">
                      Checks the status of a crawl job and returns the results if the job is completed.
                    </p>
                    <h4 className="font-medium mt-6 mb-2">Response</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                      {`{
  "success": true,
  "data": {
    "status": "completed",
    "total": 10,
    "completed": 10,
    "data": [
      {
        "markdown": "# Page 1\\n\\nContent of page 1...",
        "metadata": {
          "title": "Page 1",
          "sourceURL": "https://example.com/page1",
          "statusCode": 200
        }
      },
      // More pages...
    ]
  }
}`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Examples of using the API in different languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary">
                  <TabsTrigger
                    value="javascript"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    JavaScript
                  </TabsTrigger>
                  <TabsTrigger
                    value="python"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Python
                  </TabsTrigger>
                  <TabsTrigger
                    value="curl"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    cURL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                    {`// Scrape a single URL
async function scrapePage(url) {
  const response = await fetch('https://rummage.thebitop.net/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html', 'links'],
      onlyMainContent: true
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
}

// Start a crawl job
async function crawlSite(url) {
  const response = await fetch('https://rummage.thebitop.net/v1/crawl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      url,
      maxDepth: 3,
      limit: 100,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true
      }
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data.id;
}

// Check crawl status and get results
async function checkCrawlStatus(jobId) {
  const response = await fetch(\`https://rummage.thebitop.net/v1/crawl/\${jobId}\`, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
}

// Example usage
async function example() {
  try {
    // Start a crawl job
    const jobId = await crawlSite('https://example.com');
    console.log(\`Crawl job started with ID: ${jobId}\`);
    
    // Poll for results
    let status;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await checkCrawlStatus(jobId);
      console.log(\`Status: ${status.status}, Completed: ${status.completed}/${status.total}\`);
    } while (status.status === 'processing');
    
    // Process results
    if (status.status === 'completed') {
      console.log(\`Crawl completed with ${status.data.length} pages\`);
      // Do something with the results
    }
  } catch (error) {
    console.error('Error:', error);
  }
}`}
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                    {`import requests
import time

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://rummage.thebitop.net/v1"

# Scrape a single URL
def scrape_page(url):
    response = requests.post(
        f"{BASE_URL}/scrape",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        },
        json={
            "url": url,
            "formats": ["markdown", "html", "links"],
            "onlyMainContent": True
        }
    )
    
    data = response.json()
    
    if not data.get("success"):
        raise Exception(data.get("error") or "API request failed")
    
    return data["data"]

# Start a crawl job
def crawl_site(url):
    response = requests.post(
        f"{BASE_URL}/crawl",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        },
        json={
            "url": url,
            "maxDepth": 3,
            "limit": 100,
            "scrapeOptions": {
                "formats": ["markdown"],
                "onlyMainContent": True
            }
        }
    )
    
    data = response.json()
    
    if not data.get("success"):
        raise Exception(data.get("error") or "API request failed")
    
    return data["data"]["id"]

# Check crawl status and get results
def check_crawl_status(job_id):
    response = requests.get(
        f"{BASE_URL}/crawl/{job_id}",
        headers={
            "Authorization": f"Bearer {API_KEY}"
        }
    )
    
    data = response.json()
    
    if not data.get("success"):
        raise Exception(data.get("error") or "API request failed")
    
    return data["data"]

# Example usage
def example():
    try:
        # Start a crawl job
        job_id = crawl_site("https://example.com")
        print(f"Crawl job started with ID: {job_id}")
        
        # Poll for results
        status = None
        while True:
            time.sleep(2)
            status = check_crawl_status(job_id)
            print(f"Status: {status['status']}, Completed: {status['completed']}/{status['total']}")
            
            if status["status"] != "processing":
                break
        
        # Process results
        if status["status"] == "completed":
            print(f"Crawl completed with {len(status['data'])} pages")
            # Do something with the results
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    example()`}
                  </pre>
                </TabsContent>

                <TabsContent value="curl">
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                    {`# Scrape a single URL
curl -X POST "https://rummage.thebitop.net/v1/scrape" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": true
  }'

# Start a crawl job
curl -X POST "https://rummage.thebitop.net/v1/crawl" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "url": "https://example.com",
    "maxDepth": 3,
    "limit": 100,
    "scrapeOptions": {
      "formats": ["markdown"],
      "onlyMainContent": true
    }
  }'

# Check crawl status
curl -X GET "https://rummage.thebitop.net/v1/crawl/job_123456" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

