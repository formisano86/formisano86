import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import cmsRoutes from './routes/cmsRoutes';
import supplierRoutes from './routes/supplierRoutes';
import carrierRoutes from './routes/carrierRoutes';
import marketingRoutes from './routes/marketingRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
