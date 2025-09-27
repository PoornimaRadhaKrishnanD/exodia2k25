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
  Target,
  Award,
  CheckCircle,
  Upload,
  Download,
  MessageCircle,
  UserPlus,
  LogOut,
  Save,
  Loader2
} from "lucide-react";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileInfo: {
    bio: string;
    avatar: string;
    preferredSports: string[];
    skillLevel: string;
    teams: Array<{ name: string; role: string; }>;
    achievements: string[];
    isPhoneVerified: boolean;
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
    paymentMethods: Array<{ type: string; last4Digits: string; }>;
  };
  socialConnections: Array<{ userId: { name: string; email: string; }; status: string; }>;
  stats: {
    matches: number;
    wins: number;
    goals: number;
    winRate: number;
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

  // Load user profile data
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
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get user stats
        const statsResponse = await fetch('http://localhost:5000/api/auth/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        let stats = { matches: 0, wins: 0, goals: 0, winRate: 0 };
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          stats = statsData.stats;
        }

        setProfileData({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          profileInfo: {
            bio: data.user.profileInfo?.bio || "",
            avatar: data.user.profileInfo?.avatar || "",
            preferredSports: data.user.profileInfo?.preferredSports || [],
            skillLevel: data.user.profileInfo?.skillLevel || "Beginner",
            teams: data.user.profileInfo?.teams || [],
            achievements: data.user.profileInfo?.achievements || [],
            isPhoneVerified: data.user.profileInfo?.isPhoneVerified || false,
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
      console.error('Profile loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save profile data
  const saveProfile = async () => {
    if (!profileData) return;
    
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
          name: profileData.name,
          phone: profileData.phone,
          bio: profileData.profileInfo.bio,
          avatar: profileData.profileInfo.avatar,
          preferredSports: profileData.profileInfo.preferredSports,
          skillLevel: profileData.profileInfo.skillLevel
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const saveNotifications = async () => {
    if (!profileData) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData.notificationSettings)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        });
      } else {
        throw new Error('Failed to update notifications');
      }
    } catch (error) {
      console.error('Notification save error:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save payment settings
  const savePaymentSettings = async () => {
    if (!profileData) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/payment-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData.paymentSettings)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment settings updated successfully",
        });
      } else {
        throw new Error('Failed to update payment settings');
      }
    } catch (error) {
      console.error('Payment save error:', error);
      toast({
        title: "Error",
        description: "Failed to update payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
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
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
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

  // Delete account
  const deleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Password is required to delete account",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        toast({
          title: "Account Deleted",
          description: "Your account has been deactivated",
        });
        navigate('/');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setDeletePassword("");
    }
  };

  // Handle sport selection
  const toggleSport = (sport: string) => {
    if (!profileData) return;
    
    setProfileData({
      ...profileData,
      profileInfo: {
        ...profileData.profileInfo,
        preferredSports: profileData.profileInfo.preferredSports.includes(sport)
          ? profileData.profileInfo.preferredSports.filter(s => s !== sport)
          : [...profileData.profileInfo.preferredSports, sport]
      }
    });
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

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "social", label: "Social", icon: Users }
  ];

  const renderAccountSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.profileInfo.avatar} />
                <AvatarFallback className="bg-primary text-white text-xl font-semibold">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const avatar = e.target?.result as string;
                        setProfileData({
                          ...profileData,
                          profileInfo: { ...profileData.profileInfo, avatar }
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-bold text-foreground">{profileData.name}</h3>
              <p className="text-muted-foreground font-medium">{profileData.email}</p>
              <div className="flex items-center gap-2">
                <Badge className={`${profileData.profileInfo.isPhoneVerified ? 'bg-success hover:bg-success' : 'bg-warning hover:bg-warning'} text-white border-0`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {profileData.profileInfo.isPhoneVerified ? 'Phone Verified' : 'Phone Not Verified'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{profileData.stats.matches}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{profileData.stats.wins}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{profileData.stats.goals}</div>
                  <div className="text-sm text-muted-foreground">Goals</div>
                </div>
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white px-6"
              onClick={() => navigate('/dashboard')}
            >
              View public profile
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input 
                id="fullName" 
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                disabled
                className="border-border focus:border-primary bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              <Input 
                id="phone" 
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-border hover:bg-muted"
                  onClick={() => {
                    if (profileData.profileInfo.avatar) {
                      setProfileData({
                        ...profileData,
                        profileInfo: { ...profileData.profileInfo, avatar: "" }
                      });
                    }
                  }}
                >
                  Remove avatar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-border hover:bg-muted"
                  onClick={() => setActiveSection("security")}
                >
                  Change password
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.profileInfo.bio}
              onChange={(e) => setProfileData({
                ...profileData,
                profileInfo: { ...profileData.profileInfo, bio: e.target.value }
              })}
              placeholder="Tell us about yourself..."
              className="border-border focus:border-primary"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSportsSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" />
            Sports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Preferred Sports</Label>
              <div className="flex gap-2 flex-wrap">
                {["Soccer", "Basketball", "Tennis", "Cricket", "Badminton", "Football", "Volleyball"].map((sport) => (
                  <Badge 
                    key={sport}
                    variant={profileData.profileInfo.preferredSports.includes(sport) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1 ${
                      profileData.profileInfo.preferredSports.includes(sport) 
                        ? "bg-primary text-white" 
                        : "border-border hover:bg-muted"
                    }`}
                    onClick={() => toggleSport(sport)}
                  >
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel" className="text-sm font-medium">Skill level</Label>
              <Select 
                value={profileData.profileInfo.skillLevel}
                onValueChange={(value) => setProfileData({
                  ...profileData,
                  profileInfo: { ...profileData.profileInfo, skillLevel: value }
                })}
              >
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Teams</Label>
              <div className="space-y-3">
                {profileData.profileInfo.teams.length > 0 ? profileData.profileInfo.teams.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
                    <div>
                      <span className="font-semibold text-foreground">{team.name}</span>
                      <Badge variant="outline" className="ml-3 border-primary text-primary">
                        {team.role}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      {team.role === "Captain" ? "Manage" : "Leave"}
                    </Button>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No teams joined yet</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Achievements</Label>
              <div className="flex gap-2 flex-wrap">
                {profileData.profileInfo.achievements.length > 0 ? profileData.profileInfo.achievements.map((achievement, index) => (
                  <Badge key={index} className="bg-warning text-white border-0 px-3 py-1">
                    <Award className="h-3 w-3 mr-1" />
                    {achievement}
                  </Badge>
                )) : (
                  <p className="text-muted-foreground">No achievements yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Sports Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Payment methods</Label>
              <div className="space-y-3">
                {profileData.paymentSettings.paymentMethods.length > 0 ? profileData.paymentSettings.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">••••</span>
                      </div>
                      <span className="font-medium">•••• {method.last4Digits}</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      Remove
                    </Button>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No payment methods added</p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-border hover:bg-muted"
                  onClick={() => {
                    toast({
                      title: "Add Payment Method",
                      description: "Payment method integration coming soon!",
                    });
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Transaction Summary</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
                  <div>
                    <div className="font-semibold text-foreground">Total Spent</div>
                    <div className="text-sm text-muted-foreground">All tournaments</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">₹{profileData.stats.matches * 150}</div>
                    <div className="text-sm text-muted-foreground">This year</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Payout settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm">Bank name</Label>
                <Input 
                  id="bankName" 
                  placeholder="Enter bank name" 
                  className="border-border focus:border-primary"
                  value={profileData.paymentSettings.bankName}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    paymentSettings: { ...profileData.paymentSettings, bankName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm">Account number</Label>
                <Input 
                  id="accountNumber" 
                  placeholder="Enter account number" 
                  className="border-border focus:border-primary"
                  value={profileData.paymentSettings.accountNumber}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    paymentSettings: { ...profileData.paymentSettings, accountNumber: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftBic" className="text-sm">SWIFT/BIC</Label>
                <Input 
                  id="swiftBic" 
                  placeholder="Enter SWIFT/BIC" 
                  className="border-border focus:border-primary"
                  value={profileData.paymentSettings.swiftBic}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    paymentSettings: { ...profileData.paymentSettings, swiftBic: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white w-full"
                  onClick={savePaymentSettings}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tournament-reminders" className="text-sm font-medium">Tournament reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified about upcoming tournaments</p>
              </div>
              <Switch 
                id="tournament-reminders"
                checked={profileData.notificationSettings.tournamentReminders}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notificationSettings: { ...profileData.notificationSettings, tournamentReminders: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="match-results" className="text-sm font-medium">Match result updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about match results</p>
              </div>
              <Switch 
                id="match-results"
                checked={profileData.notificationSettings.matchResults}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notificationSettings: { ...profileData.notificationSettings, matchResults: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promo-offers" className="text-sm font-medium">Promo offers</Label>
                <p className="text-sm text-muted-foreground">Receive promotional offers and discounts</p>
              </div>
              <Switch 
                id="promo-offers"
                checked={profileData.notificationSettings.promoOffers}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notificationSettings: { ...profileData.notificationSettings, promoOffers: checked }
                })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Select 
                value={profileData.notificationSettings.language}
                onValueChange={(value) => setProfileData({
                  ...profileData,
                  notificationSettings: { ...profileData.notificationSettings, language: value }
                })}
              >
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">Dark mode</Label>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <Switch 
                id="dark-mode"
                checked={profileData.notificationSettings.darkMode}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notificationSettings: { ...profileData.notificationSettings, darkMode: checked }
                })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={saveNotifications}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Change Password</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  placeholder="Enter current password" 
                  className="border-border focus:border-primary"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  placeholder="Enter new password" 
                  className="border-border focus:border-primary"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Confirm new password" 
                  className="border-border focus:border-primary"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={changePassword}
                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                Change Password
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-3 block">Account Statistics</Label>
            <div className="p-4 border border-border rounded-lg bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-foreground">Win rate</span>
                <span className="text-xl font-bold text-primary">{profileData.stats.winRate}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <div className="font-bold text-primary">{profileData.stats.matches}</div>
                  <div className="text-muted-foreground">Matches</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="font-bold text-primary">{profileData.stats.wins}</div>
                  <div className="text-muted-foreground">Wins</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="font-bold text-primary">{profileData.stats.goals}</div>
                  <div className="text-muted-foreground">Goals</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-3 block text-red-600">Danger Zone</Label>
            <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="space-y-2">
                <Label htmlFor="deletePassword" className="text-sm font-medium">Enter password to confirm account deletion</Label>
                <Input 
                  id="deletePassword" 
                  type="password"
                  placeholder="Enter your password" 
                  className="border-border focus:border-red-500"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={deleteAccount}
                disabled={saving || !deletePassword}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Account Permanently
              </Button>
              <p className="text-xs text-red-600">This action cannot be undone. Your account will be deactivated.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            Social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Friends</Label>
            <div className="space-y-3">
              {profileData.socialConnections.length > 0 ? profileData.socialConnections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {connection.userId.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{connection.userId.name}</span>
                      <div className="text-xs text-muted-foreground">{connection.userId.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    {connection.status === 'accepted' && (
                      <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No friends added yet</p>
                  <p className="text-sm text-muted-foreground">Connect with other players to build your network</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                toast({
                  title: "Invite Friends",
                  description: "Friend invitation feature coming soon!",
                });
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-border hover:bg-muted"
              onClick={() => {
                toast({
                  title: "Privacy Settings",
                  description: "Advanced privacy controls coming soon!",
                });
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "account": return renderAccountSection();
      case "sports": return renderSportsSection();
      case "payments": return renderPaymentsSection();
      case "notifications": return renderNotificationsSection();
      case "security": return renderSecuritySection();
      case "social": return renderSocialSection();
      default: return renderAccountSection();
    }
  };

  return (
    <div className="min-h-screen bg-profile-bg">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <Card className="sticky top-6 shadow-sm border-0 bg-white">
              <CardContent className="p-0">
                <div className="p-6 border-b border-border">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-4 border-4 border-white shadow-lg">
                      <AvatarImage src={profileData.profileInfo.avatar} />
                      <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg text-foreground">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{profileData.email}</p>
                    <div className="flex justify-center mt-3">
                      <Badge className={`${profileData.profileInfo.isPhoneVerified ? 'bg-success hover:bg-success' : 'bg-warning hover:bg-warning'} text-white border-0 text-xs`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {profileData.profileInfo.isPhoneVerified ? 'Phone Verified' : 'Phone Not Verified'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 text-center text-sm">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="font-bold text-primary">{profileData.stats.matches}</div>
                      <div className="text-muted-foreground text-xs">Matches</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="font-bold text-primary">{profileData.stats.wins}</div>
                      <div className="text-muted-foreground text-xs">Wins</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="font-bold text-primary">{profileData.stats.goals}</div>
                      <div className="text-muted-foreground text-xs">Goals</div>
                    </div>
                  </div>
                </div>
                <nav className="p-3 sidebar-nav">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className={`w-full justify-start mb-2 h-11 ${
                          activeSection === item.id 
                            ? "bg-primary text-black shadow-sm" 
                            : "text-black hover:text-black hover:bg-muted/50"
                        }`}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

