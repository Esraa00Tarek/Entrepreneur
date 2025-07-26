import { useState, useEffect, useCallback } from "react";

// MOCK HOOK: Replace with your real API logic
export function useNotifications(userId, userRole = 'entrepreneur') {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markAllLoading, setMarkAllLoading] = useState(false);

  // Mock fetch
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Different notifications based on user role
      let roleNotifications = [];
      
      if (userRole === 'entrepreneur') {
        roleNotifications = [
          {
            id: 1,
            userId,
            title: "Welcome to the platform!",
            link: "/dashboard/entrepreneur",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 2,
            userId,
            title: "Your profile is 80% complete.",
            link: "/dashboard/entrepreneur?tab=settings",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: 3,
            userId,
            title: "New message from Tech Solutions Inc.",
            link: "/dashboard/entrepreneur?tab=messages",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 4,
            userId,
            title: "Investment proposal received from GreenTech Ventures",
            link: "/dashboard/entrepreneur?tab=my-deals",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          },
          {
            id: 5,
            userId,
            title: "Your business milestone 'Legal Setup' is completed",
            link: "/dashboard/entrepreneur?tab=my-business",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 6,
            userId,
            title: "New supplier offer for your project",
            link: "/dashboard/entrepreneur?tab=marketplace",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: 7,
            userId,
            title: "Password change successful",
            link: "/dashboard/entrepreneur?tab=settings",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: 8,
            userId,
            title: "Admin notification: Platform maintenance scheduled",
            link: "/dashboard/entrepreneur",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: 9,
            userId,
            title: "Deal status updated: Negotiation in progress",
            link: "/dashboard/entrepreneur?tab=my-deals",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: 10,
            userId,
            title: "New marketplace opportunity matches your business",
            link: "/dashboard/entrepreneur?tab=marketplace",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          }
        ];
      } else if (userRole === 'investor') {
        roleNotifications = [
          {
            id: 1,
            userId,
            title: "Welcome to Elevante Investment Platform!",
            link: "/dashboard/investor",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 2,
            userId,
            title: "New startup opportunity: TechFlow AI",
            link: "/dashboard/investor?tab=opportunities",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 3,
            userId,
            title: "Portfolio update: DataViz Inc reached 50% ROI",
            link: "/dashboard/investor?tab=portfolio",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          },
          {
            id: 4,
            userId,
            title: "Investment milestone: MedConnect secured Series A",
            link: "/dashboard/investor?tab=portfolio",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 5,
            userId,
            title: "Due diligence completed for GreenEnergy Solutions",
            link: "/dashboard/investor?tab=opportunities",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: 6,
            userId,
            title: "New entrepreneur inquiry about your investment criteria",
            link: "/dashboard/investor?tab=opportunities",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: 7,
            userId,
            title: "Market analysis report available for your portfolio",
            link: "/dashboard/investor?tab=portfolio",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: 8,
            userId,
            title: "Admin notification: New investment regulations",
            link: "/dashboard/investor",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          }
        ];
      } else if (userRole === 'supplier') {
        roleNotifications = [
          {
            id: 1,
            userId,
            title: "Welcome to Elevante Supplier Network!",
            link: "/dashboard/supplier",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 2,
            userId,
            title: "New order received from EcoTech Solutions",
            link: "/dashboard/supplier?tab=orders",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 3,
            userId,
            title: "Product inquiry from TechFlow AI",
            link: "/dashboard/supplier?tab=products",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          },
          {
            id: 4,
            userId,
            title: "Order #12345 shipped successfully",
            link: "/dashboard/supplier?tab=orders",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 5,
            userId,
            title: "New customer review: 5 stars for IoT Sensors",
            link: "/dashboard/supplier?tab=products",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: 6,
            userId,
            title: "Inventory alert: Low stock for Solar Panels",
            link: "/dashboard/supplier?tab=products",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: 7,
            userId,
            title: "Payment received for order #12340",
            link: "/dashboard/supplier?tab=orders",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: 8,
            userId,
            title: "New supplier partnership opportunity",
            link: "/dashboard/supplier?tab=products",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          }
        ];
      } else if (userRole === 'admin') {
        roleNotifications = [
          {
            id: 1,
            userId,
            title: "Welcome to Admin Dashboard!",
            link: "/admin",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 2,
            userId,
            title: "New user registration: TechFlow AI",
            link: "/admin?tab=users",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 3,
            userId,
            title: "Resource request pending approval",
            link: "/admin?tab=requests",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          },
          {
            id: 4,
            userId,
            title: "Vendor offer requires review",
            link: "/admin?tab=offers",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: 5,
            userId,
            title: "System maintenance completed successfully",
            link: "/admin?tab=settings",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 6,
            userId,
            title: "New feedback received from entrepreneur",
            link: "/admin?tab=feedback",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: 7,
            userId,
            title: "Execution phase milestone reached",
            link: "/admin?tab=phases",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: 8,
            userId,
            title: "Database backup completed",
            link: "/admin?tab=settings",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: 9,
            userId,
            title: "Security alert: Suspicious login attempt",
            link: "/admin?tab=users",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          },
          {
            id: 10,
            userId,
            title: "Platform performance report available",
            link: "/admin?tab=overview",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          }
        ];
      }
      
      setNotifications(roleNotifications);
    } catch (err) {
      setError("Failed to load notifications.");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    // Optionally add interval for auto-refresh
    return () => {};
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    setMarkAllLoading(true);
    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMarkAllLoading(false);
    }, 1000);
  };

  return {
    notifications,
    loading,
    error,
    markAllLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}