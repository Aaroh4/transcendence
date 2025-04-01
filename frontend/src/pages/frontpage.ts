import { route } from "../router/router.js";

export function loadFrontPage(): void
{
	const app = document.getElementById('root')!;
	fetch('/templates/frontpage.html')
	.then(response => 
	{
		if (!response.ok)
		{
			throw new Error(`Fetch failed: ${response.status}`);
		}
		return response.text();
	})
	.then(html => 
	{
		app.innerHTML = html;
	
		app.addEventListener('click', (event) => 
		{
			const target = event.target as HTMLElement;
			
			if (target.matches('#login-button'))
			{
				event.preventDefault();
				route(event, '/login');
			}
			if (target.matches('#register-button'))
			{
				event.preventDefault();
				route(event, '/register');
			}
			if (target.matches('#game-debug'))
			{
				route(event, '/game');
			}
		})
	})
	.catch(error => 
	{
		console.error('Error loading login page:', error);
		alert('Something went wrong. Please try again later.'); //make error handling unified
	});
}

// import { route } from "../router/router.js";

// export function loadFrontPage(): void {
//     const app = document.getElementById('root')!;
// 	fetch('/templates/frontpage.html')
// 	.then(response => {
// 		if (!response.ok) {
// 			throw new Error(`Fetch failed: ${response.status}`);
// 		}
// 		return response.text();
// 	})
// 	.then(html => {
// 		app.innerHTML = html;
		
// 		document.getElementById('login-button')!.addEventListener('click', (event) => {
// 			event.preventDefault();
// 			route(event, '/login');
// 		});

// 		document.getElementById('register-button')!.addEventListener('click', (event) => {
// 			event.preventDefault();
// 			route(event, '/register');
// 		});

// 		document.getElementById('game-debug')!.addEventListener('click', (event) => {
// 			route(event, '/game');
// 		});
// 	})
// 	.catch(error => {
// 		console.error('Error loading login page:', error);
// 		alert('Something went wrong. Please try again later.'); //make error handling unified
// 	});
// }
