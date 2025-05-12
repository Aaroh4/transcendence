import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/homePage'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import UserPage from './pages/userPage'
import NoPage from './pages/noPage'
import TournamentsPage from './pages/tournamentPage.js'
import ProfilePage from './pages/profilePage'
import ProtectedRoutes from './components/authRoutes'

// import "../output.css";

export const router = createBrowserRouter([
  {path: "/", element:<Home />},
  {path: "/home", element:<Home />},
  {path: "/login", element:<Login/> },
  {path: "/register", element: <Registration />},
	{path: "/game", element: <ProtectedRoutes><GameRoom matchType="normal" /></ProtectedRoutes> },
	{path: "/tour-game", element: <ProtectedRoutes><GameRoom matchType="tournament" /></ProtectedRoutes> },
	{path: "/solo-game", element: <ProtectedRoutes><GameRoom matchType="solo" /></ProtectedRoutes> },
	{path: "/ai-game", element: <ProtectedRoutes> <GameRoom matchType="ai" /></ProtectedRoutes> },
  {path: "/tournaments", element: <ProtectedRoutes><TournamentsPage /></ProtectedRoutes>},
  {path: "/user", element: <ProtectedRoutes><UserPage /></ProtectedRoutes>},
  {path: "/user/profile", element: <ProtectedRoutes><ProfilePage /></ProtectedRoutes>},
  {path: "*", element: <NoPage />},
]);

const App: React.FC = () => {

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
