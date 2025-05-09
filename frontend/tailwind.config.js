/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,ts,jsx,tsx}"], // Ensures Tailwind scans all files
	theme: {
	  extend: {      
		margin: {
			'1/24': '4.166667%',
		},},
	},
	safelist: ['mr-1/24'],
	plugins: [],
  };