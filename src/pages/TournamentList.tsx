import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const [tournaments] = useState([
    {
      id: 1,
      name: "Cricket Championship 2024",
      description: "Annual cricket tournament with top teams from across the region",
      status: "upcoming",
      date: "2024-01-15",
      location: "Sports Complex A",
      participants: 32,
      maxParticipants: 64,
      entryFee: 500,
      prize: 25000,
      type: "Cricket",
      organizer: "Sports Club",
      registrationDeadline: "2024-01-10"
    },
    {
      id: 2,
      name: "Football League Finals",
      description: "Competitive football tournament featuring skilled players",
      status: "ongoing",
      date: "2024-01-10",
      location: "Football Stadium",
      participants: 16,
      maxParticipants: 16,
      entryFee: 750,
      prize: 40000,
      type: "Football",
      organizer: "Football Association",
      registrationDeadline: "2024-01-05"
    },
    {
      id: 3,
      name: "Basketball Tournament",
      description: "Fast-paced basketball competition",
      status: "completed",
      date: "2023-12-20",
      location: "Indoor Court B",
      participants: 8,
      maxParticipants: 8,
      entryFee: 300,
      prize: 12000,
      type: "Basketball",
      organizer: "Basketball Club",
      registrationDeadline: "2023-12-15"
    },
    {
      id: 4,
      name: "Tennis Open 2024",
      description: "Singles and doubles tennis championship",
      status: "upcoming",
      date: "2024-01-25",
      location: "Tennis Courts",
      participants: 24,
      maxParticipants: 32,
      entryFee: 400,
      prize: 18000,
      type: "Tennis",
      organizer: "Tennis Academy",
      registrationDeadline: "2024-01-20"
    },
    {
      id: 5,
      name: "Badminton Championship",
      description: "Professional badminton tournament",
      status: "upcoming",
      date: "2024-02-01",
      location: "Badminton Hall",
      participants: 18,
      maxParticipants: 24,
      entryFee: 350,
      prize: 15000,
      type: "Badminton",
      organizer: "Badminton Federation",
      registrationDeadline: "2024-01-27"
    },
  ]);

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    const matchesType = typeFilter === "all" || tournament.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-primary/10 text-primary';
      case 'ongoing': return 'bg-secondary/10 text-secondary';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'ongoing': return <Trophy className="h-4 w-4" />;
      case 'completed': return <Award className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="tournament-card hover:shadow-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                    <CardDescription className="text-base">
                      {tournament.description}
                    </CardDescription>
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
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.participants}/{tournament.maxParticipants} players</span>
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
                      <p className="text-2xl font-bold text-accent">₹{tournament.prize.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Entry Fee</p>
                      <p className="text-xl font-semibold">₹{tournament.entryFee}</p>
                    </div>
                  </div>

                  {/* Organizer and Deadline */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Organized by: {tournament.organizer}</span>
                    <span>Deadline: {tournament.registrationDeadline}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {tournament.status === 'upcoming' && (
                      <Button variant="hero" className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Join Tournament
                      </Button>
                    )}
                    {tournament.status === 'ongoing' && (
                      <Button variant="secondary" className="flex-1">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Live
                      </Button>
                    )}
                    {tournament.status === 'completed' && (
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

        {/* No Results */}
        {filteredTournaments.length === 0 && (
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
    </div>
  );
};

export default TournamentList;