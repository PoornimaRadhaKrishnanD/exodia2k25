import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    upiId: "",
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Pay securely with your card",
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: <Wallet className="h-5 w-5" />,
      description: "Pay using UPI ID or QR code",
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
    } else if (selectedPaymentMethod === "upi") {
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

              {/* UPI Payment Form */}
              {selectedPaymentMethod === "upi" && (
                <div className="space-y-4">
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
                        <p className="font-medium mb-1">UPI Payment Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Enter your UPI ID (e.g., yourname@paytm)</li>
                          <li>You will receive a payment request</li>
                          <li>Approve the payment in your UPI app</li>
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
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3"
                size="lg"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Pay ₹{tournament.entryFee} & Register
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