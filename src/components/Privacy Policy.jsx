import React from "react";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = ({ onBack }) => (
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
      <h1 className="text-4xl font-bold text-[#1D3557] mb-6 text-center">Privacy Policy</h1>
      <div className="text-[#457B9D] text-lg space-y-7">
        <p>Elevante is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information when you use our platform.</p>
        <ol className="list-decimal list-inside space-y-5">
          <li>
            <span className="font-bold text-[#1D3557]">Information We Collect</span><br />
            We may collect the following information:
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
              <li>Full name, email address, phone number, user type (entrepreneur, supplier, or investor).</li>
              <li>Business-related data and uploaded documents.</li>
              <li>User activity and platform usage behavior.</li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">How We Use Your Information</span><br />
            We use the collected data to:
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
              <li>Provide essential services on the Elevante platform.</li>
              <li>Enhance user experience and platform functionality.</li>
              <li>Communicate important updates, support messages, or relevant offerings.</li>
              <li>Match you with suitable suppliers or investors based on your profile.</li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Data Protection</span><br />
            We employ appropriate technical and organizational measures to protect your personal information from unauthorized access, misuse, or disclosure.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Information Sharing</span><br />
            We do not sell or rent your personal data. We may share information with trusted third parties only as necessary to deliver services, and always under strict confidentiality agreements.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Cookies</span><br />
            Elevante uses cookies to improve functionality, personalize content, and analyze user interactions. You can manage cookies through your browser settings.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Your Rights</span><br />
            You have the right to access, correct, or request the deletion of your data at any time. To do so, please contact our support team.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Policy Updates</span><br />
            We may revise this Privacy Policy from time to time. All updates will be communicated via email or posted within the platform.
          </li>
          <li>
            <span className="font-bold text-[#1D3557]">Contact Us</span><br />
            If you have any questions or concerns regarding this policy, please contact us at:<br />
            <a href="mailto:support@elevante.com" className="underline hover:text-[#457B9D]">support@elevante.com</a>
          </li>
        </ol>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
