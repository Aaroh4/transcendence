import { Link } from "react-router-dom";
import Background from "../components/background";

export default function NoPage() {

	return (
		<>
		  <Background />
	  
		  <div className="flex gap-6 items-center justify-center min-h-screen">
			<div className="w-96 p-8 bg-black text-white rounded-md flex flex-col items-center justify-center text-center text-2xl font-bold border-2 border-green-500">
			  <h1 className="text-2xl font-bold text-center mb-4 text-gray-100">
				Error 404: Page Not Found
			  </h1>
			  <Link
				to="/home"
				className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transform transition-transform hover:scale-105 duration-100"
			  >
				Go back
			  </Link>
			</div>
		  </div>
		</>
	  );
}
