import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Perfil do Usuário</h2>
      {user?.profileImage && (
        <img src={user.profileImage} alt="Foto de perfil" className="w-32 h-32 rounded-full" />
      )}
      <div>
        <p>Nome: {user?.name}</p>
        <p>Email: {user?.email}</p>
      </div>
    </div>
  );
} 