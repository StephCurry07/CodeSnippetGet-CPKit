'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { useState } from "react"
import Notification from "@/components/Notification"

export default function FullscreenSnippet() {
  const searchParams = useSearchParams()
  const snippet = searchParams.get('snippet')
  const language = searchParams.get('language')
  const [notification, setNotification] = useState<string | null>(null);
  const copyToClipboard = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet)

      setNotification("Snippet copied to clipboard!");
  
      // toast({
      //   title: "Copied to clipboard",
      //   description: "The code snippet has been copied to your clipboard.",
      // })
    }
  }

  if (!snippet || !language) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No snippet or language provided.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fullscreen Code Snippet</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code className={`language-${language}`}>{decodeURIComponent(snippet)}</code>
          </pre>
        </CardContent>
      </Card>
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}