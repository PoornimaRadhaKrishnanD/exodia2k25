import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, CreditCard, Shield, Calendar, Star } from "lucide-react";
import tournamentHero from "../assets/tournament-hero.jpg";
import paymentHero from "../assets/payment-hero.jpg";
import dashboardHero from "../assets/dashboard-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">PlaySwiftPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center pt-20 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <img 
          src={tournamentHero} 
          alt="Tournament Sports Arena" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/90"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-gray-900">
            Digital Tournament
            <span className="block text-blue-600">Management Platform</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 animate-fade-in">
            Book tournaments, manage payments, and organize competitions - all in one platform with secure online payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/signup">
              <Button size="lg" className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Users className="h-5 w-5" /> Join Tournament
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="secondary" size="lg" className="flex items-center gap-2 text-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white">
                <Shield className="h-5 w-5" /> Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose PlaySwiftPay?</h2>
            <p className="text-xl text-gray-600">Complete tournament management with digital-first approach</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[{
              icon: <CreditCard className="h-8 w-8 text-white" />,
              title: "100% Online Payments",
              desc: "Secure digital payments only - UPI, Cards, Digital Wallets. No cash accepted.",
              img: paymentHero
            },{
              icon: <Trophy className="h-8 w-8 text-white" />,
              title: "Tournament Management",
              desc: "Create, manage, and participate in tournaments with real-time updates and notifications.",
              img: dashboardHero
            },{
              icon: <Calendar className="h-8 w-8 text-blue-600" />,
              title: "Smart Scheduling",
              desc: "Calendar interface for booking slots, avoiding conflicts, and managing availability.",
              img: null
            }].map((feature, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.desc}</p>
                {feature.img && <img src={feature.img} alt={feature.title} className="rounded-lg w-full" />}
                {!feature.img && <div className="bg-gray-50 rounded-lg p-6 border border-gray-200"><Calendar className="h-20 w-20 mx-auto text-blue-600" /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              {value:"95%", label:"Payment Success Rate"},
              {value:"1000+", label:"Tournaments Hosted"},
              {value:"5000+", label:"Active Users"},
              {value:"70%", label:"Management Efficiency"}
            ].map((stat,i)=>(
              <div key={i}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of tournament organizers and players using PlaySwiftPay
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2">
              <Star className="h-5 w-5" /> Start Your Journey
            </Button>
          </Link>
          <Link to="/tournaments">
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">Browse Tournaments</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 text-gray-600">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PlaySwiftPay</span>
            </div>
            <p className="text-gray-600">
              Digital tournament management platform with 100% online payments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/tournaments" className="hover:text-blue-600">Browse Tournaments</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link to="/features" className="hover:text-blue-600">Features</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-blue-600">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 PlaySwiftPay. All rights reserved. Built for Kongu Engineering College - ISTE Student Chapter</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
