"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDynamicContext, useConnectWithOtp, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Wallet,
  FileSignature,
  Lock,
  Mail,
  Fingerprint,
  Copy,
  LogOut,
  AlertCircle,
  CheckCircle,
  Upload,
  XCircle,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  Eye,
  Clock,
  Key,
  ShieldCheck,
  FileText,
  Zap,
} from "lucide-react"
import toast from 'react-hot-toast'
import { 
  signMessageWithWallet, 
  verifySignatureWithAPI, 
  formatAddress, 
  copyToClipboard,
  checkBackendHealth 
} from "@/lib/web3"

type HistoryItem = {
  id: string
  isValid: boolean
  signerAddress: string
  originalMessage: string
  signature: string
  timestamp: string
  error?: string
}

export default function Web3MessageApp() {

  const { user, primaryWallet, handleLogOut } = useDynamicContext()
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp()
  const isLoggedIn = useIsLoggedIn()


  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [backendHealthy, setBackendHealthy] = useState(false)


  const [message, setMessage] = useState("")
  const [isMessageValid, setIsMessageValid] = useState(false)
  const [showSigningModal, setShowSigningModal] = useState(false)
  const [isSigningInProgress, setIsSigningInProgress] = useState(false)
  const [signature, setSignature] = useState("")
  const [isSubmittingToBackend, setIsSubmittingToBackend] = useState(false)


  const [submissionResult, setSubmissionResult] = useState<{
    isValid: boolean
    signerAddress: string
    originalMessage: string
    signature: string
    timestamp: string
    error?: string
  } | null>(null)
  const [showFullSignature, setShowFullSignature] = useState(false)
  const [signatureHistory, setSignatureHistory] = useState<HistoryItem[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)


  useEffect(() => {
    checkBackendHealth().then(setBackendHealthy)
  }, [])


  useEffect(() => {
    const savedHistory = localStorage.getItem("web3-signature-history")
    if (savedHistory) {
      try {
        setSignatureHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to load signature history:", error)
        toast.error("Failed to load signature history")
      }
    }
  }, [])

  useEffect(() => {
    if (signatureHistory.length > 0) {
      localStorage.setItem("web3-signature-history", JSON.stringify(signatureHistory))
    }
  }, [signatureHistory])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await connectWithEmail(email)
      setShowOtpInput(true)
      toast.success("OTP sent to your email!")
    } catch (error: any) {
      console.error("Email authentication failed:", error)
      toast.error(error.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return

    setIsLoading(true)
    try {
      await verifyOneTimePassword(otp)
      toast.success("Successfully authenticated!")
    } catch (error: any) {
      console.error("OTP verification failed:", error)
      toast.error(error.message || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await handleLogOut()
      setEmail("")
      setOtp("")
      setShowOtpInput(false)
      setMessage("")
      setShowSigningModal(false)
      setSignature("")
      setSubmissionResult(null)
      setSelectedHistoryItem(null)
      setShowHistoryModal(false)
      toast.success("Disconnected successfully")
    } catch (error: any) {
      console.error("Disconnect failed:", error)
      toast.error("Failed to disconnect")
    }
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    setIsMessageValid(value.trim().length > 0)
    if (submissionResult) {
      setSubmissionResult(null)
    }
  }

  const copyWalletAddress = async () => {
    if (primaryWallet?.address) {
      const success = await copyToClipboard(primaryWallet.address)
      if (success) {
        toast.success("Address copied to clipboard")
      } else {
        toast.error("Failed to copy address")
      }
    }
  }

  const handleSignMessage = () => {
    if (!isMessageValid || !primaryWallet) return
    
    if (!backendHealthy) {
      toast.error("Backend server is not available. Please ensure the backend is running.")
      return
    }

    setShowSigningModal(true)
    setIsSigningInProgress(true)
    setSignature("")
    setSubmissionResult(null)

   
    signMessageWithWallet(primaryWallet, message)
      .then((result) => {
        setSignature(result.signature)
        setIsSigningInProgress(false)
       
        setTimeout(() => {
          setShowSigningModal(true)
        }, 100)
        toast.success("Message signed successfully!")
      })
      .catch((error) => {
        console.error("Signing failed:", error)
        setIsSigningInProgress(false)
        toast.error(error.message || "Failed to sign message")
        setShowSigningModal(false)
      })
  }

  const handleSubmitToBackend = async () => {
    if (!signature) return

    setIsSubmittingToBackend(true)

    try {
      const result = await verifySignatureWithAPI(message, signature)
      
      setIsSubmittingToBackend(false)
      setShowSigningModal(false) 

      const submissionData = {
        isValid: result.isValid,
        signerAddress: result.signer,
        originalMessage: result.originalMessage,
        signature,
        timestamp: result.timestamp,
        error: result.error
      }

      setSubmissionResult(submissionData)


      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        ...submissionData,
      }
      setSignatureHistory((prev) => [historyItem, ...prev])

      if (result.isValid) {
        toast.success("Signature verified successfully!")
      } else {
        toast.error("Signature verification failed")
      }

    } catch (error: any) {
      console.error("Backend verification failed:", error)
      setIsSubmittingToBackend(false)
      setShowSigningModal(false) 
      
      const errorData = {
        isValid: false,
        signerAddress: primaryWallet?.address || "",
        originalMessage: message,
        signature,
        timestamp: new Date().toISOString(),
        error: error.message || "Backend verification failed"
      }

      setSubmissionResult(errorData)
      
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        ...errorData,
      }
      setSignatureHistory((prev) => [historyItem, ...prev])

      toast.error(error.message || "Failed to verify signature with backend")
    }
  }

  const copySignature = async () => {
    if (signature) {
      const success = await copyToClipboard(signature)
      if (success) {
        toast.success("Signature copied to clipboard")
      } else {
        toast.error("Failed to copy signature")
      }
    }
  }

  const copyResultSignature = async () => {
    if (submissionResult?.signature) {
      const success = await copyToClipboard(submissionResult.signature)
      if (success) {
        toast.success("Signature copied to clipboard")
      } else {
        toast.error("Failed to copy signature")
      }
    }
  }

  const dismissResults = () => {
    setSubmissionResult(null)
  }

  const deleteHistoryItem = (id: string) => {
    setSignatureHistory((prev) => prev.filter((item) => item.id !== id))
    toast.success("History item deleted")
  }

  const viewHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item)
    setShowHistoryModal(true)
  }

  const copyHistorySignature = async (signature: string) => {
    const success = await copyToClipboard(signature)
    if (success) {
      toast.success("Signature copied to clipboard")
    } else {
      toast.error("Failed to copy signature")
    }
  }

  const getMessageSnippet = (message: string, maxLength = 50) => {
    return message.length > maxLength ? message.slice(0, maxLength) + "..." : message
  }

 
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/20 glow-primary">
                <FileSignature className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Web3 Message Signer
            </h1>
            <p className="text-muted-foreground mt-2">Secure message signing and verification</p>
          </div>

          {/* Backend Health Warning */}
          {!backendHealthy && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Backend Offline</span>
              </div>
              <p className="text-xs text-yellow-500/80 mt-1">
                The backend server is not available. Signature verification will not work.
              </p>
            </div>
          )}

          {/* Authentication Card */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {showOtpInput ? "Verify Identity" : "Sign In"}
              </CardTitle>
              <CardDescription>
                {showOtpInput ? "Enter the OTP sent to your email" : "Enter your email to continue securely"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showOtpInput ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border-border/50 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending OTP...
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">OTP Sent</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Check your email: {email}</p>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-input border-border/50 focus:border-primary focus:ring-primary/20 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300"
                    disabled={isLoading || !otp}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowOtpInput(false)
                      setOtp("")
                    }}
                  >
                    Back to Email
                  </Button>
                </form>
              )}

              {/* Trust indicators */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Web3 Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20 glow-primary">
                <FileSignature className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Web3 Message Signer
                </h1>
                <p className="text-sm text-muted-foreground">Secure signing & verification</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Backend Health Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  Backend {backendHealthy ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Wallet Address Display */}
              {primaryWallet?.address && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono">
                    {formatAddress(primaryWallet.address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyWalletAddress}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-border/50 hover:border-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Message Signing Section */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Sign Message
              </CardTitle>
              <CardDescription>Enter your custom message below to create a cryptographic signature</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message Content
                </label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  className="min-h-32 bg-input border-border/50 focus:border-primary focus:ring-primary/20 resize-none"
                  rows={6}
                />

                {/* Real-time validation feedback */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {message.trim().length === 0 ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <AlertCircle className="w-3 h-3" />
                        <span>Message cannot be empty</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-primary">
                        <CheckCircle className="w-3 h-3" />
                        <span>Ready to sign</span>
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground">{message.length} characters</span>
                </div>
              </div>

              <Button
                onClick={handleSignMessage}
                disabled={!isMessageValid || !primaryWallet || !backendHealthy}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Sign Message
              </Button>

              {!backendHealthy && (
                <p className="text-xs text-yellow-500/80 text-center">
                  Backend server is offline. Please start the backend to enable signature verification.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Rest of the component remains the same as the original mock version */}
          {/* Results Display, History, Modals etc. - keeping the same UI structure */}
          
          {submissionResult && (
            <Card
              className={`backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl ${
                submissionResult.isValid
                  ? "border-l-4 border-l-primary glow-primary"
                  : "border-l-4 border-l-destructive"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {submissionResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    {submissionResult.isValid ? "Signature Verified" : "Verification Failed"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={dismissResults} className="h-6 w-6 p-0 hover:bg-muted">
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
                <CardDescription>
                  {submissionResult.isValid
                    ? "Your message signature has been successfully validated"
                    : "There was an issue validating your signature"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={submissionResult.isValid ? "default" : "destructive"}
                    className={
                      submissionResult.isValid
                        ? "bg-primary/20 text-primary border-primary/50"
                        : "bg-destructive/20 text-destructive border-destructive/50"
                    }
                  >
                    {submissionResult.isValid ? "Valid" : "Invalid"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(submissionResult.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Error Message */}
                {!submissionResult.isValid && submissionResult.error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{submissionResult.error}</p>
                  </div>
                )}

                {/* Signer Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signer Address</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Wallet className="w-4 h-4 text-primary" />
                    <code className="text-sm font-mono flex-1">{submissionResult.signerAddress}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(submissionResult.signerAddress)}
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Original Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Original Message</label>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50 max-h-24 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap break-words">{submissionResult.originalMessage}</p>
                  </div>
                </div>

                {/* Signature with Expandable Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signature</label>
                  <Collapsible open={showFullSignature} onOpenChange={setShowFullSignature}>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <code className="text-xs font-mono flex-1 break-all">
                        {showFullSignature
                          ? submissionResult.signature
                          : `${submissionResult.signature.slice(0, 20)}...${submissionResult.signature.slice(-20)}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyResultSignature}
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                          {showFullSignature ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature History - keeping same structure as original */}
          {signatureHistory.length > 0 && (
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-secondary" />
                  Signature History
                </CardTitle>
                <CardDescription>
                  View and manage your past signed messages ({signatureHistory.length} total)
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Accordion type="single" collapsible className="space-y-2">
                    {signatureHistory.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border border-border/50 rounded-lg px-4 bg-muted/20"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-3">
                              {item.isValid ? (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <div className="text-left">
                                <p className="text-sm font-medium">{getMessageSnippet(item.originalMessage)}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                                  <Badge
                                    variant={item.isValid ? "default" : "destructive"}
                                    className={`text-xs ${
                                      item.isValid
                                        ? "bg-primary/20 text-primary border-primary/50"
                                        : "bg-destructive/20 text-destructive border-destructive/50"
                                    }`}
                                  >
                                    {item.isValid ? "Valid" : "Invalid"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-4">
                          <div className="space-y-3">
                            {/* Signer Address */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Signer</label>
                              <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border/50">
                                <code className="text-xs font-mono flex-1">
                                  {formatAddress(item.signerAddress)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.signerAddress)}
                                  className="h-5 w-5 p-0 hover:bg-primary/10"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Error Message */}
                            {!item.isValid && item.error && (
                              <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                                <p className="text-xs text-destructive">{item.error}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewHistoryItem(item)}
                                className="flex items-center gap-1 text-xs border-border/50 hover:border-secondary hover:bg-secondary/10"
                              >
                                <Eye className="w-3 h-3" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteHistoryItem(item.id)}
                                className="flex items-center gap-1 text-xs border-border/50 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Connected & Ready
            </Badge>
          </div>
        </div>
      </main>

      {/* Signing Modal */}
      <Dialog open={showSigningModal} onOpenChange={(open) => {
   
        if (!open && isSigningInProgress) {
          return
        }
      
        if (!open && signature && !submissionResult && !isSigningInProgress) {
          return
        }
        setShowSigningModal(open)
      }}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              {isSigningInProgress ? "Signing Message..." : signature ? "Message Signed" : "Sign Message"}
            </DialogTitle>
            <DialogDescription>
              {isSigningInProgress
                ? "Creating cryptographic signature for your message"
                : signature
                  ? "Your message has been successfully signed"
                  : "Review your message before signing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Message Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Preview</label>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50 max-h-32 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
              </div>
            </div>

            {/* Signing Process or Signature Display */}
            {isSigningInProgress ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <FileSignature className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Generating signature...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please confirm in your wallet</p>
                </div>
              </div>
            ) : signature ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signature</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <code className="text-xs font-mono flex-1 break-all">
                      {signature.slice(0, 20)}...{signature.slice(-20)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copySignature}
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Signature generated successfully</span>
                </div>

                <Button
                  onClick={handleSubmitToBackend}
                  disabled={isSubmittingToBackend || !backendHealthy}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground glow-secondary transition-all duration-300"
                >
                  {isSubmittingToBackend ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                      Verifying with Backend...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>

                {!backendHealthy && (
                  <p className="text-xs text-destructive text-center">
                    Backend is offline. Cannot verify signature.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-secondary" />
              Signature Details
            </DialogTitle>
            <DialogDescription>Complete information for this signed message</DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedHistoryItem.isValid ? "default" : "destructive"}
                  className={
                    selectedHistoryItem.isValid
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-destructive/20 text-destructive border-destructive/50"
                  }
                >
                  {selectedHistoryItem.isValid ? "Valid" : "Invalid"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Error Message */}
              {!selectedHistoryItem.isValid && selectedHistoryItem.error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{selectedHistoryItem.error}</p>
                </div>
              )}

              {/* Signer Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Signer Address</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Wallet className="w-4 h-4 text-primary" />
                  <code className="text-sm font-mono flex-1">{selectedHistoryItem.signerAddress}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedHistoryItem.signerAddress)}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Original Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Original Message</label>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50 max-h-32 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedHistoryItem.originalMessage}</p>
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Signature</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <code className="text-xs font-mono flex-1 break-all">{selectedHistoryItem.signature}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyHistorySignature(selectedHistoryItem.signature)}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
