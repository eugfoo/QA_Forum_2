import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import HomePage from './pages/Homepage';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Loader from './components/Loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';
import QuestionDetails from './pages/QuestionDetails';
import Notifications from './pages/Notifications';

import { AuthProvider } from './contexts/AuthContext';
import { LoaderProvider, useLoader } from './contexts/LoaderContext';
import NotificationProvider from './contexts/NotificationContext';

const Layout = () => {
  const { loading } = useLoader();

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <LoaderProvider>
        <NotificationProvider>
          <Router>
            <Layout />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              style={{ top: '80px' }}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </Router>
        </NotificationProvider>
      </LoaderProvider>
    </AuthProvider>
  );
}

export default App;
