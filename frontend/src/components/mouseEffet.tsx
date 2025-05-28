import { useEffect, useState } from 'react';

export default function mouseEffect(containerRef, ballRef, paddleLeftRef, paddleRightRef)
{
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	  });

	useEffect(() => {
		function handleResize() {
		  setWindowSize({
			width: window.innerWidth,
			height: window.innerHeight,
		  });
		}
	
		window.addEventListener('resize', handleResize);
		handleResize();
	
		return () => window.removeEventListener('resize', handleResize);
	  }, []);

	useEffect(() => {
		const container = containerRef.current;
		const ball = ballRef.current;
		const paddleLeft = paddleLeftRef.current;
		const paddleRight = paddleRightRef.current;
		
		if (!container || !ball || !paddleLeft || !paddleRight) return;
		
		const state = {
		  containerWidth: 100,
		  containerHeight: 60,
		  ballSize: 6,
		  paddleHeight: 20,
		  paddleWidth: 4,
		  ballX: 50,
		  ballY: 30,
		  ballSpeedX: 1.2,
		  ballSpeedY: 0.8,
		  paddleY: 20,
		  mouseX: 0,
		  mouseY: 0,
		  offset: {x: 20, y: 20},
		  lastBallY: 0,
		};
		
		const handleMouseMove = (e) => {
		  state.mouseX = e.clientX;
		  state.mouseY = e.clientY;
		  
		  if (windowSize.width - state.containerWidth - state.offset.x > state.mouseX)
		  	container.style.left = `${state.mouseX + state.offset.x}px`;
		  if (windowSize.height - state.containerHeight - state.offset.y > state.mouseY)
		 	container.style.top = `${state.mouseY + state.offset.y}px`;
		};
		
		document.addEventListener('mousemove', handleMouseMove);
			
		const gameLoop = () => {
		  state.ballX += state.ballSpeedX;
		  state.ballY += state.ballSpeedY;
		  
		  if (state.ballY <= 0 || state.ballY + state.ballSize >= state.containerHeight) {
			state.ballSpeedY = -state.ballSpeedY;
			
			if (Math.abs(state.ballSpeedX) < 0.8) {
			  state.ballSpeedX = state.ballSpeedX > 0 ? 1.2 : -1.2;
			}
			
			if (state.ballY <= 0) {
			  state.ballY = 1;
			} else if (state.ballY + state.ballSize >= state.containerHeight) {
			  state.ballY = state.containerHeight - state.ballSize - 1;
			}
		  }
		  
			state.lastBallY = state.ballY;
		  
		  const paddleTarget = state.ballY - state.paddleHeight / 2;
		  state.paddleY += (paddleTarget - state.paddleY) * 0.1;
		  
		  if (state.paddleY < 0) state.paddleY = 0;
		  if (state.paddleY + state.paddleHeight > state.containerHeight) {
			state.paddleY = state.containerHeight - state.paddleHeight;
		  }
		  
		  if (state.paddleY < 0) state.paddleY = 0;
		  if (state.paddleY + state.paddleHeight > state.containerHeight) {
			state.paddleY = state.containerHeight - state.paddleHeight;
		  }
		  
		  if (state.ballX <= state.paddleWidth + 5 && 
			  state.ballY + state.ballSize >= state.paddleY && 
			  state.ballY <= state.paddleY + state.paddleHeight) {
			state.ballSpeedX = Math.abs(state.ballSpeedX);
			
			const hitPosition = (state.ballY - state.paddleY) / state.paddleHeight;
			state.ballSpeedY = (hitPosition - 0.5) * 2.5;
		  }
		  
		  if (state.ballX + state.ballSize >= state.containerWidth - state.paddleWidth - 5 && 
			  state.ballY + state.ballSize >= state.paddleY && 
			  state.ballY <= state.paddleY + state.paddleHeight) {
			state.ballSpeedX = -Math.abs(state.ballSpeedX);
			
			const hitPosition = (state.ballY - state.paddleY) / state.paddleHeight;
			state.ballSpeedY = (hitPosition - 0.5) * 2.5;
		  }
		  
		  ball.style.left = `${state.ballX}px`;
		  ball.style.top = `${state.ballY}px`;
		  paddleLeft.style.top = `${state.paddleY}px`;
		  paddleRight.style.top = `${state.paddleY}px`;
		  
		  animationFrameId = requestAnimationFrame(gameLoop);
		};
		
		let animationFrameId = requestAnimationFrame(gameLoop);
		
		return () => {
		  document.removeEventListener('mousemove', handleMouseMove);
		  cancelAnimationFrame(animationFrameId);
		};
	  }, []);
}