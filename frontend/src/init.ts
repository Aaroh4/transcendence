import { route } from "./router/router.js";

window.addEventListener('DOMContentLoaded', () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    document.body.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;

        if (target && target.tagName === 'A' && target.getAttribute('href')) {
            event.preventDefault();
            const path = target.getAttribute('href') as string;
            route(event, path);
        }
    });

    /*
    if (cookies.accessToken) {
        loadGameRoom(); 
    }
    */

    route(new Event('DOMContentLoaded'), window.location.pathname || '/');
});
