import { createContext, type ReactNode, useContext } from "react";
import { useQuery, useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type SessionUser = Pick<User, "id" | "username" | "email" | "role" | "orgId">;
type AuthContextType = {
  user: SessionUser | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: user, error, isLoading } = useQuery<SessionUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ predicate: q => q.queryKey[0] !== "/api/user" });
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/");
    },
    onError: () => {
      toast({ title: "Could not sign out. Try again.", variant: "destructive" });
    },
  });

  return <AuthContext.Provider value={{ user: user ?? null, isLoading, error, logoutMutation }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
