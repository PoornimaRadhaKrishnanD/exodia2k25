import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Calendar, Users, DollarSign, MapPin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrganizerCreateTournament = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    endDate: "",
    maxParticipants: "",
    entryFee: "",
    description: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "organizer") {
      toast({
        title: "Access Denied",
        description: "Please login as organizer to create tournaments",
        variant: "destructive",
      });
      navigate("/organizer/login");
      return;
    }
  }, [navigate, toast]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { name, type, date, maxParticipants, entryFee } = formData;
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tournament name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!type) {
      toast({
        title: "Validation Error",
        description: "Tournament type is required",
        variant: "destructive",
      });
      return false;
    }

    if (!date) {
      toast({
        title: "Validation Error",
        description: "Tournament date is required",
        variant: "destructive",
      });
      return false;
    }

    // Check if date is in the future
    const tournamentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tournamentDate < today) {
      toast({
        title: "Validation Error",
        description: "Tournament date must be in the future",
        variant: "destructive",
      });
      return false;
    }

    if (!maxParticipants || parseInt(maxParticipants) < 2) {
      toast({
        title: "Validation Error",
        description: "Minimum 2 participants required",
        variant: "destructive",
      });
      return false;
    }

    if (!entryFee || parseFloat(entryFee) < 0) {
      toast({
        title: "Validation Error",
        description: "Entry fee must be 0 or positive",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🎯 Creating tournament:", formData);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/organizer/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/organizer/tournaments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants),
          entryFee: parseFloat(formData.entryFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Tournament created successfully:", data);
        
        toast({
          title: "Tournament Created!",
          description: `${formData.name} has been successfully created.`,
        });
        
        // Reset form
        setFormData({
          name: "",
          type: "",
          date: "",
          endDate: "",
          maxParticipants: "",
          entryFee: "",
          description: "",
          location: "",
        });
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate("/organizer/dashboard");
        }, 1500);
        
      } else {
        console.log("❌ Tournament creation failed:", data.error);
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create tournament",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("❌ Tournament creation error:", err);
      toast({
        title: "Connection Error",
        description: "Unable to create tournament. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Create Tournament</CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details below to create a new tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tournament Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter tournament name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tournament Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Volleyball">Volleyball</SelectItem>
                        <SelectItem value="Badminton">Badminton</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter tournament description (optional)"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Schedule & Location</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Start Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter tournament location (optional)"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Participants & Fees */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Participants & Fees</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Maximum Participants *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="maxParticipants"
                        type="number"
                        placeholder="Enter max participants"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                        className="pl-10"
                        min="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee (₹) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="entryFee"
                        type="number"
                        placeholder="Enter entry fee"
                        value={formData.entryFee}
                        onChange={(e) => handleInputChange("entryFee", e.target.value)}
                        className="pl-10"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating Tournament..." : "Create Tournament"}
              </Button>
            </form>

            {/* Back to Dashboard */}
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/organizer/dashboard")}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerCreateTournament;
