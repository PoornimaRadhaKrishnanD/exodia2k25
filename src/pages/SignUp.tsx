import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Mock signup
    setTimeout(() => {
      toast({
        title: "Account Created!",
        description: "Welcome to PlaySwiftPay. Please verify your email.",
      });
      navigate("/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8 z-10 relative">
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-900">
            <Trophy className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold">PlaySwiftPay</span>
          </Link>
        </div>

        {/* SignUp Card */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join the tournament platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {[
                { id: "name", label: "Full Name", type: "text", icon: <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> },
                { id: "email", label: "Email", type: "email", icon: <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> },
                { id: "phone", label: "Phone Number", type: "tel", icon: <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> },
              ].map((field) => (
                <div className="space-y-2" key={field.id}>
                  <Label htmlFor={field.id} className="text-gray-700">{field.label}</Label>
                  <div className="relative">
                    {field.icon}
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
