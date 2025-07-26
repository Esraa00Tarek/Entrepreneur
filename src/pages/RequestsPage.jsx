// This page is for Investors only. The Send Offer button creates a deal by calling the backend /api/deals endpoint.
// It uses req.createdBy as entrepreneurId directly (no need to fetch business details).
import React, { useState, useEffect } from "react";
import axios from "axios";

// helper components/functions
const typeOptions = ["All", "Investment", "Supply"];
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const badgeColors = {
  Investment: "bg-purple-100 text-purple-700",
  Supply: "bg-green-100 text-green-700",
};

const SeeMoreParagraph = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text || text.length <= 100) return <span>{text}</span>;
  return expanded ? (
    <span>
      {text}{" "}
      <button
        className="text-[#457B9D] underline text-xs ml-1"
        onClick={() => setExpanded(false)}
      >
        See less
      </button>
    </span>
  ) : (
    <span>
      {text.slice(0, 100)}...{" "}
      <button
        className="text-[#457B9D] underline text-xs ml-1"
        onClick={() => setExpanded(true)}
      >
        See more
      </button>
    </span>
  );
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    axios
      .get(`/api/requests?page=${currentPage}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotalPages(res.data?.totalPages || 1);
        setTotal(res.data?.total || 0);
      })
      .catch((err) => {
        console.error("Error fetching requests", err);
      });
  }, [currentPage]);

  let filtered = requests.filter(
    (r) => typeFilter === "All" || r.offerType === typeFilter
  );
  filtered = filtered.sort((a, b) =>
    sort === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Download handler for attachments
  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl || "#";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send Offer handler (uses createdBy as entrepreneurId)
  const handleSendOffer = async (req) => {
    try {
      const token = localStorage.getItem("token");
      // بيانات العرض (عدل حسب ما تحتاجه)
      const offerData = {
        amount: req.amount || 0,
        message: req.purpose || "Investment offer",
      };
      // POST على /api/offers/:requestId
      const res = await axios.post(`/api/offers/${req._id}`, offerData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Offer Response:", res.data);
      if (res.data && res.data.success) {
        alert("Offer sent successfully!");
      } else {
        alert("Failed to send offer.");
      }
    } catch (err) {
      alert("Failed to send offer.");
      console.error("Send Offer Error:", err);
      if (err.response) {
        console.error("Backend error response:", err.response.data);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Filters */}
      <div className="flex justify-end mb-8">
        <select
          className="px-4 py-2 rounded-lg border border-[#A8DADC] text-[#1D3557] font-medium focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Requests Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {filtered.map((req, idx) => {
          const showDetails = expandedId === req.id;
          return (
            <div
              key={req.id || req._id || idx}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col border border-[#E6F0FA] relative"
            >
              {/* Header: Type, Category, Date */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    badgeColors[req.offerType] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {req.offerType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#E6F0FA] text-[#457B9D]">
                  {req.category}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {formatDate(req.createdAt)}
                </span>
              </div>
              {/* Title */}
              <div className="text-lg font-bold text-[#1D3557] mb-1">
                {req.title}
              </div>
              {/* Business and Creator Info */}
              <div className="text-sm text-[#457B9D] font-medium mb-2">
                {req.business && `Business: ${req.business}`}
              </div>
              {/* Investment Amount */}
              {req.amount && (
                <div className="mb-2 text-sm text-[#1D3557] font-semibold">
                  Amount:{" "}
                  <span className="text-[#457B9D]">
                    {req.amount.toLocaleString()} EGP
                  </span>
                </div>
              )}
              {/* See More/Less Toggle */}
              {!showDetails && (
                <button
                  className="text-[#457B9D] underline text-xs mb-2 font-bold w-full text-right"
                  onClick={() => setExpandedId(req.id)}
                >
                  See more
                </button>
              )}
              {showDetails && (
                <>
                  {/* Purpose */}
                  <div className="mb-2">
                    <div className="font-semibold text-[#1D3557] text-xs mb-1">
                      Purpose
                    </div>
                    <div className="text-sm text-gray-700">
                      <SeeMoreParagraph text={req.purpose} />
                    </div>
                  </div>
                  {/* Summary */}
                  {req.summary && (
                    <div className="mb-2">
                      <div className="font-semibold text-[#1D3557] text-xs mb-1">
                        Summary
                      </div>
                      <div className="text-sm text-gray-700">
                        <SeeMoreParagraph text={req.summary} />
                      </div>
                    </div>
                  )}
                  {/* Return Details */}
                  {req.returnDetails && (
                    <div className="mb-2">
                      <div className="font-semibold text-[#1D3557] text-xs mb-1">
                        Return Details
                      </div>
                      <div className="text-sm text-gray-700">
                        <SeeMoreParagraph text={req.returnDetails} />
                      </div>
                    </div>
                  )}
                  {/* Attachment */}
                  {req.attachment && (
                    <div className="mb-2">
                      <div className="font-semibold text-[#1D3557] text-xs mb-1">
                        Attachment
                      </div>
                      <button
                        className="text-[#457B9D] underline text-sm text-left"
                        onClick={() =>
                          handleDownload(req.attachmentUrl, req.attachment)
                        }
                        type="button"
                      >
                        {req.attachment}
                      </button>
                    </div>
                  )}
                  <button
                    className="text-[#457B9D] underline text-xs mb-2 font-bold w-full text-right"
                    onClick={() => setExpandedId(null)}
                  >
                    See less
                  </button>
                </>
              )}
              {/* Send Offer Button - يظهر دائماً */}
              <button
                className="mt-auto bg-[#457B9D] hover:bg-[#1D3557] text-white font-semibold py-2 rounded-lg transition-colors"
                onClick={() => handleSendOffer(req)}
              >
                Send Offer
              </button>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-lg">
          No requests found for the selected filter.
        </div>
      )}
      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2">
        <button
          className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1 ? "bg-[#457B9D] text-white" : "bg-gray-100"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <div className="text-center text-gray-500 mt-2 text-sm">
        Showing page {currentPage} of {totalPages} ({total} requests)
      </div>
    </div>
  );
};

export default RequestsPage;
