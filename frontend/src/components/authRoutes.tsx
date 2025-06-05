import { Navigate } from "react-router-dom";

const ProtectedRoutes: React.FC<{children: React.ReactNode}> = ({children}) => {
	
	const userId = sessionStorage.getItem("activeUserId");

	if (!userId) {
		return <Navigate to="/login" replace />
	}

	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	const accessToken = sessionData.accessToken;
	const refreshToken = sessionData.refreshToken;
	
	if (!accessToken && !refreshToken) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

export default ProtectedRoutes;