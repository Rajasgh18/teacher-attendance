# Teacher Attendance Backend

A production-level Express.js backend built with TypeScript, featuring a modular architecture, comprehensive security measures, and modern ES7+ features.

## 🚀 Features

- **TypeScript**: Full type safety with strict configuration
- **Modular Architecture**: Clean separation of concerns with organized folder structure
- **PostgreSQL Database**: Powered by Supabase with real-time capabilities
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript support
- **Security**: Helmet, CORS, rate limiting, JWT authentication
- **Validation**: Express-validator and Joi schemas
- **Logging**: Winston logger with multiple transports
- **Error Handling**: Comprehensive error handling with custom error classes
- **Testing**: Jest setup with TypeScript support
- **Code Quality**: ESLint and Prettier configuration
- **Environment Management**: Zod-based environment validation

## 📁 Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd teacher-attendance-backend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Database Setup**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > Database to get your connection string
   - Copy the connection string for your `.env` file

4. **Environment setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=3000
   HOST=localhost

   # Supabase Configuration
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-min-32-chars
   ```

5. **Build the project**

   ```bash
   pnpm build
   ```

6. **Build the project**

   ```bash
   pnpm build
   ```

7. **Start the server**

   ```bash
   # Development
   pnpm dev

   # Production
   pnpm start
   ```

### Default Admin User

After running migrations, you'll have a default admin user:

- **Email**: admin@school.com
- **Password**: admin123
- **Role**: admin

### Database Setup

For Drizzle ORM usage, see [DRIZZLE_GUIDE.md](./DRIZZLE_GUIDE.md)

**Quick Setup:**

```bash
# Get DATABASE_URL from Supabase Dashboard → Settings → Database
# Add to .env file, then:
pnpm db:generate    # Generate migrations from schema
pnpm db:migrate     # Apply migrations
pnpm db:studio      # Open database GUI
```

## 📝 Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT Authentication**: Token-based authentication
- **Input Validation**: Request validation with express-validator and Joi
- **Password Hashing**: bcrypt for password security
- **Request Size Limits**: Protection against large payloads

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

## 📊 Database Models

The application includes the following database models:

### Core Models

- **Users**: Authentication and user management
- **Teachers**: Teacher profiles and information
- **Classes**: Class management and assignments
- **Students**: Student profiles and information

### Attendance Models

- **TeacherAttendance**: Teacher check-in/check-out tracking
- **StudentAttendance**: Student attendance tracking

### Key Features

- **UUID Primary Keys**: Secure and globally unique identifiers
- **Timestamps**: Automatic created_at and updated_at tracking
- **Soft Deletes**: is_active flags for data retention
- **Foreign Key Relationships**: Proper referential integrity
- **Row Level Security**: Supabase RLS policies for data protection

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Health Check

- `GET /health` - Server health status

## 🔧 Configuration

The application uses environment variables for configuration. See `env.example` for all available options.

### Key Configuration Options

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting requests per window
- `LOG_LEVEL`: Logging level (error, warn, info, debug)

## 🏗️ Architecture

### Middleware Stack

1. Security middleware (Helmet, CORS, compression)
2. Rate limiting
3. Request logging
4. Body parsing
5. Authentication (where required)
6. Validation
7. Route handlers
8. Error handling

### Error Handling

The application uses a centralized error handling system with custom error classes:

- `AppError`: Base error class
- `ValidationError`: Input validation errors
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Authorization failures
- `NotFoundError`: Resource not found
- `ConflictError`: Resource conflicts

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.
