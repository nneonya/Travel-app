import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import HomePage from '@/pages/HomePage/HomePage';
import SearchPage from '@/pages/SearchPage/SearchPage';
import MyTripsPage from '@/pages/MyTripsPage/MyTripsPage';
import CreateTripPage from '@/pages/CreateTripPage/CreateTripPage';
import TripDetailsPage from '@/pages/TripDetailsPage/TripDetailsPage';
import TripReviews from '@/pages/TripReviews/TripReviews';
import ReviewsPage from '@/pages/ReviewsPage/ReviewsPage';
import ReviewDetailsPage from '@/pages/ReviewDetailsPage';
import CreateReviewPage from '@/pages/CreateRewiewPage/CreateReviewPage';
import ChatsPage from '@/pages/ChatPage/ChatPage';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import EditProfilePage from '@/pages/EditProfilePage/EditProfilePage';
import NotificationsPage from '@/pages/NotificationsPage/NotificationsPage';
import EditReviewPage from '@/pages/EditReviewPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/create-trip" element={<CreateTripPage />} />
              <Route path="/trips/:id" element={<TripDetailsPage />} />
              <Route path="/trips/:id/reviews" element={<TripReviews />} />
              <Route path="/trips/:tripId/reviews/new" element={<CreateReviewPage />} />
              <Route path="/trips/:tripId/reviews/edit/:reviewId" element={<EditReviewPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/reviews/:id" element={<ReviewDetailsPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
