import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";

interface Tournament {
  _id: string;
  name: string;
  type: string;
  date: string;
  endDate?: string;
  entryFee: number;
  maxParticipants: number;
  participants: number;
  description: string;
  location: string;
  status: string;
  organizer: {
    name: string;
    email: string;
  };
}

const TournamentRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to register for tournaments",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (id) {
      fetchTournament(token, id);
    }
  }, [id, navigate, toast]);

  const fetchTournament = async (token: string, tournamentId: string) => {
    try {
      console.log("🏆 Fetching tournament for registration:", tournamentId);
      
      const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTournament(data);
        console.log("✅ Tournament fetched:", data);
      } else {
        console.error("❌ Failed to fetch tournament:", data.error);
        toast({
          title: "Error",
          description: "Failed to load tournament details",
          variant: "destructive",
        });
        navigate("/tournaments");
      }
    } catch (err) {
      console.error("❌ Error fetching tournament:", err);
      toast({
        title: "Connection Error",
        description: "Unable to load tournament details",
        variant: "destructive",
      });
      navigate("/tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRegistration = () => {
    if (!tournament) return;

    // Check if tournament is open for registration
    if (tournament.status !== 'upcoming') {
      toast({
        title: "Registration Closed",
        description: "This tournament is not accepting new registrations",
        variant: "destructive",
      });
      return;
    }

    if (tournament.participants >= tournament.maxParticipants) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached maximum participants",
        variant: "destructive",
      });
      return;
    }

    // Check if registration deadline has passed
    const tournamentDate = new Date(tournament.date);
    const today = new Date();
    
    if (tournamentDate <= today) {
      toast({
        title: "Registration Closed",
        description: "Registration deadline has passed",
        variant: "destructive",
      });
      return;
    }

    setShowRegistrationForm(true);
  };

  const handleRegistrationComplete = () => {
    console.log("✅ Registration completed for tournament:", tournament?._id);
    
    toast({
      title: "Registration Successful! 🎉",
      description: `You have successfully registered for ${tournament?.name}`,
    });

    // Navigate to payment page
    if (tournament && tournament.entryFee > 0) {
      navigate(`/payment/${tournament._id}`);
    } else {
      // Free tournament - go to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "ongoing":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const canRegister = (tournament: Tournament) => {
    return (
      tournament.status === 'upcoming' &&
      tournament.participants < tournament.maxParticipants &&
      new Date(tournament.date) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tournament Not Found</h2>
            <p className="text-gray-600 mb-4">The tournament you're looking for could not be found.</p>
            <Button onClick={() => navigate("/tournaments")}>
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRegistrationForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowRegistrationForm(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournament Details
            </Button>
          </div>
          
          <TournamentRegistrationForm
            tournament={tournament}
            isOpen={true}
            onClose={() => setShowRegistrationForm(false)}
            onSuccess={handleRegistrationComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/tournaments")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tournament Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{tournament.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(tournament.status)} rounded-full px-3 py-1`}>
                        {tournament.status}
                      </Badge>
                      <Badge variant="secondary">
                        {tournament.type}
                      </Badge>
                    </div>
                  </div>
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Tournament Info Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold">{new Date(tournament.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>

                  {tournament.endDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-semibold">{new Date(tournament.endDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Participants</p>
                      <p className="font-semibold">{tournament.participants} / {tournament.maxParticipants}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Entry Fee</p>
                      <p className="font-semibold">₹{tournament.entryFee}</p>
                    </div>
                  </div>

                  {tournament.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold">{tournament.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Organized By</p>
                      <p className="font-semibold">{tournament.organizer.name}</p>
                      <p className="text-sm text-gray-500">{tournament.organizer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {tournament.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About This Tournament</h3>
                    <p className="text-gray-600 leading-relaxed">{tournament.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registration Card */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">₹{tournament.entryFee}</div>
                  <p className="text-sm text-gray-600">Entry Fee</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Spots:</span>
                    <span className="font-medium">{tournament.maxParticipants - tournament.participants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registration Status:</span>
                    <span className={`font-medium ${canRegister(tournament) ? 'text-green-600' : 'text-red-600'}`}>
                      {canRegister(tournament) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                {canRegister(tournament) ? (
                  <Button
                    onClick={handleStartRegistration}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                    size="lg"
                  >
                    Register Now
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">Registration Closed</p>
                    <p className="text-red-500 text-sm">
                      {tournament.status !== 'upcoming' ? 'Tournament is not accepting registrations' :
                       tournament.participants >= tournament.maxParticipants ? 'Tournament is full' :
                       'Registration deadline has passed'}
                    </p>
                  </div>
                )}

                {tournament.entryFee === 0 && canRegister(tournament) && (
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">
                      🎉 Free Tournament! No payment required.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentRegistration;