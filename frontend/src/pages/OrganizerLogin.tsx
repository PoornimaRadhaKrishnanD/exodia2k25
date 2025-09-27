import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Mail, Lock, Eye, EyeOff, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrganizerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔐 Attempting organizer login...");
      
      const response = await fetch("http://localhost:5000/api/auth/organizer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Organizer login successful:", data);
        
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        
        toast({
          title: "Organizer Login Successful!",
          description: `Welcome back, ${data.user.name}!`,
        });
        
        navigate("/organizer/dashboard");
      } else {
        console.log("❌ Login failed:", data.error);
        toast({
          title: "Login Failed",
          description: data.error || "Invalid organizer credentials",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-900">
            <Trophy className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold">PlaySwiftPay</span>
          </Link>
        </div>

        {/* Organizer Login Card */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-green-600 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Organizer Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Access the tournament organizer dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Organizer Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter organizer email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Organizer Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter organizer password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Access Organizer Portal"}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an organizer account?{" "}
                <Link to="/organizer/signup" className="text-green-600 hover:text-green-700 font-medium">
                  Register here
                </Link>
              </p>
              
              <div className="space-y-2">
                <Link to="/login" className="text-gray-500 hover:text-green-600 text-sm">
                  <Button variant="outline" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900">
                    User Login
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button variant="outline" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerLogin;
