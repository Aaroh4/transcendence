const Background: React.FC = () => {
	return (
	  <div
		className="fixed inset-0 -z-10"
		style={{
		  backgroundImage: "url('/amog.gif')",
		  backgroundSize: "cover",
		  backgroundPosition: "center",
		  backgroundRepeat: "no-repeat",
		  backgroundAttachment: "fixed",
		  filter: "blur(5px)",
		}}
	  ></div>
	);
  };
  
  export default Background;
  