import { Request, Response } from "express";
import { getDashboardAnalyticsService } from "../services/analyticsService";

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {

    const data = await getDashboardAnalyticsService();

    res.json(data);

  } catch (error) {

    console.error("Analytics Error:", error);

    res.status(500).json({
      message: "Failed to fetch analytics"
    });

  }
};