import cors from 'cors';
import express from 'express';
import logger from 'morgan';

import { setResponseHeader } from './middleware/set-headers.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import masterProdukRouters from './routes/masterProdukRoutes.js';
import masterGudang from './routes/masterGudang.js';
import jenisGudangRoutes from './routes/jenisGudangRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import satuanStockRoutes from './routes/satuanStockRoutes.js';
import rakRoutes from './routes/rakRoutes.js';



const app = express();

const allowedOrigins = ['http://localhost:3000'];

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Timestamp', 'X-Signature'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionSuccessStatus: 200,
  })
);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/master-produk', masterProdukRouters);
app.use('/api/nama-gudang', masterGudang);
app.use('/api/golonganstock', jenisGudangRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/rak', rakRoutes);
app.use('/api/satuan', satuanStockRoutes);

app.get('/', [setResponseHeader], (req, res) => {
  return res.status(200).json(`Welcome to the server! ${new Date().toLocaleString()}`);
});

 



export default app;
