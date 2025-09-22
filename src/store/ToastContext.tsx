import React, { createContext, useContext, useState, ReactNode } from "react";
import { IonToast } from "@ionic/react";

interface ToastButton {
  text?: string;
  icon?: string;
  side?: "start" | "end";
  role?: "cancel" | string;
  cssClass?: string | string[];
  htmlAttributes?: { [key: string]: any };
  handler?: () => boolean | void | Promise<boolean | void>;
}

interface ToastOptions {
  isOpen: boolean;
  message: string;
  duration?: number;
  color?: string;
  position?: "top" | "middle" | "bottom";
  buttons?: ToastButton[];
  icon?: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {
    console.log("");
  },
  hideToast: () => {
    console.log("");
  },
});

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toastOptions, setToastOptions] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToastOptions(options);
  };

  const hideToast = () => {
    setToastOptions((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <IonToast
        isOpen={toastOptions?.isOpen ?? false}
        onDidDismiss={hideToast}
        message={toastOptions?.message}
        duration={toastOptions?.duration ?? 0}
        color={toastOptions?.color ?? "dark"}
        position={toastOptions?.position ?? "bottom"}
        buttons={toastOptions?.buttons}
        positionAnchor="tab-bar"
        icon={toastOptions?.icon}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
