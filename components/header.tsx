import { useState } from "react"
import { Brain, PanelLeft, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { UpgradePlan } from "@/components/upgrade-plan"
import { FeedbackPopup } from "@/components/feedback-popup"
import { SettingsPopup } from "@/components/settings-popup"
import { HelpPopup } from "@/components/help-popup"
import { AuthPopup } from "@/components/auth-popup"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
  onSidebarToggle: () => void
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const isMobile = useIsMobile()
  const { user, signOut } = useAuth()
  
  // Popup states
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Profile dropdown handlers
  const handleUpgrade = () => {
    setIsUpgradeOpen(true)
  }

  const handleFeedback = () => {
    setIsFeedbackOpen(true)
  }

  const handleSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleHelp = () => {
    setIsHelpOpen(true)
  }

  const handleLogout = () => {
    signOut()
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center relative">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className={`absolute bg-gray-900/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl ${
              isMobile ? 'left-4' : '-left-[370px]'
            }`}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {/* Main Header Content */}
          <div className={`flex items-center gap-2 mx-auto ${isMobile ? '' : 'ml-0'}`}>
            {!isMobile && (
              <Brain className="h-8 w-8 text-yellow-400 animate-gradient bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-[length:200%_auto] text-transparent bg-clip-text" />
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
              {isMobile ? "dumbsplain" : "dumbsplain.help"}
            </h1>
            {!isMobile && (
              <p className="ml-4 text-gray-400 text-sm bg-gradient-to-r from-white via-gray-300 to-white bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">
                Understand everything
              </p>
            )}
          </div>

          {/* Auth Section - positioned in far right corner */}
          <div className="absolute right-4">
            {user ? (
              <ProfileDropdown
                onUpgrade={handleUpgrade}
                onFeedback={handleFeedback}
                onSettings={handleSettings}
                onHelp={handleHelp}
                onLogout={handleLogout}
              />
            ) : (
              <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-2 flex items-center justify-center transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Other Popups */}
      <UpgradePlan 
        isOpen={isUpgradeOpen} 
        onClose={() => setIsUpgradeOpen(false)} 
      />
      <FeedbackPopup 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
      <SettingsPopup 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <HelpPopup 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </>
  )
}
