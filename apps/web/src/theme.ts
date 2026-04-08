import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f5f5f5", paper: "#ffffff" },
    primary: { main: "#616161" },
    secondary: { main: "#9e9e9e" },
    text: { primary: "#212121", secondary: "#616161" },
    divider: "#e0e0e0",
  },
  shape: { borderRadius: 4 },
});
