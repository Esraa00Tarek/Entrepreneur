import React, { useState, useEffect } from "react";
import {
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { format } from "date-fns";
import BusinessSelector from "../../components/BusinessSelector";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const OffersPage = (props) => {
  // Load selected business from localStorage or default to first
  const getInitialBusiness = () => {
    const saved = localStorage.getItem("selectedBusinessId");
    return saved || "";
  };
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    getInitialBusiness()
  );
  const [viewOffer, setViewOffer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null); // 'type' or 'sort' or null
  const [dropdownOpenBusiness, setDropdownOpenBusiness] = useState(false);
  const [profileModal, setProfileModal] = useState(null); // {type, name, id}
  const [confirmRejectOfferId, setConfirmRejectOfferId] = useState(null);

  // Filtering state
  const [typeFilter, setTypeFilter] = useState("All"); // All, Supply, Investment
  const [subTypeFilter, setSubTypeFilter] = useState("All"); // Sub-filter for Supply
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  const params = useParams();
  const requestId = props.requestId || params.requestId;
  const [businesses, setBusinesses] = useState([]);
  const [offersState, setOffersState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/businesses/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const businessesArr = (res.data.data || []).map((biz) => ({
          id: biz._id,
          name: biz.name,
        }));
        setBusinesses(businessesArr);
        if (!selectedBusinessId && businessesArr.length > 0) {
          setSelectedBusinessId(businessesArr[0].id);
        }
      } catch (err) {
        setError("Failed to load businesses");
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
    // eslint-disable-next-line
  }, []);



  // Fetch all offers for the selected business
  useEffect(() => {
    if (!selectedBusinessId) {
      setOffersState([]);
      return;
    }
    
    const fetchOffersForBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/offers/business/${selectedBusinessId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        console.log("OFFERS FOR BUSINESS:", res.data);
        setOffersState(res.data.data || []);
      } catch (err) {
        setError("Failed to load offers");
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffersForBusiness();
  }, [selectedBusinessId]);

  useEffect(() => {
    if (selectedBusinessId)
      localStorage.setItem("selectedBusinessId", selectedBusinessId);
  }, [selectedBusinessId]);

  const navigate = useNavigate();

  // Filter offers by type and subtype
  let offers = offersState;
  if (typeFilter !== "All") {
    offers = offers.filter((o) => o.offerType === typeFilter);
  }
  if (typeFilter === "Supply" && subTypeFilter !== "All") {
    offers = offers.filter((o) => o.requestSupplyType === subTypeFilter);
  }
  offers = offers.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Accept offer and navigate to appropriate page
  const handleAccept = async (offerId) => {
    setViewOffer(null);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/offers/${offerId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Find the offer to determine its type
      const acceptedOffer = offersState.find(offer => offer._id === offerId);
      const isInvestment = acceptedOffer?.offerType === 'Investment';
      
      // Remove accepted offer from the list
      setOffersState(prevOffers => 
        prevOffers.filter(offer => offer._id !== offerId)
      );
      
      toast.success(`Offer accepted successfully! Redirecting to ${isInvestment ? 'deals' : 'orders'}...`);
      
      // Navigate to appropriate page based on offer type
      setTimeout(() => {
        if (isInvestment) {
          navigate('/my-deals');
        } else {
          navigate('/my-orders'); // You'll need to create this page or use existing orders page
        }
      }, 1500);
      
    } catch (err) {
      setError("Failed to accept offer");
      toast.error("Failed to accept offer.");
    } finally {
      setLoading(false);
    }
  };
  // رفض العرض فعليًا من الباكند
  const handleReject = (offerId) => {
    setConfirmRejectOfferId(offerId);
  };
  const confirmReject = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/offers/${confirmRejectOfferId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Remove the rejected offer from the list
      setOffersState(prevOffers => 
        prevOffers.filter(offer => offer._id !== confirmRejectOfferId)
      );
      
      setViewOffer(null);
      setConfirmRejectOfferId(null);
      toast.success("Offer rejected successfully!");
    } catch (err) {
      setError("Failed to reject offer");
      toast.error("Failed to reject offer.");
    } finally {
      setLoading(false);
    }
  };
  const cancelReject = () => {
    setConfirmRejectOfferId(null);
  };

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Business Selector - Styled like MyBusiness */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <BusinessSelector
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            onChange={setSelectedBusinessId}
            loading={loading}
          />
        </div>
        <div className="flex flex-row gap-4 items-center justify-end w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-[#457B9D]" />
            <div className="relative w-full max-w-xs">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                onClick={() =>
                  setDropdownOpen(dropdownOpen === "type" ? null : "type")
                }
              >
                <span className="truncate max-w-[100px] whitespace-nowrap block">
                  {typeFilter === "All" ? "All Types" : typeFilter}
                </span>
                {dropdownOpen === "type" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {dropdownOpen === "type" && (
                <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                  {["All", "Supply", "Investment"].map((option) => (
                    <div
                      key={option}
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 hover:text-[#457B9D] transition-all ${
                        typeFilter === option
                          ? "bg-[#457B9D]/20 text-[#457B9D]"
                          : "text-[#457B9D]"
                      }`}
                      onClick={() => {
                        setTypeFilter(option);
                        setSubTypeFilter("All");
                        setDropdownOpen(null);
                      }}
                    >
                      {option === "All" ? "All Types" : option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Sub-filter that appears only when Supply is selected */}
            {typeFilter === "Supply" && (
              <div className="relative w-full max-w-xs">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === "subtype" ? null : "subtype"
                    )
                  }
                >
                  <span className="truncate max-w-[100px] whitespace-nowrap block">
                    {subTypeFilter === "All"
                      ? "All Supply Types"
                      : subTypeFilter}
                  </span>
                  {dropdownOpen === "subtype" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {dropdownOpen === "subtype" && (
                  <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                    {["All", "Product", "Service"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 hover:text-[#457B9D] transition-all ${
                          subTypeFilter === option
                            ? "bg-[#457B9D]/20 text-[#457B9D]"
                            : "text-[#457B9D]"
                        }`}
                        onClick={() => {
                          setSubTypeFilter(option);
                          setDropdownOpen(null);
                        }}
                      >
                        {option === "All" ? "All Supply Types" : option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-5 h-5 text-[#457B9D]" />
            <div className="relative w-full max-w-xs">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                onClick={() =>
                  setDropdownOpen(dropdownOpen === "sort" ? null : "sort")
                }
              >
                <span className="truncate max-w-[100px] whitespace-nowrap block">
                  {sortBy === "newest" ? "Newest First" : "Oldest First"}
                </span>
                {dropdownOpen === "sort" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {dropdownOpen === "sort" && (
                <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 hover:text-[#457B9D] transition-all ${
                        sortBy === option.value
                          ? "bg-[#457B9D]/20 text-[#457B9D]"
                          : "text-[#457B9D]"
                      }`}
                      onClick={() => {
                        setSortBy(option.value);
                        setDropdownOpen(null);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Top Header Section */}
      {selectedBusinessId && (
        <div className="mb-8">
          {/* Filters */}
          {/* Filters are now in the header row above */}
        </div>
      )}
      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D]"></div>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#1D3557" }}>
            Loading offers...
          </h3>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center mb-4">
            <Info className="w-12 h-12" style={{ color: "#E63946" }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#E63946" }}>
            {error}
          </h3>
        </div>
      )}

      {/* Offers List or Empty State */}
      {!loading && !error && !selectedBusinessId ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center mb-4">
            <Info className="w-12 h-12" style={{ color: "#1D3557" }} />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "#1D3557" }}
          >
            {businesses.length === 0 
              ? "No businesses found. Please create a business first." 
              : "Please select a business to view offers."
            }
          </h3>
          {businesses.length === 0 && (
            <p className="text-gray-600 mt-2">
              You need to create a business first before you can receive offers.
            </p>
          )}
        </div>
      ) : !loading && !error && offers.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center mb-4">
            <Info className="w-12 h-12" style={{ color: "#1D3557" }} />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "#1D3557" }}
          >
            No offers received yet for this business.
          </h3>
          <p className="text-gray-600 mt-2">
            When you receive offers, they will appear here.
          </p>
        </div>
      ) : !loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full justify-between animate-fade-in-up"
            >
              <div>
                {/* Request title */}
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Request:</span>
                  <span className="text-sm font-medium text-[#457B9D] ml-1">
                    {offer.requestTitle || 'Unknown Request'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-[#1D3557] text-lg">
                    {offer.offeredByInfo?.name || 'Unknown User'}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                      statusStyles[offer.status]
                    } text-[#1D3557] bg-[#F1F5F9]`}
                  >
                    {offer.status}
                  </span>
                  <span className="ml-2 text-xs bg-[#F1F5F9] text-[#1D3557] px-2 py-0.5 rounded-full">
                    {offer.offerType}
                    {offer.offerType === "Supply" && offer.requestSupplyType
                      ? ` / ${offer.requestSupplyType}`
                      : ""}
                  </span>
                </div>
                <div className="mb-2 break-words text-sm text-[#1D3557]">
                  {offer.description}
                </div>
                {/* Price, Equity, and Duration */}
                <div className="flex flex-wrap gap-3 mb-2 text-xs text-[#1D3557]">
                  {offer.price !== undefined && (
                    <span>
                      Price: <b>{offer.price}</b>
                    </span>
                  )}
                  {offer.amount !== undefined && (
                    <span>
                      Amount: <b>{offer.amount}</b>
                    </span>
                  )}
                  {offer.equityPercentage !== undefined && (
                    <span>
                      Equity: <b>{offer.equityPercentage}%</b>
                    </span>
                  )}
                  {offer.durationInDays !== undefined && (
                    <span>
                      Duration: <b>{offer.durationInDays} days</b>
                    </span>
                  )}
                </div>
                {/* Items */}
                {offer.items && offer.items.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold">Items:</span>
                    <ul className="list-disc ml-5 text-xs">
                      {offer.items.map((item, idx) => (
                        <li key={idx}>
                          {item.itemType}: {item.quantity} × {item.price}{" "}
                          {item.itemId ? `(#${item.itemId})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Attachments */}
                {offer.attachments && offer.attachments.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold">Attachments:</span>
                    <ul className="list-disc ml-5 text-xs">
                      {offer.attachments.map((att, idx) => (
                        <li key={idx}>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            File {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Dates */}
                <div className="text-xs mb-2 text-[#1D3557]">
                  Created:{" "}
                  {offer.createdAt
                    ? format(new Date(offer.createdAt), "dd MMM yyyy, HH:mm")
                    : ""}
                </div>
                <div className="text-xs mb-2 text-[#1D3557]">
                  Updated:{" "}
                  {offer.updatedAt
                    ? format(new Date(offer.updatedAt), "dd MMM yyyy, HH:mm")
                    : ""}
                </div>
                <div className="text-xs mb-2 text-[#1D3557]">
                  Comment: {offer.comment || 'No comment'}
                </div>
                {/* User Role and Creation Info */}
                <div className="text-xs mb-2 text-[#1D3557]">
                  User Role: <b>{offer.offeredByInfo?.role || 'Unknown'}</b>
                </div>
                <div className="text-xs mb-2 text-[#1D3557]">
                  User Created: {offer.offeredByInfo?.createdAt
                    ? format(new Date(offer.offeredByInfo.createdAt), "dd MMM yyyy, HH:mm")
                    : "Unknown"}
                </div>
                {offer.offeredByInfo?.updatedAt && (
                  <div className="text-xs mb-2 text-[#1D3557]">
                    User Updated: {format(new Date(offer.offeredByInfo.updatedAt), "dd MMM yyyy, HH:mm")}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => handleAccept(offer._id)}
                  disabled={offer.status === "accepted"}
                  className={`px-4 py-2 rounded-lg font-medium transition-all bg-[#457B9D] text-white hover:bg-[#1D3557] ${
                    offer.status === "accepted"
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(offer._id)}
                  disabled={offer.status === "rejected"}
                  className={`px-4 py-2 rounded-lg font-medium transition-all bg-[#E63946] text-white hover:bg-[#AD1521] ${
                    offer.status === "rejected"
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={() => setViewOffer(offer)}
                  className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-200 text-gray-800 hover:bg-[#828282] hover:text-white"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* View Details Modal */}
      {viewOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setViewOffer(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              {" "}
              <X className="w-6 h-6" />{" "}
            </button>
            <h2 className="text-xl font-bold mb-2 text-[#1D3557]">
              Offer Details
            </h2>
            <div className="mb-2">
              <span className="font-semibold">
                {viewOffer.offerType === "Supply" ? "Supplier" : "Investor"}:
              </span>{" "}
              {viewOffer.offeredByInfo?.name || 'Unknown User'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Type:</span> {viewOffer.offerType}
              {viewOffer.offerType === "Supply" && viewOffer.requestSupplyType
                ? ` / ${viewOffer.requestSupplyType}`
                : ""}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  statusStyles[viewOffer.status]
                }`}
              >
                {viewOffer.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Created:</span>{" "}
              {viewOffer.createdAt
                ? format(new Date(viewOffer.createdAt), "dd MMM yyyy, HH:mm")
                : ""}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Updated:</span>{" "}
              {viewOffer.updatedAt
                ? format(new Date(viewOffer.updatedAt), "dd MMM yyyy, HH:mm")
                : ""}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Price:</span>{" "}
              {viewOffer.price !== undefined ? viewOffer.price : "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Amount:</span>{" "}
              {viewOffer.amount !== undefined ? viewOffer.amount : "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Equity:</span>{" "}
              {viewOffer.equityPercentage !== undefined
                ? viewOffer.equityPercentage + "%"
                : "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Duration:</span>{" "}
              {viewOffer.durationInDays !== undefined
                ? viewOffer.durationInDays + " days"
                : "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Description:</span>{" "}
              {viewOffer.description}
            </div>
            {/* Items */}
            {viewOffer.items && viewOffer.items.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold">Items:</span>
                <ul className="list-disc ml-5 text-xs">
                  {viewOffer.items.map((item, idx) => (
                    <li key={idx}>
                      {item.itemType}: {item.quantity} × {item.price}{" "}
                      {item.itemId ? `(#${item.itemId})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Attachments */}
            {viewOffer.attachments && viewOffer.attachments.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold">Attachments:</span>
                <ul className="list-disc ml-5 text-xs">
                  {viewOffer.attachments.map((att, idx) => (
                    <li key={idx}>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        File {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-2">
              <span className="font-semibold">Comment:</span>{" "}
              {viewOffer.comment || 'No comment'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">User Role:</span>{" "}
              {viewOffer.offeredByInfo?.role || 'Unknown'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">User Created:</span>{" "}
              {viewOffer.offeredByInfo?.createdAt
                ? format(new Date(viewOffer.offeredByInfo.createdAt), "dd MMM yyyy, HH:mm")
                : "Unknown"}
            </div>
            {viewOffer.offeredByInfo?.updatedAt && (
              <div className="mb-2">
                <span className="font-semibold">User Updated:</span>{" "}
                {format(new Date(viewOffer.offeredByInfo.updatedAt), "dd MMM yyyy, HH:mm")}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setViewOffer(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reject Modal */}
      {confirmRejectOfferId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4 text-[#E63946]">Warning</h2>
            <div className="mb-6 text-gray-800">
              Are you sure you want to reject this offer?
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={confirmReject}
                className="px-4 py-2 rounded-lg font-medium bg-[#E63946] text-white hover:bg-[#AD1521] transition-all"
              >
                Yes
              </button>
              <button
                onClick={cancelReject}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal removed as per request */}
    </div>
  );
};

export default OffersPage;
