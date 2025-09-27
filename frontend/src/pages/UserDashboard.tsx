import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Calendar, 
  CreditCard, 
  Users, 
  Settings, 
  Plus,
  Bell,
  LogOut,
  Star,
  DollarSign,
  Award
} from "lucide-react";

const UserDashboard = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    joinedTournaments: 12,
    wonTournaments: 3,
    totalSpent: 2500,
  });

  const [myTournaments] = useState([
    {
      id: 1,
      name: "Cricket Championship 2024",
      status: "upcoming",
      date: "2024-01-15",
      participants: 32,
      entryFee: 500,
      prize: 15000,
      type: "Cricket"
    },
    {
      id: 2,
      name: "Football League Finals",
      status: "ongoing",
      date: "2024-01-10",
      participants: 16,
      entryFee: 750,
      prize: 20000,
      type: "Football"
    },
    {
      id: 3,
      name: "Basketball Tournament",
      status: "completed",
      date: "2023-12-20",
      participants: 8,
      entryFee: 300,
      prize: 5000,
      type: "Basketball",
      result: "Winner"
    },
  ]);

  const [availableTournaments] = useState([
    {
      id: 4,
      name: "Tennis Open 2024",
      date: "2024-01-25",
      participants: 24,
      maxParticipants: 32,
      entryFee: 400,
      prize: 12000,
      type: "Tennis"
    },
    {
      id: 5,
      name: "Badminton Championship",
      date: "2024-02-01",
      participants: 18,
      maxParticipants: 24,
      entryFee: 350,
      prize: 8000,
      type: "Badminton"
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-primary/10 text-primary';
      case 'ongoing': return 'bg-secondary/10 text-secondary';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Link to="/login">
              <Button variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </Link>
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
                    <Button variant="hero" className="w-full">
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
                <Link to="/profile">
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