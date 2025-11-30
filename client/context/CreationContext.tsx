import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ResultType } from "@/types/generation";

export interface Creation {
  id: string;
  url: string;
  type: ResultType;
  timestamp: number;
  prompt: string;
  isDemo?: boolean;
  remixType?: "paid" | "free" | null;
  parentAsset?: any;
  originalUrl?: string;
}

interface CreationContextType {
  resultUrl: string | null;
  setResultUrl: (url: string | null) => void;
  resultType: ResultType;
  setResultType: (type: ResultType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  creations: Creation[];
  addCreation: (
    url: string,
    type: ResultType,
    prompt: string,
    isDemo?: boolean,
    remixType?: "paid" | "free" | null,
    parentAsset?: any,
    originalUrl?: string,
  ) => void;
  removeCreation: (id: string) => void;
  clearCreations: () => void;
  originalPrompt: string;
  setOriginalPrompt: (prompt: string) => void;
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;
}

export const CreationContext = createContext<CreationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "creation_history";
const RESULT_URL_KEY = "current_result_url";
const RESULT_TYPE_KEY = "current_result_type";
const ORIGINAL_PROMPT_KEY = "original_prompt";

export const CreationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [originalPrompt, setOriginalPrompt] = useState<string>("");
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Load creations and current result from localStorage on mount
  useEffect(() => {
    const storedCreations = localStorage.getItem(STORAGE_KEY);
    if (storedCreations) {
      try {
        const allCreations = JSON.parse(storedCreations);
        // Only load non-demo creations from localStorage
        setCreations(allCreations.filter((c: Creation) => !c.isDemo));
      } catch (err) {
        console.error("Failed to load creation history:", err);
      }
    }

    const storedResultUrl = localStorage.getItem(RESULT_URL_KEY);
    const storedResultType = localStorage.getItem(RESULT_TYPE_KEY);
    const storedPrompt = localStorage.getItem(ORIGINAL_PROMPT_KEY);
    if (storedResultUrl) {
      setResultUrl(storedResultUrl);
    }
    if (storedResultType) {
      setResultType(storedResultType as ResultType);
    }
    if (storedPrompt) {
      setOriginalPrompt(storedPrompt);
    }
  }, []);

  // Save creations to localStorage whenever they change (only non-demo)
  useEffect(() => {
    const nonDemoCreations = creations.filter((c) => !c.isDemo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nonDemoCreations));
  }, [creations]);

  // Save current result URL to localStorage (only non-demo)
  useEffect(() => {
    const lastNonDemoResult = creations.find((c) => !c.isDemo);
    if (lastNonDemoResult?.url) {
      localStorage.setItem(RESULT_URL_KEY, lastNonDemoResult.url);
    } else if (!resultUrl?.includes("data:")) {
      // Only persist non-data URLs to localStorage
      if (resultUrl) {
        localStorage.setItem(RESULT_URL_KEY, resultUrl);
      } else {
        localStorage.removeItem(RESULT_URL_KEY);
      }
    }
  }, [resultUrl, creations]);

  // Save current result type to localStorage (only for non-demo)
  useEffect(() => {
    const lastNonDemoResult = creations.find((c) => !c.isDemo);
    if (lastNonDemoResult?.type) {
      localStorage.setItem(RESULT_TYPE_KEY, lastNonDemoResult.type);
    } else if (resultType) {
      localStorage.setItem(RESULT_TYPE_KEY, resultType);
    } else {
      localStorage.removeItem(RESULT_TYPE_KEY);
    }
  }, [resultType, creations]);

  // Save original prompt to localStorage
  useEffect(() => {
    if (originalPrompt) {
      localStorage.setItem(ORIGINAL_PROMPT_KEY, originalPrompt);
    } else {
      localStorage.removeItem(ORIGINAL_PROMPT_KEY);
    }
  }, [originalPrompt]);

  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith("blob:")) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const addCreation = useCallback(
    (
      url: string,
      type: ResultType,
      prompt: string,
      isDemo: boolean = false,
      remixType?: "paid" | "free" | null,
      parentAsset?: any,
      originalUrl?: string,
    ) => {
      const newCreation: Creation = {
        id: `creation_${Date.now()}`,
        url,
        type,
        timestamp: Date.now(),
        prompt,
        isDemo,
        remixType,
        parentAsset,
        originalUrl,
      };
      setCreations((prev) => [newCreation, ...prev]);

      // Auto-remove demo creations after 6 minutes (360000ms)
      if (isDemo) {
        const timeoutId = setTimeout(() => {
          setCreations((prev) => prev.filter((c) => c.id !== newCreation.id));
        }, 360000);

        return () => clearTimeout(timeoutId);
      }
    },
    [],
  );

  const removeCreation = useCallback((id: string) => {
    setCreations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCreations = useCallback(() => {
    setCreations([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      resultUrl,
      setResultUrl,
      resultType,
      setResultType,
      isLoading,
      setIsLoading,
      loadingMessage,
      setLoadingMessage,
      error,
      setError,
      creations,
      addCreation,
      removeCreation,
      clearCreations,
      originalPrompt,
      setOriginalPrompt,
      demoMode,
      setDemoMode,
    }),
    [
      resultUrl,
      resultType,
      isLoading,
      loadingMessage,
      error,
      creations,
      addCreation,
      removeCreation,
      clearCreations,
      originalPrompt,
      demoMode,
    ],
  ) as CreationContextType;

  return (
    <CreationContext.Provider value={contextValue}>
      {children}
    </CreationContext.Provider>
  );
};
