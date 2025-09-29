# EngracedSmile Transport - PWA Booking System

A comprehensive Progressive Web App (PWA) for interstate transportation booking across Nigeria, built with Next.js, Supabase, and modern web technologies.

## 🚀 Features

### User Features
- **Trip Search & Booking**: Search for trips by route, date, and passengers
- **Real-time Availability**: View available seats and trip details
- **User Dashboard**: Track bookings, view trip history, and manage profile
- **Mobile-First Design**: Optimized for mobile devices with PWA capabilities
- **Offline Support**: Works offline with service worker caching

### Admin Features
- **Route Management**: Add, edit, and manage transportation routes
- **Vehicle Management**: Manage fleet of buses and vehicles
- **Booking Management**: View and manage all bookings
- **Driver Management**: Manage driver profiles and assignments
- **Analytics Dashboard**: View booking statistics and revenue

### Technical Features
- **PWA Support**: Installable app with offline capabilities
- **Real-time Updates**: Live booking status and trip updates
- **Responsive Design**: Works on all device sizes
- **Secure Authentication**: Supabase Auth with role-based access
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **PWA**: Service Worker, Web App Manifest

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd engracedsmile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EngracedSmile Transport
```

### 4. Database Setup
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, indexes, and policies

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install button in the address bar
3. Follow the installation prompts

### Mobile
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. The app will be installed as a native-like app

## 🗄️ Database Schema

### Core Tables
- **user_profiles**: User account information
- **drivers**: Driver profiles and credentials
- **routes**: Transportation routes between cities
- **vehicles**: Fleet of buses and vehicles
- **trips**: Scheduled trips with vehicles and drivers
- **bookings**: User bookings and reservations

### Key Features
- Row Level Security (RLS) for data protection
- Automatic timestamp updates
- Foreign key relationships
- Optimized indexes for performance

## 🔐 Authentication

The app uses Supabase Auth with the following features:
- Email/password authentication
- User profile management
- Role-based access (Admin, Driver, User)
- Secure session management

### User Roles
- **Admin**: Full access to all features
- **Driver**: Access to assigned trips and vehicle info
- **User**: Standard booking and profile access

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive design system
- Dark/light mode support
- Accessible components
- Customizable themes

## 📊 Admin Dashboard

### Features
- Real-time booking statistics
- Revenue tracking
- Route and vehicle management
- Driver assignment
- Booking management

### Access
- Navigate to `/admin` (requires admin role)
- Manage routes, vehicles, and bookings
- View analytics and reports

## 🔧 API Integration

### Supabase Integration
- Real-time subscriptions
- Row Level Security
- Automatic API generation
- File storage for images

### Key Functions
- Trip search and filtering
- Booking creation and management
- User authentication
- Real-time updates

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 📱 Mobile Optimization

- Touch-friendly interface
- Offline functionality
- Push notifications (future)
- App-like experience

## 🔒 Security

- Row Level Security (RLS)
- Input validation with Zod
- XSS protection
- CSRF protection
- Secure authentication

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- Service worker caching
- Image optimization
- Code splitting
- Lazy loading
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@engracedsmile.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic booking system
- ✅ User authentication
- ✅ Admin dashboard
- ✅ PWA functionality

### Phase 2 (Future)
- [ ] Payment integration
- [ ] Push notifications
- [ ] Real-time tracking
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for third-party integration
- [ ] Advanced reporting

---

Built with ❤️ for safe and comfortable travel across Nigeria.