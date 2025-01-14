"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/api/axiosInstance";
import OrderManagement from "@/components/Management/OrderManagement";
import SalesManagement from "@/components/Management/SalesManagement";
import { User } from "@/app/types/types";

export default function ManagementPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Example: read token from localStorage (or cookies via document.cookie)
    const token = localStorage.getItem("token");
    if (!token) {
      // No token => redirect to login
      router.replace("/auth/login");
      return;
    }

    // Call your API to verify the user's details
    axiosInstance
      .get<User>("/account/me") 
      .then((res) => {
        const user = res.data;
        if (user?.role?.name !== "ADMIN") {
          // return to previous page
          router.back();
          alert("You are not authorized to access this page.");
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        // On error, go to login
        router.replace("/auth/login");
      });
  }, [router]);

  // While we’re fetching the user data, show a loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render the management dashboard if the user is allowed
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#0097B2]">Management Dashboard</h1>
      </header>
      <main className="space-y-8">
        <section>
          <OrderManagement />
        </section>
        <section>
          <SalesManagement />
        </section>
      </main>
    </div>
  );
}
