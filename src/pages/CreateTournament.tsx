import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Save,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    date: "",
    registrationDeadline: "",
    location: "",
    maxParticipants: "",
    entryFee: "",
    prizePool: "",
    rules: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast({
        title: "Tournament Created!",
        description: `${formData.name} has been successfully created.`,
      });
      navigate("/admin/dashboard");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Create Tournament</span>
            </div>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Create New Tournament</h1>
            <p className="text-xl text-gray-600">Set up a new tournament for participants to join</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Basic Information</CardTitle>
                <CardDescription className="text-gray-600">Essential tournament details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Tournament Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter tournament name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700">Sport Type *</Label>
                    <Select value={formData.type} onValueChange={handleSelectChange}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select sport type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Badminton">Badminton</SelectItem>
                        <SelectItem value="Volleyball">Volleyball</SelectItem>
                        <SelectItem value="Table Tennis">Table Tennis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the tournament..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Location */}
            <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-5 w-5" />
                  Schedule & Location
                </CardTitle>
                <CardDescription className="text-gray-600">When and where the tournament will take place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {["date", "registrationDeadline", "location"].map((field) => {
                    const iconMap: any = {
                      date: <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                      registrationDeadline: <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                      location: <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                    };
                    return (
                      <div key={field} className="space-y-2 relative">
                        <Label htmlFor={field} className="text-gray-700">
                          {field === "date" ? "Tournament Date *" : field === "registrationDeadline" ? "Registration Deadline *" : "Location *"}
                        </Label>
                        {iconMap[field]}
                        <Input
                          id={field}
                          name={field}
                          type={field !== "location" ? "date" : "text"}
                          placeholder={field === "location" ? "Tournament venue" : ""}
                          value={formData[field as keyof typeof formData]}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Participants & Fees */}
            <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5" />
                  Participants & Fees
                </CardTitle>
                <CardDescription className="text-gray-600">Set participant limits and payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {["maxParticipants", "entryFee", "prizePool"].map((field) => {
                    const iconMap: any = {
                      maxParticipants: <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                      entryFee: <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                      prizePool: <Trophy className="absolute left-3 top-3 h-4 w-4 text-gray-400" />,
                    };
                    const placeholderMap: any = {
                      maxParticipants: "e.g., 32",
                      entryFee: "e.g., 500",
                      prizePool: "e.g., 15000",
                    };
                    return (
                      <div key={field} className="space-y-2 relative">
                        <Label htmlFor={field} className="text-gray-700">
                          {field === "maxParticipants" ? "Max Participants *" : field === "entryFee" ? "Entry Fee (₹) *" : "Prize Pool (₹) *"}
                        </Label>
                        {iconMap[field]}
                        <Input
                          id={field}
                          name={field}
                          type="number"
                          placeholder={placeholderMap[field]}
                          value={formData[field as keyof typeof formData]}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rules & Additional Info */}
            <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Rules & Additional Information</CardTitle>
                <CardDescription className="text-gray-600">Tournament rules and special instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="rules" className="text-gray-700">Tournament Rules</Label>
                  <Textarea
                    id="rules"
                    name="rules"
                    placeholder="Enter tournament rules and regulations..."
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={6}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Link to="/admin/dashboard">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" disabled={loading}>
                {loading ? (
                  <>Creating Tournament...</>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Tournament
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTournament;
