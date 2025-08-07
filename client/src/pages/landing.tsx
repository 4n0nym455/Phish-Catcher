import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Search, FileText, Users, TrendingUp, Lock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-primary-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center text-white">
              <Shield className="text-primary-500 text-2xl mr-2" />
              <span className="text-xl font-bold">PhishCatcher</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Threat Detection Platform
            </h1>
            <p className="text-xl text-primary-200 mb-8 max-w-3xl mx-auto">
              Protect your organization from phishing emails, malicious URLs, and data breaches 
              with intelligent threat analysis and real-time reporting.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-4"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Threat Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI and machine learning algorithms to detect, analyze, and prevent cybersecurity threats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Scanner</h3>
                  <p className="text-gray-600">
                    Detect phishing attempts and malicious content in emails using advanced NLP analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-warning-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">URL Scanner</h3>
                  <p className="text-gray-600">
                    Check URLs against threat databases and analyze for malicious indicators
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">File Scanner</h3>
                  <p className="text-gray-600">
                    Upload and scan files for malware, suspicious scripts, and malicious content
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-danger-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Breach Checker</h3>
                  <p className="text-gray-600">
                    Check if credentials have been compromised in known data breaches
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Threat Intelligence</h3>
                  <p className="text-gray-600">
                    Real-time threat intelligence feeds and security insights
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
                  <p className="text-gray-600">
                    Comprehensive admin controls for managing users and analyzing threats
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Organization?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations using PhishCatcher to protect against cyber threats
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-4"
          >
            Start Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="text-primary-500 text-2xl mr-2" />
                <span className="text-xl font-bold">PhishCatcher</span>
              </div>
              <p className="text-gray-300 text-sm max-w-md">
                AI-powered cybersecurity platform protecting organizations from phishing, malware, 
                and data breaches through intelligent threat detection and analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Scanners</a></li>
                <li><a href="#" className="hover:text-white">Reports</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              &copy; 2024 PhishCatcher. All rights reserved. Built for cybersecurity excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
