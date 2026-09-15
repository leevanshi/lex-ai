import React, { useEffect } from "react";

export const ClerkProvider = ({ children }: any) => <>{children}</>;
export const publishableKeyFromHost = () => "mock-key";

export const SignIn = () => (
  <div className="p-8 bg-white rounded shadow text-center">
    <h2>Mock Sign In</h2>
    <p>Authentication is currently bypassed.</p>
  </div>
);

export const SignUp = () => (
  <div className="p-8 bg-white rounded shadow text-center">
    <h2>Mock Sign Up</h2>
    <p>Authentication is currently bypassed.</p>
  </div>
);

export const Show = ({ when, children }: any) => {
  if (when === "signed-in") return <>{children}</>;
  if (when === "signed-out") return null; // We are always signed in
  return null;
};

export const useClerk = () => {
  return {
    addListener: (cb: any) => {
      // immediately call with mock user
      cb({ user: { id: "mock-user-123" } });
      return () => {}; // unsubscribe
    },
    signOut: () => {
      console.log("Mock sign out called");
      window.location.href = "/";
    },
  };
};

export const useUser = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "mock-user-123",
      fullName: "LexAI User",
      firstName: "LexAI",
      lastName: "User",
      primaryEmailAddress: { emailAddress: "user@example.com" },
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LexAI",
    },
  };
};

export const useAuth = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "mock-user-123",
    sessionId: "mock-session-123",
    getToken: async () => "mock-token",
  };
};
