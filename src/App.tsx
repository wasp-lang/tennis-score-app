import { Outlet } from "react-router-dom";

import "./index.css";

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Outlet />
    </div>
  );
}
