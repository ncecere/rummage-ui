import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">Examples</h1>
        <p className="text-muted-foreground mb-8">See examples of what you can do with Rummage</p>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Blog to Markdown</CardTitle>
              <CardDescription>Convert a blog to markdown for offline reading</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  This example shows how to convert a blog to markdown for offline reading or importing into your
                  note-taking system.
                </p>
                <h3 className="text-lg font-medium mt-6 mb-3">Steps:</h3>
                <ol className="space-y-2">
                  <li>Enter the blog's URL (e.g., https://example.com/blog)</li>
                  <li>Select "Markdown" format</li>
                  <li>Set "Include Only Paths" to "/blog, /posts"</li>
                  <li>Set "Max Depth" to 3</li>
                  <li>Enable "Only extract main content" to remove headers, footers, and sidebars</li>
                  <li>Click "Crawl Site"</li>
                </ol>
                <div className="mt-6">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileDown className="mr-2 h-4 w-4" />
                    Try this example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentation to Markdown</CardTitle>
              <CardDescription>Convert documentation for offline reference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  This example demonstrates how to convert technical documentation to markdown for offline reference or
                  importing into your knowledge base.
                </p>
                <h3 className="text-lg font-medium mt-6 mb-3">Steps:</h3>
                <ol className="space-y-2">
                  <li>Enter the documentation URL (e.g., https://example.com/docs)</li>
                  <li>Select "Markdown" format</li>
                  <li>Set "Include Only Paths" to "/docs, /reference, /guide"</li>
                  <li>Set "Max Depth" to 5</li>
                  <li>Set "Page Limit" to 200</li>
                  <li>Enable "Ignore Query Parameters"</li>
                  <li>Click "Crawl Site"</li>
                </ol>
                <div className="mt-6">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileDown className="mr-2 h-4 w-4" />
                    Try this example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extract All Links</CardTitle>
              <CardDescription>Extract all links from a website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>This example shows how to extract all links from a website for analysis or further processing.</p>
                <h3 className="text-lg font-medium mt-6 mb-3">Steps:</h3>
                <ol className="space-y-2">
                  <li>Enter the website URL (e.g., https://example.com)</li>
                  <li>Select only the "Links" format</li>
                  <li>Set "Max Depth" to 2</li>
                  <li>Enable "Allow External Links" if you want to include links to other domains</li>
                  <li>Click "Crawl Site"</li>
                </ol>
                <div className="mt-6">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileDown className="mr-2 h-4 w-4" />
                    Try this example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

