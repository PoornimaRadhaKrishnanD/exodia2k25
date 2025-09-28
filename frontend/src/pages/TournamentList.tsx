import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import { 
  Trophy, 
  Users, 
  Calendar, 
  CreditCard, 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Award
} from "lucide-react";

const TournamentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle tournament registration form
  const handleJoinTournament = (tournament: any) => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to join tournaments",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setSelectedTournament(tournament);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = async () => {
    // Refresh tournaments to update participant count
    try {
      const updatedResponse = await fetch("http://localhost:5000/api/tournaments");
      const updatedData = await updatedResponse.json();
      const updatedTournaments = updatedData.data || updatedData;
      setTournaments(Array.isArray(updatedTournaments) ? updatedTournaments : []);
    } catch (error) {
      console.error('Error refreshing tournaments:', error);
    }
  };

  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
    setSelectedTournament(null);
  };

  // Fetch tournaments from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/tournaments")
      .then(res => res.json())
      .then(response => {
        // Handle both old and new API response formats
        const tournamentsData = response.data || response;
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tournaments:", err);
        setTournaments([]);
        setLoading(false);
      });
  }, []);

  // Input validation for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Prevent XSS by sanitizing input
    const sanitizedValue = value.replace(/[<>]/g, '');
    
    // Limit search term length
    if (sanitizedValue.length <= 100) {
      setSearchTerm(sanitizedValue);
    } else {
      toast({
        title: "Search Limit",
        description: "Search term cannot exceed 100 characters",
        variant: "destructive",
      });
    }
  };

  // Enhanced filtering with validation
  const filteredTournaments = tournaments.filter(tournament => {
    if (!tournament || typeof tournament !== 'object') return false;

    const matchesSearch = searchTerm.trim() === '' || 
      (tournament.name && tournament.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tournament.type && tournament.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tournament.location && tournament.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (tournament.status && tournament.status === statusFilter);
    
    const matchesType = typeFilter === "all" || 
      (tournament.type && tournament.type === typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary/10 text-primary";
      case "ongoing":
        return "bg-secondary/10 text-secondary";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "ongoing":
        return <Trophy className="h-4 w-4" />;
      case "completed":
        return <Award className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">PlaySwiftPay</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/login">
              <Button variant="hero">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Tournaments</h1>
          <p className="text-xl text-muted-foreground">Discover and join exciting tournaments</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Trophy className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="Cricket">Cricket</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Badminton">Badminton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading tournaments...</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredTournaments.map((tournament) => (
              <Card key={tournament.id} className="tournament-card hover:shadow-glow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                      <CardDescription className="text-base">{tournament.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(tournament.status)}>
                      {getStatusIcon(tournament.status)}
                      <span className="ml-1 capitalize">{tournament.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tournament Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(tournament.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{tournament.location || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{tournament.participants || 0}/{tournament.maxParticipants} players</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span>{tournament.type}</span>
                      </div>
                    </div>

                    {/* Prize and Entry Fee */}
                    <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                        <p className="text-2xl font-bold text-accent">
                          ₹{tournament.prizes?.[0]?.amount?.toLocaleString() || tournament.totalRevenue?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Entry Fee</p>
                        <p className="text-xl font-semibold">₹{tournament.entryFee?.toLocaleString() || '0'}</p>
                      </div>
                    </div>

                    {/* Organizer and Deadline */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Organized by: {tournament.organizer?.name || tournament.organizer || 'Admin'}</span>
                      <span>Date: {new Date(tournament.date).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {tournament.status === "upcoming" && (
                        <Button 
                          variant="hero" 
                          className="flex-1 text-black hover:text-black"
                          onClick={() => handleJoinTournament(tournament)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Join Tournament
                        </Button>
                      )}
                      {tournament.status === "ongoing" && (
                        <Button variant="secondary" className="flex-1">
                          <Trophy className="h-4 w-4 mr-2" />
                          View Live
                        </Button>
                      )}
                      {tournament.status === "completed" && (
                        <Button variant="outline" className="flex-1">
                          <Award className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      )}
                      <Button variant="outline">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTournaments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or check back later for new tournaments.
              </p>
              <Button variant="hero">Browse All Tournaments</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tournament Registration Form */}
      {selectedTournament && (
        <TournamentRegistrationForm
          tournament={selectedTournament}
          isOpen={showRegistrationForm}
          onClose={closeRegistrationForm}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default TournamentList;
