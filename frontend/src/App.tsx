import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerSignUp from "./pages/OrganizerSignUp";
import TournamentList from "./pages/TournamentList";
import CreateTournament from "./pages/CreateTournament";
import Payment from "./pages/Payment";
import TournamentRegistration from "./pages/TournamentRegistration";
import NotFound from "./pages/NotFound";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerCreateTournament from "./pages/OrganizerCreateTournament"; // ✅ Correct import
import { TournamentProvider } from "./context/TournamentContext";
import { UserProvider } from "./context/UserContext";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TournamentProvider>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile-settings" element={<ProfileSettingsPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/create-tournament" element={<CreateTournament />} />

              {/* Organizer Routes */}
              <Route path="/organizer/login" element={<OrganizerLogin />} />
              <Route path="/organizer/signup" element={<OrganizerSignUp />} />
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/organizer/create-tournament" element={<OrganizerCreateTournament />} />

              {/* Tournament & Payment */}
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournament-registration/:id" element={<TournamentRegistration />} />
              <Route path="/payment/:id" element={<Payment />} />

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </TournamentProvider>
  </QueryClientProvider>
);

export default App;
