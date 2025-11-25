module.exports = {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "brand-dark": "#0A3A6A",
        brand: "#05549E",
        "brand-light": "#2E86D6",
        "brand-xlight": "#5AA8EA",
        accent: "#32CAE4",
        muted: "#3D4160",
        yellow: "#FBB600",
        "white-t": "#FFFFFF",
        "text-dark": "#052236",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};
