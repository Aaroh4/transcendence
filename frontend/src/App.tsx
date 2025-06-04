import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useEffect, useRef } from 'react'

import Home from './pages/homePage'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import UserPage from './pages/userPage'
import NoPage from './pages/noPage'
import TournamentsPage from './pages/tournamentPage.js'
import ProfilePage from './pages/profilePage'
import EditProfile from './pages/editProfile'
import ProtectedRoutes from './components/authRoutes'
import RedirectForLoggedIn from './components/redirecForLoggedIn'
import FriendPage from './pages/friendsProfile'

// import "../output.css";

export const router = createBrowserRouter([
  {path: "/", element: <RedirectForLoggedIn><Home /></RedirectForLoggedIn> },
  {path: "/home", element: <RedirectForLoggedIn><Home /></RedirectForLoggedIn> },
  {path: "/login", element: <RedirectForLoggedIn><Login/></RedirectForLoggedIn> },
  {path: "/register", element: <RedirectForLoggedIn><Registration /></RedirectForLoggedIn> },
  {path: "/game", element: <ProtectedRoutes><GameRoom matchType="normal" /></ProtectedRoutes> },
  {path: "/tour-game", element: <ProtectedRoutes><GameRoom matchType="tournament" /></ProtectedRoutes> },
  {path: "/solo-game", element: <ProtectedRoutes><GameRoom matchType="solo" /></ProtectedRoutes> },
  {path: "/ai-game", element: <ProtectedRoutes> <GameRoom matchType="ai" /></ProtectedRoutes> },
  {path: "/tournaments", element: <ProtectedRoutes><TournamentsPage /></ProtectedRoutes> },
  {path: "/user", element: <ProtectedRoutes><UserPage /></ProtectedRoutes> },
  {path: "/user/friend/:id", element: <ProtectedRoutes><FriendPage /></ProtectedRoutes> },
  {path: "/user/profile", element: <ProtectedRoutes><ProfilePage /></ProtectedRoutes> },
  {path: "/user/edit", element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>},
  {path: "*", element: <NoPage />},
]);

const App = () => {
  const containerRef = useRef(null);
  const ballRef = useRef(null);
  const paddleLeftRef = useRef(null);
  const paddleRightRef = useRef(null);
  
  return (
    <>
      <style>{`
        /* WebKit scrollbar styles */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
        }

        ::-webkit-scrollbar-thumb {
          background-color: #20d61a;
          border-radius: 5px;
          border: 2px solid #f0f0f0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>  
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App;