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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle,
  Save,
  Loader2,
  Volume2,
  VolumeX,
  Monitor,
  Moon,
  Sun,
  Globe,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState("account");
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification settings');
      }
    } catch (error: any) {
      console.error('Notification save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment settings');
      }
    } catch (error: any) {
      console.error('Payment settings save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your password to confirm account deletion",
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
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        });
        localStorage.clear();
        navigate("/");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
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
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profileData.profileInfo.avatar} />
                        <AvatarFallback className="text-2xl">
                          {profileData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG or GIF. Max size 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skillLevel">Skill Level</Label>
                        <Select
                          value={profileData.profileInfo.skillLevel}
                          onValueChange={(value) => setProfileData({
                            ...profileData,
                            profileInfo: { ...profileData.profileInfo, skillLevel: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {profileData.profileInfo.bio.length}/500 characters
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveProfile} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Configure how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base">Tournament Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about upcoming tournaments and matches
                          </p>
                        </div>
                        <Switch
                          checked={profileData.notificationSettings.tournamentReminders}
                          onCheckedChange={(checked) => setProfileData({
                            ...profileData,
                            notificationSettings: { ...profileData.notificationSettings, tournamentReminders: checked }
                          })}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base">Match Results</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about match results and standings
                          </p>
                        </div>
                        <Switch
                          checked={profileData.notificationSettings.matchResults}
                          onCheckedChange={(checked) => setProfileData({
                            ...profileData,
                            notificationSettings: { ...profileData.notificationSettings, matchResults: checked }
                          })}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base">Promotional Offers</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about special offers and discounts
                          </p>
                        </div>
                        <Switch
                          checked={profileData.notificationSettings.promoOffers}
                          onCheckedChange={(checked) => setProfileData({
                            ...profileData,
                            notificationSettings: { ...profileData.notificationSettings, promoOffers: checked }
                          })}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <Label className="text-base">Language</Label>
                        <Select
                          value={profileData.notificationSettings.language}
                          onValueChange={(value) => setProfileData({
                            ...profileData,
                            notificationSettings: { ...profileData.notificationSettings, language: value }
                          })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveNotifications} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Settings
                    </CardTitle>
                    <CardDescription>Manage your payment methods and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={profileData.paymentSettings.bankName}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            paymentSettings: { ...profileData.paymentSettings, bankName: e.target.value }
                          })}
                          placeholder="Enter your bank name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={profileData.paymentSettings.accountNumber}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            paymentSettings: { ...profileData.paymentSettings, accountNumber: e.target.value }
                          })}
                          placeholder="Enter account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="swiftBic">SWIFT/BIC Code</Label>
                        <Input
                          id="swiftBic"
                          value={profileData.paymentSettings.swiftBic}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            paymentSettings: { ...profileData.paymentSettings, swiftBic: e.target.value }
                          })}
                          placeholder="Enter SWIFT/BIC code"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-800">Payment Information</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={savePaymentSettings} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Payment Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your password and account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Change Password</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={changePassword} disabled={saving} variant="outline">
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Lock className="h-4 w-4 mr-2" />
                        )}
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-red-600">Danger Zone</h4>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-red-800">Delete Account</h5>
                            <p className="text-sm text-red-700 mt-1">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                          </div>
                          <div className="max-w-sm">
                            <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                            <Input
                              id="deletePassword"
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder="Enter your password"
                            />
                          </div>
                          <Button 
                            onClick={deleteAccount} 
                            disabled={saving} 
                            variant="destructive"
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete Account Permanently
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      App Preferences
                    </CardTitle>
                    <CardDescription>Customize your app experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark Mode
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Switch to dark theme for better viewing in low light
                          </p>
                        </div>
                        <Switch
                          checked={profileData.notificationSettings.darkMode}
                          onCheckedChange={(checked) => setProfileData({
                            ...profileData,
                            notificationSettings: { ...profileData.notificationSettings, darkMode: checked }
                          })}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-base flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Preferred Sports
                        </Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Select your favorite sports to get personalized recommendations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {['Football', 'Basketball', 'Tennis', 'Cricket', 'Badminton', 'Swimming', 'Running'].map((sport) => (
                            <Badge 
                              key={sport}
                              variant={profileData.profileInfo.preferredSports.includes(sport) ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => {
                                const currentSports = profileData.profileInfo.preferredSports;
                                const newSports = currentSports.includes(sport)
                                  ? currentSports.filter(s => s !== sport)
                                  : [...currentSports, sport];
                                setProfileData({
                                  ...profileData,
                                  profileInfo: { ...profileData.profileInfo, preferredSports: newSports }
                                });
                              }}
                            >
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-base">Statistics</Label>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{profileData.stats.matches}</p>
                            <p className="text-sm text-muted-foreground">Matches Played</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{profileData.stats.wins}</p>
                            <p className="text-sm text-muted-foreground">Wins</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{profileData.stats.goals}</p>
                            <p className="text-sm text-muted-foreground">Goals/Points</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveProfile} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;