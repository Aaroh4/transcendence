import { Navigate } from "react-router-dom";
import { useToast } from "./toastBar/toastContext";

const ProtectedRoutes: React.FC<{children: React.ReactNode}> = ({children}) => {

	const toast = useToast();
	
	const userId = sessionStorage.getItem("activeUserId");

	if (!userId) {
		//toast.open("Unauthorized", "error");
		return <Navigate to="/login" replace />
	}

	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	const accessToken = sessionData.accessToken;
	const refreshToken = sessionData.refreshToken;
	
	if (!accessToken && !refreshToken) {
		toast.open("Unauthorized", "error");
		return <Navigate to="/login" replace />;
	}

	//add api call to get new token here.
	return <>{children}</>;
}

export default ProtectedRoutes;