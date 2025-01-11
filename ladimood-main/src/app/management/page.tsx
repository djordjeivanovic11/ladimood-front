"use client";
import React from 'react';
import SalesManagement from '@/components/Management/SalesManagement';
import OrderManagement from '@/components/Management/OrderManagement';

const ManagementPage: React.FC = () => {
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
};

export default ManagementPage;
