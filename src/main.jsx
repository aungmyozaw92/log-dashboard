import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// import { QueryClient, QueryClientProvider } from "react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "antd/dist/reset.css"; // AntD styles

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);



