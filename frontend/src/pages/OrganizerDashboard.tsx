import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  TrendingUp,
  Activity,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface Tournament {
  _id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  totalRevenue: number;
}

interface OrganizerStats {
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  ongoingTournaments: number;
  completedTournaments: number;
  totalParticipants: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  averageParticipants: number;
}

const OrganizerDashboard = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<OrganizerStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    upcomingTournaments: 0,
    ongoingTournaments: 0,
    completedTournaments: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    averageParticipants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Organizer");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const storedUserName = localStorage.getItem("userName");

    if (!token || userRole !== "organizer") {
      toast({
        title: "Access Denied",
        description: "Please login as organizer to access this page",
        variant: "destructive",
      });
      navigate("/organizer/login");
      return;
    }

    if (storedUserName) {
      setUserName(storedUserName);
    }

    fetchOrganizerData(token);
  }, [navigate, toast]);

  const fetchOrganizerData = async (token: string) => {
    try {
      setLoading(true);
      console.log("📊 Fetching organizer dashboard data...");

      // Fetch organizer stats
      const statsResponse = await fetch("http://localhost:5000/api/organizer/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setStats(statsData.data);
        console.log("✅ Stats fetched:", statsData.data);
      } else {
        console.error("❌ Failed to fetch stats:", statsData.error);
      }

      // Fetch organizer tournaments
      const tournamentsResponse = await fetch("http://localhost:5000/api/organizer/tournaments?limit=20", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const tournamentsData = await tournamentsResponse.json();

      if (tournamentsResponse.ok) {
        setTournaments(tournamentsData.data);
        console.log("✅ Tournaments fetched:", tournamentsData.data);
      } else {
        console.error("❌ Failed to fetch tournaments:", tournamentsData.error);
        toast({
          title: "Error",
          description: "Failed to fetch tournaments data",
          variant: "destructive",
        });
      }

    } catch (err) {
      console.error("❌ Error fetching organizer data:", err);
      toast({
        title: "Connection Error",
        description: "Unable to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("🗑️ Deleting tournament:", id);
      
      const response = await fetch(`http://localhost:5000/api/organizer/tournaments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTournaments(tournaments.filter((t) => t._id !== id));
        toast({
          title: "Tournament Deleted",
          description: data.message || "Tournament has been deleted successfully",
        });
        
        // Refresh stats
        fetchOrganizerData(token);
      } else {
        console.error("❌ Delete failed:", data.error);
        toast({
          title: "Delete Failed",
          description: data.error || "Failed to delete tournament",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast({
        title: "Connection Error",
        description: "Unable to delete tournament. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    
    navigate("/organizer/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "ongoing":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <span className="text-2xl font-bold text-gray-900">PlaySwiftPay Organizer</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {userName}</span>
            <Link to="/organizer/create-tournament">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600">Manage your tournaments and track revenue</p>
        </div>

        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Tournaments</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTournaments}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Tournaments</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeTournaments}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tournament Management */}
            <Card className="bg-white border-gray-200 rounded-xl shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Your Tournaments</CardTitle>
                    <CardDescription className="text-gray-600">Manage your tournaments and settings</CardDescription>
                  </div>
                  <Link to="/organizer/create-tournament">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
                      <Plus className="h-4 w-4 mr-2" />
                      New Tournament
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {tournaments.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tournaments Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first tournament to get started</p>
                    <Link to="/organizer/create-tournament">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Tournament
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament._id}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{tournament.name}</h4>
                            <p className="text-sm text-gray-500">{tournament.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(tournament.status)} rounded-full px-2 py-1`}>
                              {tournament.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-red-600"
                                onClick={() => handleDeleteTournament(tournament._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{new Date(tournament.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {tournament.participants}/{tournament.maxParticipants} players
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Entry: ₹{tournament.entryFee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Revenue: ₹{tournament.totalRevenue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;