import React from 'react';
import RegisterNavbar from "../components/RegisterNavbar";
import AnimatedMoneyBackground from "../components/animated-money-background";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />
      <RegisterNavbar />
      <main className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="bg-white/95 rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1D3557] mb-4">Your application has been received</h1>
          <p className="text-[#457B9D] text-base mb-4">
            Your information will be reviewed by our team. Your account will be activated after identity verification and approval.
          </p>
          <p className="text-[#1D3557] text-sm mb-6">
            Thank you for joining Elevante! We will notify you by email once your account is activated.
          </p>
        </div>
      </main>
    </div>
  );
} 