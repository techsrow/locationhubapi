const prisma = require("../../prisma");

exports.expireLockedBookings = async () => {

 await prisma.booking.updateMany({
  where: {
    paymentStatus: "locked",
    lockExpiresAt: { lt: new Date() }
  },
  data: {
    paymentStatus: "expired"
  }
});
};