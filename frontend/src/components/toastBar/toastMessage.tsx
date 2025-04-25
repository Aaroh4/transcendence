type ToastProps = {
	message: string;
	type: "success" | "error" | "info" | "default";
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {

	let bgColor = "";

	switch(type) {
		case "success":
			bgColor = "#38a169";
			break ;

		case "error":
			bgColor = "#f56565";
			break ;

		case "info":
			bgColor = "#3182ce";
			break ;
		
		default:
			bgColor = "#a0aec0";
	}
	
	return (
		<div
			style={{
				position: 'fixed',
				top: '13%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				backgroundColor: bgColor,
				color: 'white',
				padding: '1rem',
				borderRadius: '0.5rem',
				zIndex: 9999,
				// Remove any opacity/animation for debugging
			}}
		>
			{message}
		</div>
	)
}

export default Toast