import prisma from "../lib/prisma";

export const getDashboardAnalyticsService = async () => {

  // 1️⃣ Total bookings
  const totalBookings = await prisma.booking.count();

  // 2️⃣ Total revenue
  const revenueData = await prisma.booking.aggregate({
    _sum: {
      totalAmount: true
    }
  });

  const revenue = revenueData._sum.totalAmount
    ? Number(revenueData._sum.totalAmount)
    : 0;


  // 3️⃣ Pending payments
  const bookings = await prisma.booking.findMany({
    select: {
      totalAmount: true,
      bookingAmount: true
    }
  });

  const pendingPayments = bookings.reduce((sum: number, b) => {

    const total = b.totalAmount ? Number(b.totalAmount) : 0;
    const paid = b.bookingAmount ? Number(b.bookingAmount) : 0;

    return sum + (total - paid);

  }, 0);


  // 4️⃣ Today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayBookings = await prisma.booking.count({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });


  // 5️⃣ Monthly revenue (last 12 months)
  const monthlyBookings = await prisma.booking.findMany({
    select: {
      createdAt: true,
      totalAmount: true
    }
  });

  const revenueMap: Record<string, number> = {};

  monthlyBookings.forEach((b) => {

    const month = new Date(b.createdAt).toLocaleString("default", {
      month: "short"
    });

    const amount = b.totalAmount ? Number(b.totalAmount) : 0;

    revenueMap[month] = (revenueMap[month] || 0) + amount;

  });

  const monthlyRevenue = Object.keys(revenueMap).map((month) => ({
    month,
    amount: revenueMap[month]
  }));


  // 6️⃣ Top packages
  const products = await prisma.product.findMany({
    include: {
      bookings: true
    }
  });

  const topPackages = products
    .map((p) => ({
      product: p.name,
      count: p.bookings.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);


  return {
    totalBookings,
    revenue,
    pendingPayments,
    todayBookings,
    monthlyRevenue,
    topPackages
  };

};