import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

export default function LogoutPage() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    // Limpar token do localStorage
    localStorage.removeItem("token");
    
    // Limpar estado do store
    logout();
    
    // Redirecionar para login
    navigate("/login", { replace: true });
  }, [navigate, logout]);

  return null;
}

