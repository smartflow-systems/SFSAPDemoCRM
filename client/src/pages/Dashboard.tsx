import { useState } from "react";
import GitHubSidebar from "../components/Dashboard/GitHubSidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* GitHub-style Sidebar */}
      <GitHubSidebar />

      {/* Main Content */}
      <main className="pt-20 px-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0D0D0D] mb-4">
            Welcome to SmartFlow Systems
          </h1>
          <p className="text-lg text-[#3B2F2F] mb-8">
            Your intelligent workflow automation platform.
          </p>

          {/* Add your dashboard content here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-[#3B2F2F]/20">
              <h3 className="text-xl font-semibold text-[#0D0D0D] mb-2">
                Quick Stats
              </h3>
              <p className="text-[#3B2F2F]">
                Your dashboard content goes here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
