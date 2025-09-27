import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Tournament {
  _id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  totalRevenue: number;
  organizer?: {
    name: string;
    email: string;
  };
}

interface TournamentContextType {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTournament: Tournament | null;
  setSelectedTournament: React.Dispatch<React.SetStateAction<Tournament | null>>;
  refreshTournaments: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider: React.FC<TournamentProviderProps> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const refreshTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tournaments');
      const data = await response.json();
      
      if (response.ok) {
        setTournaments(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('Failed to fetch tournaments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: TournamentContextType = {
    tournaments,
    setTournaments,
    loading,
    setLoading,
    selectedTournament,
    setSelectedTournament,
    refreshTournaments,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};