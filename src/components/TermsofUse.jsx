import React from "react";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = ({ onBack }) => (
  <div className="min-h-screen bg-[#EEF8F7] p-6">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-10 border border-[#A8DADC] mt-12 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-6 top-6 flex items-center text-[#457B9D] hover:text-[#1D3557] transition-colors text-lg font-semibold"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </button>
      )}
      <h1 className="text-4xl font-bold text-[#1D3557] mb-6 text-center">Terms of Use</h1>
      <div className="text-[#457B9D] text-lg space-y-7">
        <p>Welcome to Elevante. By accessing or using our website or mobile application, you agree to comply with the following terms:</p>
        <ol className="list-decimal list-inside space-y-5">
          <li>
            <span className="font-bold text-[#1D3557]">Acceptance of Terms</span><br />
            By using Elevante, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree, please refrain from using the platform.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Eligibility</span><br />
            You must be at least 18 years old to use our services. By registering, you confirm that you have the legal capacity to enter into this agreement.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Account Registration</span><br />
            You are responsible for maintaining the confidentiality of your login credentials and are fully responsible for all activities that occur under your account.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Platform Usage</span><br />
            You agree not to use Elevante for any unlawful or unauthorized purposes, including but not limited to:
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
              <li>Submitting offensive or harmful content.</li>
              <li>Impersonating others or providing false information.</li>
              <li>Engaging in fraudulent or disruptive activities.</li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Intellectual Property</span><br />
            All content, design, and technology on the platform are the property of Elevante or its partners and may not be copied or redistributed without permission.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">User-Generated Content</span><br />
            You are solely responsible for any content you upload or submit, and it must not violate any intellectual property rights or applicable laws.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Account Suspension or Termination</span><br />
            We reserve the right to suspend or terminate your account without prior notice if you violate these terms.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Modifications to Terms</span><br />
            We may update these terms at any time. You will be notified via email or platform notification when changes occur.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Governing Law</span><br />
            These terms shall be governed by and interpreted in accordance with the laws of the Arab Republic of Egypt. Any disputes shall be resolved in the relevant Egyptian courts.
          </li>
        </ol>
        <div className="mt-8 p-4 bg-[#F1FAEE] rounded-xl border border-[#A8DADC] text-[#1D3557] text-center">
          For any questions, please contact us at: <a href="mailto:support@elevante.com" className="underline hover:text-[#457B9D]">support@elevante.com</a>
        </div>
      </div>
    </div>
  </div>
);

export default TermsOfUse;
