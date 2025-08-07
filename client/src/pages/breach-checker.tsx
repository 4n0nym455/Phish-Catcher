import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { ShieldQuestion } from "lucide-react";

export default function BreachChecker() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-danger-100 rounded-lg">
            <ShieldQuestion className="w-8 h-8 text-danger-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Breach Checker</h1>
            <p className="text-gray-600 mt-2">Check if your credentials have been compromised in data breaches</p>
          </div>
        </div>

        <div className="text-center py-20">
          <p className="text-gray-500">Breach checker interface will be available soon.</p>
          <p className="text-sm text-gray-400 mt-2">Use the dashboard scanner buttons for now.</p>
        </div>
      </div>
    </div>
  );
}
