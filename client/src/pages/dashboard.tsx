import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThreatLevelIndicator from "@/components/threat-level-indicator";
import ScannerModal from "@/components/scanner-modal";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Database,
  Mail,
  Link,
  FileText,
  ShieldQuestion,
  Download,
  Calendar,
  Settings,
  HelpCircle,
  CircleAlert,
  Bug,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load dashboard stats",
        variant: "destructive",
      });
    },
  });

  // Fetch recent scans
  const { data: recentScans, isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scans"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Fetch threat intelligence
  const { data: threats, isLoading: threatsLoading } = useQuery({
    queryKey: ["/api/threats"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-primary-500" />;
      case 'url': return <Link className="w-4 h-4 text-warning-500" />;
      case 'file': return <FileText className="w-4 h-4 text-success-500" />;
      case 'breach': return <ShieldQuestion className="w-4 h-4 text-danger-500" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor threats, analyze risks, and protect your digital assets</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Safe Scans"
            value={statsLoading ? "..." : stats?.safeScans?.toLocaleString() || "0"}
            change="+12% from last month"
            changeType="positive"
            icon={<Shield className="w-6 h-6 text-success-500" />}
            bgColor="bg-success-50"
          />
          <StatsCard
            title="Threats Detected"
            value={statsLoading ? "..." : stats?.threatsDetected?.toLocaleString() || "0"}
            change="+3% from last month"
            changeType="negative"
            icon={<AlertTriangle className="w-6 h-6 text-warning-500" />}
            bgColor="bg-warning-50"
          />
          <StatsCard
            title="Total Scans"
            value={statsLoading ? "..." : stats?.totalScans?.toLocaleString() || "0"}
            change="+18% from last month"
            changeType="positive"
            icon={<Search className="w-6 h-6 text-primary-500" />}
            bgColor="bg-primary-50"
          />
          <StatsCard
            title="Breached Accounts"
            value={statsLoading ? "..." : stats?.breachedAccounts?.toLocaleString() || "0"}
            change="+2 new breaches"
            changeType="negative"
            icon={<Database className="w-6 h-6 text-danger-500" />}
            bgColor="bg-danger-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Scanner Tools */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Security Scanners</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Scanner Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Email Scanner */}
                  <div 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => setActiveModal('email')}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <Mail className="w-5 h-5 text-primary-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 ml-3">Email Scanner</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Analyze email content for phishing attempts and malicious links</p>
                    <Button className="w-full bg-primary-500 hover:bg-primary-600">
                      Scan Email
                    </Button>
                  </div>

                  {/* URL Scanner */}
                  <div 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => setActiveModal('url')}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-warning-50 rounded-lg">
                        <Link className="w-5 h-5 text-warning-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 ml-3">URL Scanner</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Check URLs for malicious content and phishing attempts</p>
                    <Button className="w-full bg-warning-500 hover:bg-warning-600">
                      Scan URL
                    </Button>
                  </div>

                  {/* File Scanner */}
                  <div 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => setActiveModal('file')}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-success-50 rounded-lg">
                        <FileText className="w-5 h-5 text-success-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 ml-3">File Scanner</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Upload and scan files for malware and suspicious content</p>
                    <Button className="w-full bg-success-500 hover:bg-success-600">
                      Upload File
                    </Button>
                  </div>

                  {/* Breach Checker */}
                  <div 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => setActiveModal('breach')}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-danger-50 rounded-lg">
                        <ShieldQuestion className="w-5 h-5 text-danger-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 ml-3">Breach Checker</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Check if your credentials have been compromised in data breaches</p>
                    <Button className="w-full bg-danger-500 hover:bg-danger-600">
                      Check Breach
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Scan Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Scan Results</CardTitle>
                  <Button variant="link" className="text-primary-500 hover:text-primary-600">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading scans...</p>
                  </div>
                ) : recentScans && recentScans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Target</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Risk Level</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentScans.map((scan: any) => (
                          <tr key={scan.id}>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getScanIcon(scan.type)}
                                <span className="text-sm font-medium ml-2 capitalize">{scan.type}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                              {scan.target}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                scan.status === 'completed' 
                                  ? scan.threatLevel === 'safe' || scan.threatLevel === 'low'
                                    ? 'bg-success-50 text-success-800'
                                    : scan.threatLevel === 'medium'
                                    ? 'bg-warning-50 text-warning-800'
                                    : 'bg-danger-50 text-danger-800'
                                  : 'bg-gray-50 text-gray-800'
                              }`}>
                                {scan.status === 'completed' 
                                  ? scan.threatLevel === 'safe' || scan.threatLevel === 'low' 
                                    ? 'Safe' 
                                    : scan.threatLevel === 'medium'
                                    ? 'Suspicious'
                                    : 'Threat'
                                  : 'Pending'
                                }
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <ThreatLevelIndicator 
                                level={scan.threatLevel || 'safe'} 
                                score={parseFloat(scan.riskScore || '0')} 
                              />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatTimeAgo(scan.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No scans yet. Start by scanning an email, URL, or file.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Threat Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                {threatsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : threats && threats.length > 0 ? (
                  <div className="space-y-4">
                    {threats.slice(0, 3).map((threat: any) => (
                      <div key={threat.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          threat.severity === 'high' || threat.severity === 'critical' 
                            ? 'bg-danger-50' 
                            : threat.severity === 'medium'
                            ? 'bg-warning-50'
                            : 'bg-primary-50'
                        }`}>
                          {threat.type === 'phishing' ? (
                            <CircleAlert className={`w-4 h-4 ${
                              threat.severity === 'high' || threat.severity === 'critical' 
                                ? 'text-danger-500' 
                                : threat.severity === 'medium'
                                ? 'text-warning-500'
                                : 'text-primary-500'
                            }`} />
                          ) : threat.type === 'malware' ? (
                            <Bug className={`w-4 h-4 ${
                              threat.severity === 'high' || threat.severity === 'critical' 
                                ? 'text-danger-500' 
                                : threat.severity === 'medium'
                                ? 'text-warning-500'
                                : 'text-primary-500'
                            }`} />
                          ) : (
                            <Shield className={`w-4 h-4 ${
                              threat.severity === 'high' || threat.severity === 'critical' 
                                ? 'text-danger-500' 
                                : threat.severity === 'medium'
                                ? 'text-warning-500'
                                : 'text-primary-500'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{threat.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{threat.description}</p>
                          <span className="text-xs text-gray-500">{formatTimeAgo(threat.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No active threats detected</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-primary-500 border-primary-500 hover:bg-primary-50"
                  onClick={() => window.location.href = '/threat-intelligence'}
                >
                  View Full Intelligence
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => window.location.href = '/reports'}
                  >
                    <div className="flex items-center">
                      <Download className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Export Report</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => toast({ title: "Feature Coming Soon", description: "Report scheduling will be available soon." })}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Schedule Report</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => toast({ title: "Feature Coming Soon", description: "Settings page will be available soon." })}
                  >
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => toast({ title: "Feature Coming Soon", description: "Help center will be available soon." })}
                  >
                    <div className="flex items-center">
                      <HelpCircle className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Help Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Score */}
            <Card>
              <CardHeader>
                <CardTitle>Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success-50 mb-3">
                    <span className="text-2xl font-bold text-success-600">87</span>
                  </div>
                  <p className="text-sm text-gray-600">Overall Security Rating</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Security</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-14 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">90%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL Protection</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-12 h-2 bg-warning-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">75%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">File Safety</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-15 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">95%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Scanner Modals */}
      {activeModal && (
        <ScannerModal 
          type={activeModal} 
          onClose={() => setActiveModal(null)}
          onScanComplete={() => {
            // Refresh scans data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
