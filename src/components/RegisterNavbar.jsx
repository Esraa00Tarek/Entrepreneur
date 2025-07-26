import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function RegisterNavbar() {
  return (
    <header className="relative z-10 p-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-[#1D3557] hover:text-[#457B9D] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Home</span>
        </Link>
        <Link to="/">
          <img
            src="/namelogo.png"
            alt="Elevante Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>
    </header>
  )
} 