import { Navigate } from "react-router-dom";
import { useToast } from "./toastBar/toastContext";

const RedirectForLoggedIn: React.FC<{children: React.ReactNode}> = ({children}) => {

	const toast = useToast();
	const userId = sessionStorage.getItem("activeUserId");

	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	const accessToken = sessionData.accessToken;
	const refreshToken = sessionData.refreshToken;
	
	if (accessToken && refreshToken) {
		toast.open("Already logged in", "info");
		return <Navigate to="/user" replace />;
	}

	return <>{children}</>;
}

export default RedirectForLoggedIn;