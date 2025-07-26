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
  Pending: "bg-yellow-100 text-yellow-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
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
  const [subTypeFilter, setSubTypeFilter] = useState("All"); // فلتر فرعي للـ Supply
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  const params = useParams();
  const requestId = props.requestId || params.requestId;
  const [businesses, setBusinesses] = useState([]);
  const [requests, setRequests] = useState([]);
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
        const res = await axios.get("http://localhost:5000/api/businesses", {
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

  useEffect(() => {
    if (!selectedBusinessId) return;
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/requests/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // فلتر الطلبات الخاصة بالبزنس المختار
        const filteredRequests = (res.data.data || []).filter((r) => r.business === selectedBusinessId);
        setRequests(filteredRequests);
      } catch (err) {
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [selectedBusinessId]);

  // جلب كل العروض لجميع طلبات البيزنيس المختار
  useEffect(() => {
    if (requests.length === 0) {
      setOffersState([]);
      return;
    }
    
    const fetchAllOffersForBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const allOffers = [];
        
        // جلب العروض لكل طلب في البيزنيس المختار
        for (const request of requests) {
          console.log("Fetching offers for requestId:", request._id);
          const res = await axios.get(
            `http://localhost:5000/api/offers/request/${request._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const offers = res.data.data || [];
          // إضافة معلومات الطلب لكل عرض
          const offersWithRequestInfo = offers.map(offer => ({
            ...offer,
            requestTitle: request.title,
            requestId: request._id
          }));
          allOffers.push(...offersWithRequestInfo);
        }
        
        console.log("ALL OFFERS FOR BUSINESS:", allOffers);
        setOffersState(allOffers);
      } catch (err) {
        setError("Failed to load offers");
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllOffersForBusiness();
  }, [requests]);

  useEffect(() => {
    if (selectedBusinessId)
      localStorage.setItem("selectedBusinessId", selectedBusinessId);
  }, [selectedBusinessId]);

  const navigate = useNavigate();

  // فلترة العروض حسب النوع والفرعي
  let offers = offersState;
  if (typeFilter !== "All") {
    offers = offers.filter((o) => o.offerType === typeFilter);
  }
  if (typeFilter === "Supply" && subTypeFilter !== "All") {
    offers = offers.filter((o) => o.subtype === subTypeFilter);
  }
  offers = offers.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // قبول العرض فعليًا من الباكند
  const handleAccept = async (offerId) => {
    setViewOffer(null);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/offers/${offerId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // تحديث العروض بعد القبول
      if (requests.length > 0) {
        const allOffers = [];
        for (const request of requests) {
          const res = await axios.get(
            `/api/offers/request/${request._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const offers = res.data.data || [];
          const offersWithRequestInfo = offers.map(offer => ({
            ...offer,
            requestTitle: request.title,
            requestId: request._id
          }));
          allOffers.push(...offersWithRequestInfo);
        }
        setOffersState(allOffers);
      }
      toast.success("Offer accepted successfully!");
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
        `/api/offers/${confirmRejectOfferId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // تحديث العروض بعد الرفض
      if (requests.length > 0) {
        const allOffers = [];
        for (const request of requests) {
          const res = await axios.get(
            `/api/offers/request/${request._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const offers = res.data.data || [];
          const offersWithRequestInfo = offers.map(offer => ({
            ...offer,
            requestTitle: request.title,
            requestId: request._id
          }));
          allOffers.push(...offersWithRequestInfo);
        }
        setOffersState(allOffers);
      }
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
            {/* فلتر فرعي يظهر فقط عند اختيار Supply */}
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
      {requests.length > 0 && (
        <div className="mb-8">
          {/* Filters */}
          {/* Filters are now in the header row above */}
        </div>
      )}
      {/* Offers List or Empty State */}
      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center justify-center mb-4">
            <Info className="w-12 h-12" style={{ color: "#1D3557" }} />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "#1D3557" }}
          >
            No requests found for this business.
          </h3>
        </div>
      ) : offers.length === 0 ? (
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
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full justify-between animate-fade-in-up"
            >
              <div>
                {/* إضافة عنوان الطلب */}
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Request:</span>
                  <span className="text-sm font-medium text-[#457B9D] ml-1">
                    {offer.requestTitle || 'Unknown Request'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-[#1D3557] text-lg">
                    {offer.offerType === "Supply"
                      ? offer.offeredBy.name
                      : offer.offeredBy.name}
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
                    {offer.offerType === "Supply" && offer.subtype
                      ? ` / ${offer.subtype}`
                      : ""}
                  </span>
                </div>
                <div className="mb-2 break-words text-sm text-[#1D3557]">
                  {offer.description}
                </div>
                {/* السعر والملكية والمدة */}
                <div className="flex flex-wrap gap-3 mb-2 text-xs text-[#1D3557]">
                  {offer.price !== undefined && (
                    <span>
                      Price: <b>{offer.price}</b>
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
                {/* البنود (items) */}
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
                {/* المرفقات */}
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
                {/* التواريخ */}
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
                  Comment: {offer.comment}
                </div>
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
                {/* زر محادثة (تحضيري) */}
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all bg-[#F1F5F9] text-[#1D3557] hover:bg-[#457B9D] hover:text-white"
                  title="Open chat about this offer"
                  onClick={() =>
                    navigate(
                      `/messages?partner=${offer.offeredBy._id}&offerId=${offer._id}`
                    )
                  }
                >
                  Message
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
              {viewOffer.offeredBy.name}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Type:</span> {viewOffer.offerType}
              {viewOffer.offerType === "Supply" && viewOffer.subtype
                ? ` / ${viewOffer.subtype}`
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
            {/* البنود (items) */}
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
            {/* المرفقات */}
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
              {viewOffer.comment}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setViewOffer(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Close
              </button>
              {/* زر محادثة (تحضيري) */}
              <button
                className="px-4 py-2 rounded-lg font-medium transition-all bg-[#F1F5F9] text-[#1D3557] hover:bg-[#457B9D] hover:text-white"
                title="Open chat about this offer"
                onClick={() =>
                  navigate(
                    `/messages?partner=${viewOffer.offeredBy._id}&offerId=${viewOffer._id}`
                  )
                }
              >
                Message
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
