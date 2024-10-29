'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopilotTextarea } from '@copilotkit/react-textarea';
import "@copilotkit/react-textarea/styles.css";
import "@copilotkit/react-ui/styles.css";
import { Check, Copy, Download, Loader2, Maximize2, Menu, Moon, Share2, Sun, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from 'react';
import Notification from '../components/Notification';

type Snippet = {
  id: string
  language: string
  prompt: string
  code: string
  explanation: string
}

export default function CodeSnippetSuggester() {
  const [prompt, setPrompt] = useState<string>('')
  const [language, setLanguage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [snippet, setSnippet] = useState('')
  const [explanation, setExplanation] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [recentSnippets, setRecentSnippets] = useState<Snippet[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const storedSnippets = localStorage.getItem('recentSnippets')
    if (storedSnippets) {
      setRecentSnippets(JSON.parse(storedSnippets))
    }
  }, [])

  const shortenPrompt = (prompt: string, maxLength: number = 30) => {
    if (prompt.length <= maxLength) return prompt
    return prompt.substring(0, maxLength - 3) + '...'
  }

  useEffect(() => {
    const storedSnippets = localStorage.getItem('recentSnippets')
    if (storedSnippets) {
      setRecentSnippets(JSON.parse(storedSnippets))
    }
    const storedDarkMode = localStorage.getItem('darkMode')
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode))
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language })
      })

      if (!response.ok) {
        throw new Error('Failed to generate snippet')
      }

      const data = await response.json()
      setSnippet(data.code)
      setExplanation(data.explanation)

      const newSnippet: Snippet = {
        id: Date.now().toString(),
        language,
        prompt,
        code: data.code,
        explanation: data.explanation
      }

      const updatedSnippets = [newSnippet, ...recentSnippets.slice(0, 9)]
      setRecentSnippets(updatedSnippets)
      localStorage.setItem('recentSnippets', JSON.stringify(updatedSnippets))
    } catch (error) {
      console.error('Error generating snippet:', error)
      // toast({
      //   title: "Error",
      //   description: "Failed to generate snippet. Please try again.",
      //   variant: "destructive",
      // })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet);
    setIsCopied(true);
    setNotification("Snippet copied to clipboard!");
  
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); 
    // toast({
    //   title: "Copied to clipboard",
    //   description: "The code snippet has been copied to your clipboard.",
    // })
  }

  const shareSnippet = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Code Snippet',
          text: `Check out this code snippet:\n\n${snippet}`,
          url: window.location.href,
        });
        setNotification("Share link generated and copied to clipboard!");
      } catch (error) {
        console.error("Error sharing:", error);
        setNotification("Failed to share the snippet.");
      }
    } else {
      setNotification("Sharing is not supported in this browser.");
    }
  }

  const downloadSnippet = () => {
    const blob = new Blob([snippet], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snippet.${language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openFullscreenSnippet = () => {
    const encodedSnippet = encodeURIComponent(snippet)
    const encodedLanguage = encodeURIComponent(language)
    window.open(`fullscreen-snippet?snippet=${encodedSnippet}&language=${encodedLanguage}`, '_blank')
  }

  const loadSnippet = (selectedSnippet: Snippet) => {
    setPrompt(selectedSnippet.prompt)
    setLanguage(selectedSnippet.language)
    setSnippet(selectedSnippet.code)
    setExplanation(selectedSnippet.explanation);
  }

  const deleteSnippet = (id: string) => {
    const updatedSnippets = recentSnippets.filter(snippet => snippet.id !== id);
    setRecentSnippets(updatedSnippets);
    localStorage.setItem('recentSnippets', JSON.stringify(updatedSnippets));
  };
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Card className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}>
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Snippets</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-5rem)]">
    {recentSnippets.map((snippet, index) => (
      <div key={snippet.id}>
        <div className="p-1 group flex items-center">
            <div className="flex-grow">
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => loadSnippet(snippet)}
              >
                <div>
                  <div className="font-medium">{shortenPrompt(snippet.prompt)}</div>
                  <div className="text-sm text-muted-foreground">{snippet.language}</div>
                </div>
              </Button>
            </div>
            <button
              onClick={() => deleteSnippet(snippet.id)}
              className="ml-2 opacity-20 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Delete snippet"
            >
              <Trash className="h-5 w-5 text-red-500" />
            </button>
        </div>
        {index < recentSnippets.length - 1 && <Separator className="my-2" />}
      </div>
    ))}
</ScrollArea>
        </CardContent>
      </Card>
      <main className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Button variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-700 transition duration-200">
            <Menu className="h-6 w-6" />
          </Button>
          <h3 className="text-lg font-bold flex-grow px-2">CopilotKit Coder</h3>
          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)} className="hover:bg-gray-700 transition duration-200">
            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <Card className="mb-4 pt-2">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-semibold font-serif" >
                    Describe the code snippet you need
                  </label>
                  <CopilotTextarea
                    ref={textareaRef}
                    id="prompt"
                    placeholder="Describe the code snippet you need..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-md"
                    required
                    autosuggestionsConfig={{
                      textareaPurpose: "asking code snippets regarding DSA or some logic",
                      chatApiConfigs: {},
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-semibold font-serif">
                    Select a language
                  </label>
                  <Select value={language} onValueChange={setLanguage} required>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Choose a programming language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Snippet...
                    </>
                  ) : (
                    'Generate Snippet'
                  )}
                </Button>
              </form>
            </CardContent>
            {snippet && (
              <CardFooter className="flex flex-col items-stretch">
                <Tabs defaultValue="snippet" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="snippet">Snippet</TabsTrigger>
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="snippet" className="mt-4">
                    <div className="relative">
                      <pre
                        className="bg-muted p-4 rounded-md overflow-x-auto"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        <code>{snippet}</code>
                      </pre>
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-500" /> // Show tick icon when copied
                          ) : (
                            <Copy className="h-4 w-4" /> // Show copy icon otherwise
                          )}
                          <span className="sr-only">Copy to clipboard</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={shareSnippet}>
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share snippet</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={downloadSnippet}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download snippet</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={openFullscreenSnippet}>
                          <Maximize2 className="h-4 w-4" />
                          <span className="sr-only">View in full screen</span>
                        </Button>
                      </div>
                      {notification && (
                        <Notification message={notification} onClose={() => setNotification(null)} />
                      )}
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-sm">Font Size:</span>
                      <Slider
                        min={10}
                        max={24}
                        step={1}
                        value={[fontSize]}
                        onValueChange={([value]) => setFontSize(value)}
                        className="w-[200px]"
                      />
                      <span className="text-sm">{fontSize}px</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="explanation" className="mt-4">
                    <div className="bg-muted p-4 rounded-md">
                      <p>{explanation}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            )}
          </Card>
          {/* <CopilotChat
            instructions={"You are a code snippet generator."}
            labels={{
                title: "Your Coding Bro",
                initial: "Hi! What lines of code are we playing through today?",
            }}
          /> */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Chat with Copilot</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] mb-4" ref={chatContainerRef}>
                {visibleMessages.map((message, index) => (
                  <div key={index} className={`mb-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${index % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <code>{message.content}</code>
                  </div>
                </div>
                ))}
              </ScrollArea>
              <div className="flex items-center space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendChatMessage()
                    }
                  }}
                  className="flex-grow"
                />
                <Button onClick={sendChatMessage} disabled={isChatLoading}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </div>
  )
}