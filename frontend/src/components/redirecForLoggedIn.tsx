import { Navigate } from "react-router-dom";

const RedirectForLoggedIn: React.FC<{children: React.ReactNode}> = ({children}) => {

	const userId = sessionStorage.getItem("activeUserId");

	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	const accessToken = sessionData.accessToken;
	const refreshToken = sessionData.refreshToken;
	
	if (accessToken && refreshToken) {
		return <Navigate to="/user" replace />;
	}

	return <>{children}</>;
}

export default RedirectForLoggedIn;