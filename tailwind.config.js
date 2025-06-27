/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		boxShadow:{
			cardShadow:'0px 1px 4px 0px rgba(0, 0, 0, 0.06)',
		},
  		colors: {
  			background: '#ffffff',
  			foreground: '#0E131A',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#131A24',
				description:'#5E6166',
				border:'#EBEEF5',
				boxShadow:'0px 1px 4px 0px rgba(0, 0, 0, 0.06)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: '#0078E8',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: '#737373',
  				foreground: '#909296'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: '#EBEBEB',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			} ,

			  primaryPurple: '#4C51BF', 
			  primaryHoverPurple: '#434190',
			  white: '#FFFFFF', 
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}