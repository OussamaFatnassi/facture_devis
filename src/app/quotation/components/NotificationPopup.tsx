"use client";

import { useEffect } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationPopupProps {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function NotificationPopup({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: NotificationPopupProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
        // Redirection automatique vers la liste des devis pour les notifications de succès
        if (type === 'success') {
          window.location.href = "/quotation/list";
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, type]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-br from-green-100 to-emerald-100",
          border: "border-green-300",
          icon: "text-green-700",
          text: "text-green-900",
          button: "text-green-700 hover:text-green-900",
          iconBg: "bg-green-200",
          progressBar: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-gradient-to-br from-red-100 to-rose-100",
          border: "border-red-300",
          icon: "text-red-700",
          text: "text-red-900",
          button: "text-red-700 hover:text-red-900",
          iconBg: "bg-red-200",
          progressBar: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-br from-amber-100 to-orange-100",
          border: "border-amber-300",
          icon: "text-amber-700",
          text: "text-amber-900",
          button: "text-amber-700 hover:text-amber-900",
          iconBg: "bg-amber-200",
          progressBar: "bg-amber-500",
        };
      case "info":
        return {
          bg: "bg-gradient-to-br from-blue-100 to-sky-100",
          border: "border-blue-300",
          icon: "text-blue-700",
          text: "text-blue-900",
          button: "text-blue-700 hover:text-blue-900",
          iconBg: "bg-blue-200",
          progressBar: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-100 to-slate-100",
          border: "border-gray-300",
          icon: "text-gray-700",
          text: "text-gray-900",
          button: "text-gray-700 hover:text-gray-900",
          iconBg: "bg-gray-200",
          progressBar: "bg-gray-500",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      {/* Popup positionné en haut à droite */}
      <div 
        className={`
          fixed top-4 right-4 z-50 max-w-md w-full mx-4 sm:mx-0
          transform transition-all duration-500 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className={`
          ${styles.bg} ${styles.border} 
          border-2 rounded-2xl shadow-xl backdrop-blur-sm
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100' : 'scale-95'}
        `}>
          <div className="p-5">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`
                ${styles.icon} ${styles.iconBg}
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                shadow-sm
              `}>
                {getIcon()}
              </div>
              
              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className={`${styles.text} text-base font-semibold leading-relaxed`}>
                  {message}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className={`
                  ${styles.button} 
                  w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  hover:bg-white hover:bg-opacity-60 
                  transition-all duration-200
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Action buttons pour le succès */}
            {type === 'success' && (
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => window.location.href = "/quotation/list"}
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                >
                  📋 Voir tous les devis
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white border border-green-300 text-green-700 px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors font-medium text-sm shadow-sm"
                >
                  ➕ Nouveau devis
                </button>
              </div>
            )}
            
            {/* Barre de progression pour l'auto-fermeture */}
            {duration > 0 && (
              <div className="mt-4 w-full bg-white bg-opacity-60 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`
                    h-full transition-all ease-linear rounded-full
                    ${styles.progressBar}
                  `}
                  style={{ 
                    width: '100%',
                    animation: `shrink ${duration}ms linear`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
} 