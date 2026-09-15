import localFont from "next/font/local";

const generalSans = localFont({
  src: [
    { path: "./GeneralSans-Variable.woff2", weight: "200 700", style: "normal" },
    { path: "./GeneralSans-VariableItalic.woff2", weight: "200 700", style: "italic" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

export default generalSans;
