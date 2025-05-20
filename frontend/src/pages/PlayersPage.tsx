import { usePageTitle } from "../hooks/usePageTitle";
import Players from "../components/Players";

export default function PlayersPage() {
  usePageTitle("Jogadoras");
  return <Players />;
} 