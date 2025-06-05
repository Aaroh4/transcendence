import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
	plugins: [react()],
	server: {
	  proxy: {
		'/api': {
		  target: 'https://localhost:4000',
		  changeOrigin: true,
		  secure: false,
		},
		'/socket.io': {
		  target: 'https://localhost:4000',
		  ws: true, // WebSocket support
		  secure: false,
		},
	  },
	},
  });