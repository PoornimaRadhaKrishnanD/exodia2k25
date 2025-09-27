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
      toast({ title: "Password Mismatch", description: "Passwords do not match", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to register");

      toast({ title: "Account Created!", description: "Welcome! Please verify your email." });
      navigate("/dashboard");

    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-900">
            <Trophy className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold">PlaySwiftPay</span>
          </Link>
        </div>

        <Card className="bg-white border shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join the tournament platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {["name", "email", "phone"].map((field) => {
                const icons: any = { name: <User />, email: <Mail />, phone: <Phone /> };
                return (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <div className="relative">
                      {icons[field]}
                      <Input
                        id={field}
                        name={field}
                        type={field === "email" ? "email" : "text"}
                        placeholder={`Enter ${field}`}
                        value={formData[field as keyof typeof formData]}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                );
              })}

              {["password", "confirmPassword"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field === "password" ? "Password" : "Confirm Password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={field}
                      name={field}
                      type={field === "password" && showPassword ? "text" : "password"}
                      placeholder={field === "password" ? "Enter password" : "Confirm password"}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    {field === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
