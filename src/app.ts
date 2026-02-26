import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import brideRoutes from "./routes/bride.routes";
import groomRoutes from "./routes/groom.routes";
import sliderRoutes from "./routes/sliderRoutes";
import addOnServiceRoutes from "./routes/addOnServiceRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import setupRoutes from "./routes/setup.routes";
import propsRoutes from "./routes/props.routes";
import makeupArtistRoutes from "./routes/makeupArtist.routes";
import setRoutes from "./routes/setRoutes";
import bookingRoutes from "./routes/booking.routes";
import productRoutes from "./routes/product.routes";








const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/bride", brideRoutes);
app.use("/api/groom", groomRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/add-on-services", addOnServiceRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/setups", setupRoutes);
app.use("/api/props", propsRoutes);
app.use("/api/makeup-artist", makeupArtistRoutes);
app.use("/api/set", setRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/products", productRoutes);








export default app;
