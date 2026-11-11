
const Visit = require("../models/Visit");

// RECORD A WEBSITE VISIT
const trackVisit = async (req, res) => {
  try {
    const { visitorId, page } = req.body;

    if (
      typeof visitorId !== "string" ||
      visitorId.trim().length < 8 ||
      visitorId.trim().length > 128
    ) {
      return res.status(400).json({
        message: "A valid visitor ID is required.",
      });
    }

    if (
      typeof page !== "string" ||
      !page.trim() ||
      page.trim().length > 100
    ) {
      return res.status(400).json({
        message: "A valid page name is required.",
      });
    }

    // Never count admin dashboard visits as public traffic.
    if (page.trim().toLowerCase() === "admin") {
      return res.status(204).send();
    }

    await Visit.create({
      visitorId: visitorId.trim(),
      page: page.trim(),
    });

    return res.status(201).json({
      message: "Visit recorded successfully.",
    });
  } catch (error) {
    console.error("Track visit error:", error);

    return res.status(500).json({
      message: "Unable to record website visit.",
    });
  }
};

// GET WEBSITE ANALYTICS (ADMIN ONLY)
const getVisitorAnalytics = async (req, res) => {
  try {
    // Use UTC date boundaries consistently.
    const now = new Date();

    const today = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    // Monday is the first day of the week.
    const dayOfWeek = today.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;

    const startOfWeek = new Date(today);
    startOfWeek.setUTCDate(
      today.getUTCDate() - daysSinceMonday
    );

    const startOfMonth = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
      )
    );

    const [
      totalPageViews,
      allVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      todayPageViews,
      weekPageViews,
      monthPageViews,
      popularPages,
    ] = await Promise.all([
      Visit.countDocuments(),

      Visit.distinct("visitorId"),

      Visit.distinct("visitorId", {
        visitedAt: { $gte: today },
      }),

      Visit.distinct("visitorId", {
        visitedAt: { $gte: startOfWeek },
      }),

      Visit.distinct("visitorId", {
        visitedAt: { $gte: startOfMonth },
      }),

      Visit.countDocuments({
        visitedAt: { $gte: today },
      }),

      Visit.countDocuments({
        visitedAt: { $gte: startOfWeek },
      }),

      Visit.countDocuments({
        visitedAt: { $gte: startOfMonth },
      }),

      Visit.aggregate([
        {
          $group: {
            _id: "$page",
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 0,
            page: "$_id",
            views: 1,
            uniqueVisitors: {
              $size: "$uniqueVisitors",
            },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return res.status(200).json({
      message: "Visitor analytics retrieved successfully.",

      analytics: {
        totalUniqueVisitors: allVisitors.length,
        totalPageViews,

        today: {
          uniqueVisitors: todayVisitors.length,
          pageViews: todayPageViews,
        },

        thisWeek: {
          uniqueVisitors: weekVisitors.length,
          pageViews: weekPageViews,
        },

        thisMonth: {
          uniqueVisitors: monthVisitors.length,
          pageViews: monthPageViews,
        },

        popularPages,
      },
    });
  } catch (error) {
    console.error("Visitor analytics error:", error);

    return res.status(500).json({
      message: "Unable to retrieve visitor analytics.",
    });
  }
};

module.exports = {
  trackVisit,
  getVisitorAnalytics,
};
