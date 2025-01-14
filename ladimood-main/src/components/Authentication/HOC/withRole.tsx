import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/Authentication/HOC/authContext";

const withRole = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: string
) => {
  const RequiresRole: React.FC<P> = (props) => {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isLoggedIn) {
          router.replace("/auth/login");
        }
        else if (user?.role?.name !== requiredRole) {
          router.replace("/403"); 
        }
      }
    }, [user, isLoggedIn, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }
    return isLoggedIn && user?.role?.name === requiredRole ? (
      <WrappedComponent {...props} />
    ) : null;
  };

  return RequiresRole;
};

export default withRole;
