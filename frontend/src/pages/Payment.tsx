import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QRCode from "qrcode";
import {
  CreditCard,
  Wallet,
  Shield,
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Check,
  AlertCircle,
  Building2,
  Smartphone,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tournament {
  _id: string;
  name: string;
  type: string;
  date: string;
  entryFee: number;
  maxParticipants: number;
  participants: number;
  organizer: {
    name: string;
    email: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const Payment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi-apps");
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

  // Debug logging
  console.log("Payment component rendered:", {
    selectedPaymentMethod,
    tournament: tournament ? `${tournament.name} - ₹${tournament.entryFee}` : null,
    loading
  });

  // UPI Apps Configuration
  const upiApps = [
    {
      id: "googlepay",
      name: "Google Pay",
      logo: "🟢",
      deepLink: "tez://upi/pay",
      color: "bg-green-600"
    },
    {
      id: "phonepe",
      name: "PhonePe", 
      logo: "🟣",
      deepLink: "phonepe://pay",
      color: "bg-purple-600"
    },
    {
      id: "paytm",
      name: "Paytm",
      logo: "🔵", 
      deepLink: "paytmmp://pay",
      color: "bg-blue-600"
    },
    {
      id: "bhim",
      name: "BHIM",
      logo: "🟠",
      deepLink: "bhim://pay",
      color: "bg-orange-600"
    },
    {
      id: "amazonpay",
      name: "Amazon Pay",
      logo: "🟡",
      deepLink: "amazonpay://pay", 
      color: "bg-yellow-600"
    },
    {
      id: "mobikwik",
      name: "MobiKwik",
      logo: "🔴",
      deepLink: "mobikwik://pay",
      color: "bg-red-600"
    }
  ];

  // Debug UPI apps
  console.log("UPI Apps available:", upiApps.length, upiApps.map(app => app.name));

  // Generate UPI Payment String
  const generateUPIString = () => {
    const merchantVPA = "merchant@paytm"; // Replace with actual merchant VPA
    const merchantName = "PlaySwiftPay";
    const amount = tournament?.entryFee || 0;
    const transactionId = `TXN_${Date.now()}`;
    
    return `upi://pay?pa=${merchantVPA}&pn=${merchantName}&am=${amount}&cu=INR&tn=Tournament Registration ${tournament?.name}&tr=${transactionId}`;
  };

  // Generate QR Code
  const generateQRCode = async (upiString: string) => {
    setQrCodeLoading(true);
    try {
      const qrCodeDataURL = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: "Unable to generate QR code. Please try another payment method.",
        variant: "destructive",
      });
    } finally {
      setQrCodeLoading(false);
    }
  };

  // Generate QR code when UPI QR payment method is selected
  useEffect(() => {
    if (selectedPaymentMethod === "upi-qr" && tournament) {
      const upiString = generateUPIString();
      generateQRCode(upiString);
    }
  }, [selectedPaymentMethod, tournament]);

  // Handle UPI App Selection and Payment
  const handleUPIAppPayment = (appId: string) => {
    const selectedApp = upiApps.find(app => app.id === appId);
    if (!selectedApp || !tournament) return;

    setPaymentData(prev => ({ ...prev, selectedUpiApp: appId }));
    
    const upiString = generateUPIString();
    const appDeepLink = `${selectedApp.deepLink}?${upiString.split('?')[1]}`;
    
    toast({
      title: `Opening ${selectedApp.name}...`,
      description: `Redirecting to ${selectedApp.name} for payment of ₹${tournament.entryFee}`,
    });

    // Try to open the UPI app
    try {
      window.location.href = appDeepLink;
    } catch (error) {
      // Fallback to web UPI or show instructions
      toast({
        title: "UPI App Not Found",
        description: `Please install ${selectedApp.name} or use another UPI app to scan the QR code`,
        variant: "destructive",
      });
    }
  };
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    upiId: "",
    selectedUpiApp: "",
    bankName: "",
    walletProvider: "",
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Pay securely with your card",
    },
    {
      id: "upi-apps",
      name: "UPI Apps",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Pay directly through UPI apps",
    },
    {
      id: "upi-qr",
      name: "UPI QR Code",
      icon: <QrCode className="h-5 w-5" />,
      description: "Scan QR code to pay via any UPI app",
    },
    {
      id: "upi-id",
      name: "UPI ID",
      icon: <Wallet className="h-5 w-5" />,
      description: "Pay using UPI ID",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: <Building2 className="h-5 w-5" />,
      description: "Pay through your bank account",
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: <Wallet className="h-5 w-5" />,
      description: "Paytm, PhonePe, Google Pay wallet",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to make a payment",
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
      console.log("🏆 Fetching tournament for payment:", tournamentId);
      
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

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits and limit to 16 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    // Add spaces every 4 digits
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits and limit to 4 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const validatePayment = () => {
    if (selectedPaymentMethod === "card") {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardHolder) {
        toast({
          title: "Incomplete Information",
          description: "Please fill all card details",
          variant: "destructive",
        });
        return false;
      }
      
      if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Invalid Card Number",
          description: "Card number must be 16 digits",
          variant: "destructive",
        });
        return false;
      }
      
      if (paymentData.cvv.length !== 3) {
        toast({
          title: "Invalid CVV",
          description: "CVV must be 3 digits",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPaymentMethod === "upi-apps") {
      if (!paymentData.selectedUpiApp) {
        toast({
          title: "UPI App Selection Required",
          description: "Please select a UPI app to proceed",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPaymentMethod === "upi-qr") {
      // QR code payment doesn't need validation as it's scan-based
      return true;
    } else if (selectedPaymentMethod === "upi-id") {
      if (!paymentData.upiId) {
        toast({
          title: "UPI ID Required",
          description: "Please enter your UPI ID",
          variant: "destructive",
        });
        return false;
      }
      
      if (!paymentData.upiId.includes('@')) {
        toast({
          title: "Invalid UPI ID",
          description: "Please enter a valid UPI ID",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPaymentMethod === "netbanking") {
      if (!paymentData.bankName) {
        toast({
          title: "Bank Selection Required",
          description: "Please select your bank",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPaymentMethod === "wallet") {
      if (!paymentData.walletProvider) {
        toast({
          title: "Wallet Provider Required",
          description: "Please select your wallet provider",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const processPayment = async () => {
    if (!validatePayment()) return;
    if (!tournament) return;

    setProcessing(true);

    try {
      console.log("💳 Processing payment for tournament:", tournament._id);
      
      const token = localStorage.getItem("token");
      
      // Simulate payment processing (replace with actual payment gateway integration)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Register for tournament after successful payment
      const registrationResponse = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/register`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
          paymentData: selectedPaymentMethod === "card" ? {
            cardLastFour: paymentData.cardNumber.slice(-4),
            cardHolder: paymentData.cardHolder
          } : {
            upiId: paymentData.upiId
          },
          amountPaid: tournament.entryFee,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`
        }),
      });

      const registrationData = await registrationResponse.json();

      if (registrationResponse.ok) {
        console.log("✅ Payment and registration successful:", registrationData);
        
        toast({
          title: "Payment Successful! 🎉",
          description: `You have successfully registered for ${tournament.name}`,
        });

        // Navigate to dashboard after successful payment
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

      } else {
        console.error("❌ Registration failed:", registrationData.error);
        toast({
          title: "Registration Failed",
          description: registrationData.error || "Failed to complete registration",
          variant: "destructive",
        });
      }

    } catch (err) {
      console.error("❌ Payment processing error:", err);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
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
            <p className="text-gray-600 mb-4">The tournament you're trying to pay for could not be found.</p>
            <Button onClick={() => navigate("/tournaments")}>
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
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
          
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
          </div>
          <p className="text-gray-600">Complete your tournament registration</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tournament Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Tournament Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{tournament.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {tournament.type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(tournament.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{tournament.participants}/{tournament.maxParticipants} players</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Organized by:</span>
                <span className="font-medium">{tournament.organizer.name}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Entry Fee:</span>
                  <span className="font-semibold">₹{tournament.entryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{tournament.entryFee}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      {method.icon}
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Card Payment Form */}
              {selectedPaymentMethod === "card" && (
                <div className="space-y-4">
                  {/* Amount Display for Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Amount to Charge</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">₹{tournament.entryFee}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => handlePaymentDataChange("cardNumber", formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => handlePaymentDataChange("expiryDate", formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={paymentData.cvv}
                        onChange={(e) => handlePaymentDataChange("cvv", e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardHolder">Cardholder Name</Label>
                    <Input
                      id="cardHolder"
                      placeholder="John Doe"
                      value={paymentData.cardHolder}
                      onChange={(e) => handlePaymentDataChange("cardHolder", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* UPI Apps Payment Form */}
              {selectedPaymentMethod === "upi-apps" && (
                <div className="space-y-4">
                  {/* Amount Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Amount to Pay</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {tournament ? `₹${tournament.entryFee}` : "₹1000"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Choose your preferred UPI App:</Label>
                    
                    {/* UPI Apps Grid - Always show */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { id: "googlepay", name: "Google Pay", logo: "🟢", color: "green" },
                        { id: "phonepe", name: "PhonePe", logo: "🟣", color: "purple" },
                        { id: "paytm", name: "Paytm", logo: "🔵", color: "blue" },
                        { id: "bhim", name: "BHIM", logo: "🟠", color: "orange" },
                        { id: "amazonpay", name: "Amazon Pay", logo: "🟡", color: "yellow" },
                        { id: "mobikwik", name: "MobiKwik", logo: "🔴", color: "red" }
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setPaymentData(prev => ({ ...prev, selectedUpiApp: app.id }));
                            toast({
                              title: `${app.name} Selected`,
                              description: `Click the payment button below to pay via ${app.name}`,
                            });
                          }}
                          className={`p-4 border-2 rounded-lg flex items-center gap-3 hover:shadow-md transition-all ${
                            paymentData.selectedUpiApp === app.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <span className="text-2xl">{app.logo}</span>
                          <div className="text-left">
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-gray-500">
                              Tap to select
                            </div>
                          </div>
                          {paymentData.selectedUpiApp === app.id && (
                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected App Display */}
                    {paymentData.selectedUpiApp && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Selected: {[
                              { id: "googlepay", name: "Google Pay" },
                              { id: "phonepe", name: "PhonePe" },
                              { id: "paytm", name: "Paytm" },
                              { id: "bhim", name: "BHIM" },
                              { id: "amazonpay", name: "Amazon Pay" },
                              { id: "mobikwik", name: "MobiKwik" }
                            ].find(app => app.id === paymentData.selectedUpiApp)?.name}
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p>Click the payment button below to complete your transaction.</p>
                          <p className="mt-1">Amount: <strong>{tournament ? `₹${tournament.entryFee}` : "₹1000"}</strong></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UPI QR Code Payment Form */}
              {selectedPaymentMethod === "upi-qr" && (
                <div className="space-y-4">
                  {/* Amount Display */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Scan & Pay</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">₹{tournament.entryFee}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-8 inline-block">
                      {/* QR Code Placeholder - In real implementation, use a QR library */}
                      <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">QR Code</p>
                          <p className="text-xs text-gray-400 mt-1">₹{tournament.entryFee}</p>
                        </div>
                        {/* QR Code Pattern Simulation */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="grid grid-cols-12 gap-0.5 h-full w-full p-2">
                            {Array.from({ length: 144 }).map((_, i) => (
                              <div
                                key={i}
                                className={`${
                                  Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'
                                } aspect-square`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* UPI String Display */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-600 font-mono break-all">
                        {generateUPIString()}
                      </p>
                    </div>
                    
                    {/* Quick UPI App Links */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Quick Pay Options:</p>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {upiApps.slice(0, 4).map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleUPIAppPayment(app.id)}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            {app.logo} {app.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">QR Payment Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                          <li>Scan the QR code above</li>
                          <li>Verify amount: ₹{tournament.entryFee}</li>
                          <li>Complete the payment</li>
                          <li>Screenshot the success message for reference</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowQRCode(!showQRCode)}
                    variant="outline"
                    className="w-full"
                  >
                    {showQRCode ? "Hide" : "Generate New"} QR Code
                  </Button>
                </div>
              )}

              {/* UPI ID Payment Form */}
              {selectedPaymentMethod === "upi-id" && (
                <div className="space-y-4">
                  {/* Amount Display for UPI */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-900">Amount to Pay</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-700">₹{tournament.entryFee}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="your-upi-id@bank"
                      value={paymentData.upiId}
                      onChange={(e) => handlePaymentDataChange("upiId", e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">UPI ID Payment Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Enter your UPI ID (e.g., yourname@paytm)</li>
                          <li>You will receive a payment request for ₹{tournament.entryFee}</li>
                          <li>Approve the payment in your UPI app</li>
                          <li>Registration will be confirmed automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Payment Form */}
              {selectedPaymentMethod === "netbanking" && (
                <div className="space-y-4">
                  {/* Amount Display for Net Banking */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Amount to Transfer</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">₹{tournament.entryFee}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bankName">Select Your Bank</Label>
                    <select
                      id="bankName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={paymentData.bankName}
                      onChange={(e) => handlePaymentDataChange("bankName", e.target.value)}
                    >
                      <option value="">Select your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="other">Other Banks</option>
                    </select>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Net Banking Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>You will be redirected to your bank's website</li>
                          <li>Login with your net banking credentials</li>
                          <li>Authorize the payment of ₹{tournament.entryFee}</li>
                          <li>Return to complete your registration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Wallet Payment Form */}
              {selectedPaymentMethod === "wallet" && (
                <div className="space-y-4">
                  {/* Amount Display for Digital Wallet */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Wallet Payment</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">₹{tournament.entryFee}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="walletProvider">Select Wallet Provider</Label>
                    <select
                      id="walletProvider"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={paymentData.walletProvider}
                      onChange={(e) => handlePaymentDataChange("walletProvider", e.target.value)}
                    >
                      <option value="">Select wallet provider</option>
                      <option value="paytm">Paytm</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="amazonpay">Amazon Pay</option>
                      <option value="freecharge">FreeCharge</option>
                      <option value="mobikwik">MobiKwik</option>
                    </select>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">Digital Wallet Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>You will be redirected to your wallet app</li>
                          <li>Confirm the payment of ₹{tournament.entryFee}</li>
                          <li>Complete authentication (PIN/Fingerprint)</li>
                          <li>You'll be redirected back automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={processPayment}
                disabled={processing}
                className={`w-full font-semibold py-3 transition-all duration-200 ${
                  selectedPaymentMethod === "upi-apps" 
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" 
                    : selectedPaymentMethod === "upi-qr"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    : selectedPaymentMethod === "upi-id"
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                    : selectedPaymentMethod === "netbanking"
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : selectedPaymentMethod === "wallet"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white`}
                size="lg"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {selectedPaymentMethod === "upi-apps" && `Opening ${upiApps.find(app => app.id === paymentData.selectedUpiApp)?.name || 'UPI App'}...`}
                    {selectedPaymentMethod === "upi-qr" && "Processing QR Payment..."}
                    {selectedPaymentMethod === "upi-id" && "Sending UPI Request..."}
                    {selectedPaymentMethod === "card" && "Processing Card Payment..."}
                    {selectedPaymentMethod === "netbanking" && "Redirecting to Bank..."}
                    {selectedPaymentMethod === "wallet" && "Opening Wallet App..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {selectedPaymentMethod === "upi-apps" && paymentData.selectedUpiApp && (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Pay ₹{tournament?.entryFee || "1000"} via {[
                          { id: "googlepay", name: "Google Pay" },
                          { id: "phonepe", name: "PhonePe" },
                          { id: "paytm", name: "Paytm" },
                          { id: "bhim", name: "BHIM" },
                          { id: "amazonpay", name: "Amazon Pay" },
                          { id: "mobikwik", name: "MobiKwik" }
                        ].find(app => app.id === paymentData.selectedUpiApp)?.name}
                      </>
                    )}
                    {selectedPaymentMethod === "upi-apps" && !paymentData.selectedUpiApp && (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Select UPI App Above
                      </>
                    )}
                    {selectedPaymentMethod === "upi-qr" && (
                      <>
                        <QrCode className="h-4 w-4" />
                        Pay ₹{tournament.entryFee} via QR Code
                      </>
                    )}
                    {selectedPaymentMethod === "upi-id" && (
                      <>
                        <Wallet className="h-4 w-4" />
                        Pay ₹{tournament.entryFee} via UPI ID
                      </>
                    )}
                    {selectedPaymentMethod === "card" && (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pay ₹{tournament.entryFee} via Card
                      </>
                    )}
                    {selectedPaymentMethod === "netbanking" && (
                      <>
                        <Building2 className="h-4 w-4" />
                        Pay ₹{tournament.entryFee} via Net Banking
                      </>
                    )}
                    {selectedPaymentMethod === "wallet" && (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Pay ₹{tournament.entryFee} via Wallet
                      </>
                    )}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;