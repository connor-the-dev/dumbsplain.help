import { Header } from "@/components/header"
import { ExplanationApp } from "@/components/explanation-app"

export default function Home() {
  return (
    <main className="flex flex-col bg-gray-950">
      <Header />
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <ExplanationApp />
      </div>
    </main>
  )
}
