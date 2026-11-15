import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ivory: { DEFAULT: "#FBF3EA", 50: "#FEFBF7", 100: "#FBF3EA" },
        cream: { DEFAULT: "#F3E6D6", dark: "#EADAC5" },
        beige: { DEFAULT: "#E8C9A1", dark: "#D9B282" },
        sage: { DEFAULT: "#6E7F52", dark: "#5A6943", light: "#8E9C75", 50: "#EEF1E8" },
        brown: { DEFAULT: "#6B3A1E", light: "#8A5A3B", muted: "#7D5A44" },
        blush: "#EBCFC4",
        // Text colours chosen for WCAG AA on ivory and cream (see README › Accessibility)
        ink: "#4A2A17", // body text, 11.7:1 on ivory
        label: "#5A3019", // small uppercase labels, 10.2:1 on ivory
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        // secondary text, 7.5:1 on ivory (also the shadcn "muted-foreground")
        muted: { DEFAULT: "#6A4632", foreground: "#6A4632" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: { logo: "0.28em", label: "0.22em" },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 4px)", sm: "calc(var(--radius) - 8px)", "4xl": "2rem" },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(107, 58, 30, 0.18)",
        lift: "0 22px 45px -18px rgba(107, 58, 30, 0.28)",
        frame: "0 18px 30px -10px rgba(60, 35, 20, 0.45), 0 4px 8px rgba(60, 35, 20, 0.2)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};
export default config;
