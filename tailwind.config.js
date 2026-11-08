export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430", paper: "#F3F5F7", line: "#DCE1E7", muted: "#6B7685",
        brand: { DEFAULT: "#0F766E", dark: "#0B5A54", soft: "#E1F2F0" },
        urgent: { DEFAULT: "#C8312B", soft: "#FBE9E8" }
      },
      fontFamily: { sans: ["Figtree", "system-ui", "sans-serif"] }
    }
  },
  plugins: []
};
