import React, { useState, useMemo, useEffect } from 'react';
import { Star, MessageCircle, Paperclip, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const feedbackTypes = [
  { value: '', label: 'Choose a type' },
  { value: 'ux', label: 'UX Issue' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

const getRoleColor = (role) => {
  switch (role) {
    case 'entrepreneur': return 'text-teal-600';
    case 'investor': return 'text-[#1D3557]';
    case 'supplier': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};

const BASE_URL = 'http://localhost:5000';

const FeedbackAndReviews = () => {
  // Detect user role from localStorage (same as Support page)
  const userRole = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj.role || 'entrepreneur';
      }
    } catch (e) {}
    return 'entrepreneur';
  }, []);

  // Review State
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Feedback State
  const [feedbackType, setFeedbackType] = useState(feedbackTypes[0].value);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  // جلب الريفيوز الخاصة بالمستخدم الحالي
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  // إضافة state للريبورتات
  // احذف كل ما يخص التقارير (reports)

  // جلب الريفيوز الخاصة بالمستخدم الحالي
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        // بدون توكن
        const res = await axios.get(`${BASE_URL}/api/reviews/platform?status=Accepted`);
        const reviews = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setUserReviews(reviews); // اعرض كل الريفيوز المعتمدة كما هي
      } catch (err) {
        setReviewsError('Failed to load reviews.');
        setUserReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  // السجل الآن فقط للريفيوز
  const userHistory = userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Validation
  const isReviewValid = reviewRating > 0 && reviewMessage.trim().length > 0;
  const isFeedbackValid = feedbackDescription.trim().length > 0;

  // Handlers
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isReviewValid) return;
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/reviews/platform`, {
        rating: reviewRating,
        content: reviewMessage,
        title: reviewTitle
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Review response:', response.data); // Show review response in console
      setShowReviewSuccess(true);
      setReviewRating(0);
      setReviewTitle('');
      setReviewMessage('');
      setTimeout(() => setShowReviewSuccess(false), 2500);
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!isFeedbackValid) return;
    setFeedbackSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      let formData = new FormData();
      // Map feedbackType to backend enum for type
      const typeMap = {
        ux: 'UX Issue',
        bug: 'Bug Report',
        feature: 'Suggestions',
        other: 'Suggestions'
      };
      formData.append('type', typeMap[feedbackType] || 'Suggestions');
      formData.append('content', feedbackDescription);
      if (feedbackTitle) formData.append('title', feedbackTitle);
      if (feedbackFile) formData.append('attachment', feedbackFile);
      await axios.post(`${BASE_URL}/api/reports`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowFeedbackSuccess(true);
      setFeedbackType(feedbackTypes[0].value);
      setFeedbackTitle('');
      setFeedbackDescription('');
      setFeedbackFile(null);
      setTimeout(() => setShowFeedbackSuccess(false), 2500);
    } catch (err) {
      alert('Failed to send feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // حذف الريفيو
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/reviews/platform/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div className="w-full py-8 px-6 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Leave a Review */}
        <form
          onSubmit={handleReviewSubmit}
          className="flex-1 bg-white rounded-2xl shadow-xl p-8 border border-[#A8DADC] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center mb-6">
              <Star className="w-8 h-8 text-[#457B9D] mr-2"/>
              <h2 className="text-2xl font-bold text-[#1D3557]">Leave a Review</h2>
            </div>
            <div className="mb-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={
                    star <= reviewRating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star className="w-7 h-7" fill={star <= reviewRating ? '#FBBF24' : 'none'} />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review title (optional)"
              className="mb-4 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-transparent text-lg"
              value={reviewTitle}
              onChange={e => setReviewTitle(e.target.value)}
              maxLength={60}
            />
            <textarea
              placeholder="Write your review..."
              className="mb-4 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-transparent text-lg min-h-[90px]"
              value={reviewMessage}
              onChange={e => setReviewMessage(e.target.value)}
              required
              maxLength={500}
            />
            {/* Hidden user role */}
            <input type="hidden" name="userRole" value={userRole} />
          </div>
          <button
            type="submit"
            disabled={!isReviewValid || reviewSubmitting}
            className="mt-2 w-full py-3 bg-[#457B9D] text-white rounded-lg font-semibold text-lg hover:bg-[#1D3557] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {showReviewSuccess && (
            <div className="flex items-center justify-center mt-4 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              Thank you for your review!
            </div>
          )}
        </form>
        {/* Share Feedback */}
        <form
          onSubmit={handleFeedbackSubmit}
          className="flex-1 bg-white rounded-2xl shadow-xl p-8 border border-[#A8DADC] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center mb-6">
              <MessageCircle className="w-8 h-8 text-[#457B9D] mr-2"/>
              <h2 className="text-2xl font-bold text-[#1D3557]">Report Issue</h2>
            </div>
            {/* نوع الريفيو */}
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#457B9D] focus:ring focus:ring-[#457B9D]/20"
                value={feedbackType}
                onChange={e => setFeedbackType(e.target.value)}
                required
              >
                {feedbackTypes.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Feedback title (optional)"
              className="mb-4 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-transparent text-lg"
              value={feedbackTitle}
              onChange={e => setFeedbackTitle(e.target.value)}
              maxLength={60}
            />
            <textarea
              placeholder="Describe your feedback..."
              className="mb-4 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-transparent text-lg min-h-[90px]"
              value={feedbackDescription}
              onChange={e => setFeedbackDescription(e.target.value)}
              required
              maxLength={500}
            />
            <label className="flex items-center cursor-pointer mb-4">
              <Paperclip className="w-5 h-5 text-[#457B9D] mr-2" />
              <span className="text-[#457B9D] font-medium">Attach file</span>
              <input
                type="file"
                name="attachment"
                className="hidden"
                onChange={e => setFeedbackFile(e.target.files[0])}
              />
            </label>
            {feedbackFile && (
              <span className="ml-3 text-sm text-[#1D3557]">{feedbackFile.name}</span>
            )}
            {/* Hidden user role */}
            <input type="hidden" name="userRole" value={userRole} />
          </div>
          <button
            type="submit"
            disabled={!isFeedbackValid || feedbackSubmitting}
            className="mt-2 w-full py-3 bg-[#457B9D] text-white rounded-lg font-semibold text-lg hover:bg-[#1D3557] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {feedbackSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>
          {showFeedbackSuccess && (
            <div className="flex items-center justify-center mt-4 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              Thank you for your feedback. We appreciate it!
            </div>
          )}
        </form>
      </div>
      {/* عرض الريفيوز السابقة فقط */}
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-[#1D3557] mb-4 text-center">Your Previous Reviews</h2>
        {loadingReviews ? (
          <div className="text-center text-[#457B9D]">Loading reviews...</div>
        ) : reviewsError ? (
          <div className="text-center text-red-600">{reviewsError}</div>
        ) : userHistory.length === 0 ? (
          <div className="text-center text-gray-500">You have not submitted any reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {userHistory.map((item, idx) => (
              <div key={item._id || idx} className="bg-white rounded-lg shadow p-4 border border-[#A8DADC]">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-5 h-5 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill={star <= item.rating ? '#FBBF24' : 'none'} />
                  ))}
                  {/* زرار حذف الريفيو */}
                  <button
                    onClick={() => handleDeleteReview(item._id)}
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    title="Delete this review"
                  >Delete</button>
                  <span className="ml-2 text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                </div>
                <div className="font-semibold text-[#1D3557] mb-1" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>{item.title || 'No Title'}</div>
                <div className="text-gray-700 mb-1" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>{item.content || ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* عرض كل الريفيوز المعتمدة إذا لم يوجد userId */}
      {(!userRole || userRole === 'entrepreneur') && !userHistory.length && userReviews.length > 0 && (
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[#1D3557] mb-4 text-center">All Approved Reviews (Public View)</h2>
          <div className="space-y-4">
            {userReviews.map((item, idx) => (
              <div key={item._id || idx} className="bg-white rounded-lg shadow p-4 border border-[#A8DADC]">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-5 h-5 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill={star <= item.rating ? '#FBBF24' : 'none'} />
                  ))}
                  <span className="ml-2 text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                </div>
                <div className="font-semibold text-[#1D3557] mb-1">{item.title || 'No Title'}</div>
                <div className="text-gray-700 mb-1">{item.content || ''}</div>
                <div className="text-xs text-gray-500 mt-1">By: {item.userId && (item.userId.fullName || item.userId._id || item.userId)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAndReviews;
