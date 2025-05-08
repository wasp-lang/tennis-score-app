import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../tailwind";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
  position = "top-right",
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const typeStyles = {
    success: {
      bg: "bg-green-100",
      border: "border-green-400",
      text: "text-green-700",
      icon: <CheckCircle className="w-5 h-5 mr-2" />,
    },
    error: {
      bg: "bg-red-100",
      border: "border-red-400",
      text: "text-red-700",
      icon: <AlertCircle className="w-5 h-5 mr-2" />,
    },
    info: {
      bg: "bg-blue-100",
      border: "border-blue-400",
      text: "text-blue-700",
      icon: <Info className="w-5 h-5 mr-2" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={cn(
        "fixed px-4 py-3 rounded flex items-center justify-between shadow-lg transition-opacity animate-fade-in",
        positionClasses[position],
        style.bg,
        style.border,
        style.text
      )}
      role="alert"
    >
      <div className="flex items-center">
        {style.icon}
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
} 