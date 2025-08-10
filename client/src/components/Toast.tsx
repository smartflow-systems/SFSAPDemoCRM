import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="panel-dark border-gold p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out"
        >
          <div className="flex items-start space-x-3">
            <div className="bg-gold-gradient p-2 rounded-full flex-shrink-0">
              {toast.variant === "destructive" ? (
                <AlertCircle className="w-5 h-5 text-black-900" />
              ) : (
                <CheckCircle className="w-5 h-5 text-black-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gold-100 font-medium text-sm">{toast.title}</p>
              {toast.description && (
                <p className="text-gold-300 text-sm mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gold-300 hover:text-gold-100 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
