import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mail, Link, FileText, ShieldQuestion, Loader2, AlertCircle } from "lucide-react";
import ThreatLevelIndicator from "./threat-level-indicator";

interface ScannerModalProps {
  type: string;
  onClose: () => void;
  onScanComplete: () => void;
}

export default function ScannerModal({ type, onClose, onScanComplete }: ScannerModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: async (data: any) => {
      let endpoint = '';
      let payload: any = {};

      switch (type) {
        case 'email':
          endpoint = '/api/scans/email';
          payload = {
            emailContent: data.emailContent,
            emailHeaders: data.emailHeaders,
          };
          return await apiRequest('POST', endpoint, payload);
        
        case 'url':
          endpoint = '/api/scans/url';
          payload = { url: data.url };
          return await apiRequest('POST', endpoint, payload);
        
        case 'file':
          endpoint = '/api/scans/file';
          const formData = new FormData();
          formData.append('file', data.file);
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error(`${response.status}: ${await response.text()}`);
          }
          return response;
        
        case 'breach':
          endpoint = '/api/scans/breach';
          payload = { email: data.email };
          return await apiRequest('POST', endpoint, payload);
        
        default:
          throw new Error('Invalid scan type');
      }
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setScanResult(result);
      
      // Invalidate and refetch scans
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Scan Complete",
        description: `Scan completed with ${result.threatLevel} threat level`,
        variant: result.threatLevel === 'safe' || result.threatLevel === 'low' ? "default" : "destructive",
      });
      
      onScanComplete();
    },
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
        title: "Scan Failed",
        description: error.message || "Failed to complete scan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let scanData: any = {};
    
    switch (type) {
      case 'email':
        if (!formData.emailContent) {
          toast({
            title: "Missing Data",
            description: "Email content is required",
            variant: "destructive",
          });
          return;
        }
        scanData = {
          emailContent: formData.emailContent,
          emailHeaders: formData.emailHeaders || '',
        };
        break;
      
      case 'url':
        if (!formData.url) {
          toast({
            title: "Missing Data",
            description: "URL is required",
            variant: "destructive",
          });
          return;
        }
        scanData = { url: formData.url };
        break;
      
      case 'file':
        if (!file) {
          toast({
            title: "Missing Data",
            description: "File is required",
            variant: "destructive",
          });
          return;
        }
        scanData = { file };
        break;
      
      case 'breach':
        if (!formData.email) {
          toast({
            title: "Missing Data",
            description: "Email is required",
            variant: "destructive",
          });
          return;
        }
        scanData = { email: formData.email };
        break;
    }
    
    scanMutation.mutate(scanData);
  };

  const getModalTitle = () => {
    switch (type) {
      case 'email': return 'Email Phishing Scanner';
      case 'url': return 'URL Safety Scanner';
      case 'file': return 'File Malware Scanner';
      case 'breach': return 'Data Breach Checker';
      default: return 'Security Scanner';
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case 'email': return <Mail className="w-6 h-6 text-primary-500" />;
      case 'url': return <Link className="w-6 h-6 text-warning-500" />;
      case 'file': return <FileText className="w-6 h-6 text-success-500" />;
      case 'breach': return <ShieldQuestion className="w-6 h-6 text-danger-500" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const renderScanForm = () => {
    switch (type) {
      case 'email':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="emailHeaders">Email Headers (Optional)</Label>
              <Textarea
                id="emailHeaders"
                placeholder="Paste email headers here..."
                rows={3}
                value={formData.emailHeaders || ''}
                onChange={(e) => setFormData({ ...formData, emailHeaders: e.target.value })}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailContent">Email Content *</Label>
              <Textarea
                id="emailContent"
                placeholder="Paste email body content here..."
                rows={6}
                value={formData.emailContent || ''}
                onChange={(e) => setFormData({ ...formData, emailContent: e.target.value })}
                className="resize-none"
                required
              />
            </div>
          </>
        );
      
      case 'url':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="url">URL to Scan *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Scanner Features</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• PhishTank database lookup</li>
                    <li>• Domain reputation analysis</li>
                    <li>• SSL certificate validation</li>
                    <li>• Content analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'file':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.zip,.exe,.js,.html,.htm,.php"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  setFile(selectedFile || null);
                }}
                required
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, ZIP, EXE, JS, HTML, PHP (max 10MB)
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Security Notice</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Files are scanned in a secure environment and are not stored permanently on our servers.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'breach':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Privacy Notice</p>
                  <p className="text-sm text-red-700 mt-1">
                    We only check against known breach databases. Your email is not stored or shared.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Scan Results</span>
            {scanResult.threatLevel === 'safe' || scanResult.threatLevel === 'low' ? (
              <span className="text-success-500">✓</span>
            ) : (
              <span className="text-danger-500">⚠</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Threat Level:</span>
              <ThreatLevelIndicator 
                level={scanResult.threatLevel} 
                score={parseFloat(scanResult.riskScore || '0')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score:</span>
              <span className="text-sm text-gray-600">{scanResult.riskScore}/100</span>
            </div>
            {scanResult.findings && (
              <div>
                <p className="text-sm font-medium mb-2">Findings:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(scanResult.findings, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h3 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderScanForm()}

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                disabled={scanMutation.isPending}
                className={`${
                  type === 'email' ? 'bg-primary-500 hover:bg-primary-600' :
                  type === 'url' ? 'bg-warning-500 hover:bg-warning-600' :
                  type === 'file' ? 'bg-success-500 hover:bg-success-600' :
                  'bg-danger-500 hover:bg-danger-600'
                }`}
              >
                {scanMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <>{getModalIcon()}</>
                )}
                {scanMutation.isPending ? 'Scanning...' : `Scan ${type === 'email' ? 'Email' : type === 'url' ? 'URL' : type === 'file' ? 'File' : 'Breach'}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={scanMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>

          {renderScanResult()}
        </div>
      </div>
    </div>
  );
}
