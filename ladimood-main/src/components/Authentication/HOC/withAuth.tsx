"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Authentication/HOC/authContext";

function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const RequiresAuth: React.FC<P> = (props) => {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isLoggedIn) {
        router.replace("/auth/login");
      }
    }, [loading, isLoggedIn, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-lg font-medium text-gray-600">Checking authentication...</p>
        </div>
      );
    }

    if (!isLoggedIn) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return RequiresAuth;
}

export default withAuth;
