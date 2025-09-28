import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Users, 
  Trophy, 
  Star,
  Camera,
  Trash2,
  Edit3,
  Eye,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserPlus,
  CheckCircle
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profileInfo: {
    bio: string;
    avatar: string;
    preferredSports: string[];
    skillLevel: string;
  };
  notificationSettings: {
    tournamentReminders: boolean;
    matchResults: boolean;
    promoOffers: boolean;
    darkMode: boolean;
    language: string;
  };
  paymentSettings: {
    bankName: string;
    accountNumber: string;
    swiftBic: string;
    paymentMethods: string[];
  };
  socialConnections: any[];
  stats: {
    matches: number;
    wins: number;
    goals: number;
  };
}

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deletePassword, setDeletePassword] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to access profile settings",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Get user stats
        const statsResponse = await fetch('http://localhost:5000/api/auth/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let stats = { matches: 0, wins: 0, goals: 0 };
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          stats = statsData.stats || stats;
        }

        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          profileInfo: {
            bio: data.user.profileInfo?.bio || "",
            avatar: data.user.profileInfo?.avatar || "",
            preferredSports: data.user.profileInfo?.preferredSports || [],
            skillLevel: data.user.profileInfo?.skillLevel || "beginner"
          },
          notificationSettings: {
            tournamentReminders: data.user.notificationSettings?.tournamentReminders ?? true,
            matchResults: data.user.notificationSettings?.matchResults ?? true,
            promoOffers: data.user.notificationSettings?.promoOffers ?? false,
            darkMode: data.user.notificationSettings?.darkMode ?? false,
            language: data.user.notificationSettings?.language || "english"
          },
          paymentSettings: {
            bankName: data.user.paymentSettings?.bankName || "",
            accountNumber: data.user.paymentSettings?.accountNumber || "",
            swiftBic: data.user.paymentSettings?.swiftBic || "",
            paymentMethods: data.user.paymentSettings?.paymentMethods || []
          },
          socialConnections: data.user.socialConnections || [],
          stats: stats
        });
      } else {
        throw new Error('Failed to load profile');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateProfileData = () => {
    if (!profileData) return false;

    if (!profileData.name?.trim()) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return false;
    }

    if (profileData.name.length < 2) {
      toast({ title: "Validation Error", description: "Name must be at least 2 characters long", variant: "destructive" });
      return false;
    }

    if (profileData.phone && !/^[+]?[\d\s\-()]{10,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      toast({ title: "Validation Error", description: "Please enter a valid phone number", variant: "destructive" });
      return false;
    }

    if (profileData.profileInfo?.bio && profileData.profileInfo.bio.length > 500) {
      toast({ title: "Validation Error", description: "Bio cannot exceed 500 characters", variant: "destructive" });
      return false;
    }

    return true;
  };

  const validatePasswordForm = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!currentPassword.trim()) {
      toast({ title: "Validation Error", description: "Current password is required", variant: "destructive" });
      return false;
    }

    if (!newPassword.trim()) {
      toast({ title: "Validation Error", description: "New password is required", variant: "destructive" });
      return false;
    }

    if (newPassword.length < 6) {
      toast({ title: "Validation Error", description: "New password must be at least 6 characters long", variant: "destructive" });
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Validation Error", description: "New password and confirmation do not match", variant: "destructive" });
      return false;
    }

    if (currentPassword === newPassword) {
      toast({ title: "Validation Error", description: "New password must be different from current password", variant: "destructive" });
      return false;
    }

    return true;
  };

  // Save profile data
  const saveProfile = async () => {
    if (!profileData || !validateProfileData()) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone: profileData.phone?.trim(),
          bio: profileData.profileInfo?.bio?.trim(),
          avatar: profileData.profileInfo?.avatar,
          preferredSports: profileData.profileInfo?.preferredSports || [],
          skillLevel: profileData.profileInfo?.skillLevel
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (!validatePasswordForm(passwordData.currentPassword, passwordData.newPassword, passwordData.confirmPassword)) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword.trim(),
          newPassword: passwordData.newPassword.trim()
        })
      });

      if (response.ok) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Account Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.profileInfo.bio}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        profileInfo: { ...profileData.profileInfo, bio: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={saving} className="mt-4">
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>

              {/* Password Section */}
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={changePassword} disabled={saving} variant="outline" className="mt-4">
                  {saving ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;