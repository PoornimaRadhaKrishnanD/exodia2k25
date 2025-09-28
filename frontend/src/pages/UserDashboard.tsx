import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NotificationDropdown from "@/components/NotificationDropdown";
import { 
  Trophy, 
  Calendar, 
  CreditCard, 
  Users, 
  Settings, 
  Plus,
  LogOut,
  Star,
  DollarSign,
  Award
} from "lucide-react";

const UserDashboard = () => {
  const [user, setUser] = useState({
    name: "Loading...",
    email: "loading@example.com",
    joinedTournaments: 0,
    wonTournaments: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          toast({
            title: "Login Required",
            description: "Please login to access your dashboard",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        
        // Get additional user stats from backend
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          setUser({
            name: parsedUser.name,
            email: parsedUser.email,
            joinedTournaments: profileData.user?.joinedTournaments || 0,
            wonTournaments: profileData.user?.wonTournaments || 0,
            totalSpent: profileData.user?.totalSpent || 0,
          });
        } else {
          // Use basic data from localStorage if profile API fails
          setUser({
            name: parsedUser.name,
            email: parsedUser.email,
            joinedTournaments: 0,
            wonTournaments: 0,
            totalSpent: 0,
          });
        }

        // Load tournaments
        await loadTournaments(token, parsedUser._id || parsedUser.id);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const loadTournaments = async (token: string, userId: string) => {
      try {
        // Load all tournaments
        const tournamentsResponse = await fetch('http://localhost:5000/api/tournaments');
        const tournamentsData = await tournamentsResponse.json();
        const allTournaments = tournamentsData.data || tournamentsData;

        if (Array.isArray(allTournaments)) {
          // Filter tournaments where user is registered
          const userTournaments = allTournaments.filter(tournament => 
            tournament.registeredUsers?.some((reg: any) => 
              reg.userId === userId || reg.userId._id === userId
            )
          );

          // Available tournaments (upcoming, not full, user not registered)
          const availableTournaments = allTournaments.filter(tournament => 
            tournament.status === 'upcoming' &&
            tournament.participants < tournament.maxParticipants &&
            !tournament.registeredUsers?.some((reg: any) => 
              reg.userId === userId || reg.userId._id === userId
            )
          ).slice(0, 3); // Show only first 3

          setMyTournaments(userTournaments);
          setAvailableTournaments(availableTournaments);
        }
      } catch (error) {
        console.error('Error loading tournaments:', error);
        // Keep empty arrays as fallback
      }
    };

    loadUserData();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [availableTournaments, setAvailableTournaments] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-primary/10 text-primary';
      case 'ongoing': return 'bg-secondary/10 text-secondary';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading your dashboard...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">PlaySwiftPay</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <Link to="/profile-settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Manage your tournaments and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="tournament-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tournaments Joined</p>
                  <p className="text-2xl font-bold">{user.joinedTournaments}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="tournament-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tournaments Won</p>
                  <p className="text-2xl font-bold">{user.wonTournaments}</p>
                </div>
                <Award className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="tournament-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₹{user.totalSpent}</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="tournament-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">25%</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle>My Tournaments</CardTitle>
              <CardDescription>Track your tournament participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTournaments.map((tournament) => (
                  <div key={tournament.id} className="tournament-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{tournament.name}</h4>
                        <p className="text-sm text-muted-foreground">{tournament.type}</p>
                      </div>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {tournament.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.participants} players
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        ₹{tournament.entryFee}
                      </span>
                    </div>
                    {tournament.result && (
                      <div className="mt-2">
                        <Badge className="bg-accent/10 text-accent">
                          🏆 {tournament.result}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle>Available Tournaments</CardTitle>
              <CardDescription>Join new tournaments and compete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableTournaments.map((tournament) => (
                  <div key={tournament.id} className="tournament-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{tournament.name}</h4>
                        <p className="text-sm text-muted-foreground">{tournament.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-accent">Prize: ₹{tournament.prize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {tournament.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        ₹{tournament.entryFee}
                      </span>
                    </div>
                    <Button 
                      variant="hero" 
                      className="w-full text-black hover:text-black"
                      onClick={() => navigate('/tournaments')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Join Tournament
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/tournaments">
                  <Button variant="outline" className="w-full h-16">
                    <Trophy className="h-6 w-6 mr-2" />
                    Browse All Tournaments
                  </Button>
                </Link>
                <Link to="/payments">
                  <Button variant="outline" className="w-full h-16">
                    <CreditCard className="h-6 w-6 mr-2" />
                    Payment History
                  </Button>
                </Link>
                <Link to="/profile-settings">
                  <Button variant="outline" className="w-full h-16">
                    <Settings className="h-6 w-6 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;