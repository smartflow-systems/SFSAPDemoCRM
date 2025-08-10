import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCRM } from "@/contexts/CRMContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useCRM();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleDemoLogin = () => {
    login();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-900 px-4">
      <Card className="w-full max-w-md panel-dark border-gold">
        <CardHeader className="text-center">
          <div className="text-gold-shine text-2xl font-extrabold mb-2">
            Smart Flow Systems
          </div>
          <CardTitle className="text-gold text-xl">CRM Dashboard</CardTitle>
          <p className="text-gold-300 text-sm mt-2">
            Professional customer relationship management for Smart Flow Systems
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="panel-dark border border-gold-800/30 p-4 rounded-lg">
              <h3 className="text-gold font-semibold mb-2">Demo Access</h3>
              <p className="text-gold-300 text-sm mb-3">
                Experience the full CRM functionality with pre-loaded demo data.
              </p>
              <div className="text-gold-300 text-xs space-y-1">
                <p><strong>User:</strong> Gareth Bowers</p>
                <p><strong>Role:</strong> Admin</p>
                <p><strong>Company:</strong> Smart Flow Systems</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDemoLogin}
            className="btn-gold w-full text-lg py-3"
          >
            Continue as Demo User
          </Button>

          <div className="text-center">
            <p className="text-gold-300 text-xs">
              This is a demonstration of the Smart Flow Systems CRM platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
