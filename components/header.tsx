import { Brain } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function Header() {
  const isMobile = useIsMobile()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center">
        <div className={`flex items-center gap-2 ${isMobile ? 'ml-16' : ''}`}>
          {!isMobile && (
            <Brain className="h-8 w-8 text-yellow-400 animate-gradient bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-[length:200%_auto] text-transparent bg-clip-text" />
          )}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
            dumbsplain.help
          </h1>
        </div>
        {!isMobile && (
          <p className="ml-4 text-gray-400 text-sm">Understand anything</p>
        )}
      </div>
    </header>
  )
}
