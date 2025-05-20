import { usePageTitle } from "../hooks/usePageTitle";
import GamePanel from "../components/GamePanel";

export default function Painel() {
  usePageTitle("Painel");
  return <GamePanel />;
} 