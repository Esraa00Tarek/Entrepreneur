import InvestorRegisterForm from './InvestorRegisterForm';

export default function RejectedFormPage() {
  // Example old data and feedback for investor role (in English)
  const oldData = {
    fullName: "Ahmed Mohamed",
    email: "ahmed@gmail.com",
    phone: "0123456789",
    city: "Cairo",
    country: "Egypt",
    investmentRange: "",
    supportTypes: ["Financial"],
    linkedin: "",
    website: ""
  };
  const feedback = {
    fullName: "Please enter your full name.",
    email: "Invalid email address.",
    phone: "Phone number is not valid.",
    investmentRange: "Please specify your investment range.",
    contact: "Please provide either LinkedIn or a website."
  };
  return (
    <InvestorRegisterForm oldData={oldData} feedback={feedback} rejected={true} />
  );
} 