const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoutes = require("./routes/subscribeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const paymentRoutes = require('./routes/paymentRoutes')
const connectDB = require("./config/db");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://192.168.98.73:5173',
            'https://threadscape-kai.vercel.app',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            console.log("allowedOrigin :", origin)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));




app.use(express.json());


dotenv.config();

console.log(process.env.PORT)

const PORT = process.env.PORT || 3000;

connectDB();

app.get("/", (req, res) => {
    res.send("WELCOME TO EaziMArt API!");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscriberRoutes);



app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {

    console.log(`Server is running on http://localhost:${PORT}`);

})