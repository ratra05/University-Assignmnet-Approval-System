import express from 'express';
import bcrypt from 'bcrypt';
import prisma from './prisma';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import studentRoutes from './routes/student';
import professorRoutes from './routes/professor';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);
app.use('/professor', professorRoutes);

// Serve uploaded files
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the University Assignment Approval Platform API',
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Create default admin if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.admin.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
        },
      });
      console.log(`Default admin created with email: ${adminEmail}`);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


startServer();