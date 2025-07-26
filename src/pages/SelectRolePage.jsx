import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, TrendingUp, Users, Lightbulb, CheckCircle, Star, Building, DollarSign } from "lucide-react"
import AnimatedMoneyBackground from "../components/animated-money-background"
import RegisterNavbar from "../components/RegisterNavbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Redirect to profile completion based on selected role
    switch (selectedRole) {
      case "entrepreneur":
        navigate("/complete-profile/entrepreneur")
        break
      case "investor":
        navigate("/complete-profile/investor")
        break
      case "supplier":
        navigate("/complete-profile/supplier")
        break
      default:
        navigate("/dashboard")
    }
  }

  const roles = [
    {
      id: "entrepreneur",
      title: "Entrepreneur",
      subtitle: "Launch Your Startup",
      description: "Turn your innovative ideas into successful businesses with our comprehensive startup toolkit.",
      icon: <Lightbulb className="w-8 h-8" />,
      color: "from-slate-600 to-slate-700",
      features: [
        "Business plan templates",
        "Investor matching",
        "Mentorship programs",
        "Legal document templates",
        "Market research tools",
        "Funding guidance",
      ],
      benefits: [
        "Access to 500+ investors",
        "Free legal consultation",
        "24/7 mentor support",
        "Startup community access",
      ],
      popular: false,
    },
    {
      id: "investor",
      title: "Investor",
      subtitle: "Discover Opportunities",
      description: "Find and invest in promising startups while providing valuable mentorship and guidance.",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-slate-600 to-slate-700",
      features: [
        "Startup discovery platform",
        "Due diligence tools",
        "Portfolio management",
        "Investment analytics",
        "Direct founder communication",
        "Market insights",
      ],
      benefits: ["1000+ verified startups", "Advanced filtering tools", "Investment tracking", "Exclusive deal flow"],
      popular: false,
    },
    {
      id: "supplier",
      title: "Supplier",
      subtitle: "Grow Your Business",
      description: "Connect with startups and established businesses looking for your products and services.",
      icon: <Users className="w-8 h-8" />,
      color: "from-slate-600 to-slate-700",
      features: [
        "Business marketplace",
        "Lead generation tools",
        "Service catalog management",
        "Client communication hub",
        "Payment processing",
        "Review system",
      ],
      benefits: ["Access to growing startups", "Verified business leads", "Secure payment system", "Marketing support"],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />

      <RegisterNavbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1D3557] mb-2">Choose Your Role</h1>
          <p className="text-xl text-[#457B9D] max-w-2xl mx-auto leading-relaxed">
            Select your role to unlock personalized features and connect with the right community for your goals.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 ${
                selectedRole === role.id
                  ? "border-[#1D3557] shadow-2xl scale-105"
                  : "border-transparent hover:border-[#A8DADC]"
              } bg-white/95 backdrop-blur-sm overflow-hidden`}
              onClick={() => handleRoleSelect(role.id)}
            >
              {role.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-[#1D3557] text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${role.color}`}></div>

              <CardHeader className="text-center pb-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${role.color} text-white mb-4 mx-auto`}
                >
                  {role.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-[#1D3557] mb-2">{role.title}</CardTitle>
                <CardDescription className="text-[#457B9D] font-semibold text-lg">{role.subtitle}</CardDescription>
                <p className="text-[#1D3557] mt-2 leading-relaxed">{role.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-[#1D3557]">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Benefits
                  </h4>
                  <ul className="space-y-2">
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-[#457B9D]">
                        <Star className="w-4 h-4 text-[#457B9D] flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <div className="w-full max-w-md mx-auto">
            {selectedRole ? (
              <Link
                to={`/register/${selectedRole}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  className="w-full h-14 text-lg font-semibold transition-all duration-300 transform bg-[#1D3557] hover:bg-[#457B9D] text-white hover:scale-105"
                >
                  {`Sign Up as ${roles.find(r => r.id === selectedRole)?.title}`}
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold transition-all duration-300 transform bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
