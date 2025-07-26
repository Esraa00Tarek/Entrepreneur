import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import AnimatedMoneyBackground from "../components/animated-money-background"
import RegisterNavbar from "../components/RegisterNavbar"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import axios from "axios"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      )

      localStorage.setItem("token", data.token)
      localStorage.setItem("userRole", data.user.role)
      localStorage.setItem("user", JSON.stringify(data.user))

      const role = data.user.role?.toLowerCase()

      switch (role) {
        case "entrepreneur":
          window.location.href = "/dashboard/entrepreneur"
          break
        case "investor":
          window.location.href = "/dashboard/investor"
          break
        case "supplier":
          window.location.href = "/dashboard/supplier"
          break
        case "admin":
          window.location.href = "/admin"
          break
        default:
          alert("Unknown role: " + data.user.role)
      }
    } catch (error) {
      if (error.response && error.response.data?.message) {
        alert(error.response.data.message)
      } else {
        alert("Login failed. Please try again.")
      }
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />

      <RegisterNavbar />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-[#1D3557]">Welcome Back</CardTitle>
            <CardDescription className="text-[#457B9D] text-lg">Sign in to your Elevante account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-[#1D3557] font-medium">
                  Email or Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] w-5 h-5" />
                  <Input
                    id="login"
                    name="login"
                    type="text"
                    placeholder="Enter your email or username"
                    value={formData.login}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-[#A8DADC] focus:border-[#457B9D] focus:ring-[#457B9D]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1D3557] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-[#A8DADC] focus:border-[#457B9D] focus:ring-[#457B9D]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-[#1D3557]">
                  <input type="checkbox" className="rounded border-[#A8DADC] text-[#457B9D] focus:ring-[#457B9D]" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#457B9D] hover:text-[#1D3557] transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1D3557] hover:bg-[#457B9D] text-white font-semibold text-lg transition-colors duration-200"
              >
                Sign In
              </Button>
            </form>

            <div className="text-center">
              <p className="text-[#457B9D]">
                Don't have an account?{" "}
                <Link to="/select-role" className="text-[#1D3557] hover:text-[#457B9D] font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 