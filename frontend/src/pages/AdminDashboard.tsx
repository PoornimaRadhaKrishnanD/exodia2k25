import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, DollarSign, Calendar,Plus,Edit,Trash2,Eye,Settings,LogOut,TrendingUp,Activity} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const AdminDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalUsers: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    averageParticipants: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }

    // Load dashboard data
    loadDashboardData(token);
  }, [navigate, toast]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      let dashboardResponse = null;
      
      // Fetch admin stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        dashboardResponse = await statsResponse.json();
        const statsData = dashboardResponse.data?.stats || dashboardResponse.stats || dashboardResponse;
        // Ensure all required properties exist with fallback values
        setStats({
          totalTournaments: statsData?.totalTournaments || 0,
          activeTournaments: statsData?.activeTournaments || 0,
          totalUsers: statsData?.totalUsers || 0,
          totalRevenue: statsData?.totalRevenue || 0,
          thisMonthRevenue: statsData?.thisMonthRevenue || 0,
          averageParticipants: statsData?.averageParticipants || 0
        });
        
        // Also set tournaments if they come from the same API
        if (dashboardResponse.data?.tournaments) {
          setTournaments(Array.isArray(dashboardResponse.data.tournaments) ? dashboardResponse.data.tournaments : []);
        }
      } else {
        console.warn('Stats API failed:', statsResponse.status);
      }

      // Fetch tournaments (only if not already loaded from dashboard API)
      if (!dashboardResponse?.data?.tournaments) {
        const tournamentsResponse = await fetch('http://localhost:5000/api/tournaments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tournamentsResponse.ok) {
          const tournamentsData = await tournamentsResponse.json();
          setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
        } else {
          console.warn('Tournaments API failed:', tournamentsResponse.status);
          setTournaments([]);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/admin/login');
  };

  const handleDeleteTournament = (id: number) => {
    setTournaments(tournaments.filter(t => t.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'ongoing': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <span className="text-2xl font-bold text-gray-900">PlaySwiftPay Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/create-tournament">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage tournaments, users, and track revenue</p>
        </div>

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
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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
                <CardTitle className="text-gray-900">Tournament Management</CardTitle>
                <CardDescription className="text-gray-600">Manage all tournaments and their settings</CardDescription>
              </div>
              <Link to="/admin/create-tournament">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  New Tournament
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div 
                  key={tournament.id} 
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
                          onClick={() => handleDeleteTournament(tournament.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{tournament.participants}/{tournament.maxParticipants} players</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
      )}
    </div>
  );
};

export default AdminDashboard;
