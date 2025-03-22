import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentationPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">Documentation</h1>
        <p className="text-muted-foreground mb-8">Learn how to use Rummage to convert web pages to markdown</p>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics of using Rummage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  Rummage is a powerful tool for converting web pages to markdown and other formats. It provides two
                  main functionalities:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <strong>Single Page Scraping:</strong> Convert a single URL to markdown, HTML, or extract links
                  </li>
                  <li>
                    <strong>Site Crawling:</strong> Crawl an entire website and convert all pages to your preferred
                    format
                  </li>
                </ul>
                <h3 className="text-lg font-medium mt-6 mb-3">Basic Usage</h3>
                <p>
                  To scrape a single page, simply enter the URL in the input field, select your desired formats, and
                  click "Scrape URL". The results will be displayed below, where you can copy or download the content.
                </p>
                <p className="mt-4">
                  For crawling an entire site, enter the site's URL, configure the crawl options as needed, and click
                  "Crawl Site". The tool will process all pages and provide the results for download.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Options</CardTitle>
              <CardDescription>Learn about the various configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h3 className="text-lg font-medium mb-3">Format Options</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Markdown:</strong> Convert the page to clean markdown format
                  </li>
                  <li>
                    <strong>HTML:</strong> Extract the HTML content of the page
                  </li>
                  <li>
                    <strong>Links:</strong> Extract all links from the page
                  </li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">Crawl Options</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Exclude Paths:</strong> Paths to exclude from crawling (comma separated)
                  </li>
                  <li>
                    <strong>Include Only Paths:</strong> Only crawl these paths (comma separated)
                  </li>
                  <li>
                    <strong>Max Depth:</strong> Maximum depth to crawl (1-10)
                  </li>
                  <li>
                    <strong>Page Limit:</strong> Maximum number of pages to crawl (1-500)
                  </li>
                  <li>
                    <strong>Ignore Sitemap:</strong> Ignore the site's sitemap.xml
                  </li>
                  <li>
                    <strong>Ignore Query Parameters:</strong> Treat URLs with different query parameters as the same URL
                  </li>
                  <li>
                    <strong>Allow Backward Links:</strong> Allow crawling links that point to already visited pages
                  </li>
                  <li>
                    <strong>Allow External Links:</strong> Allow crawling links that point to external domains
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

