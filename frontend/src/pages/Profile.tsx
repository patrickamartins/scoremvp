import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Perfil do Usuário</h2>
      
      <div className="flex items-center space-x-4 mb-6">
        {user?.profileImage ? (
          <img 
            src={user.profileImage} 
            alt="Foto de perfil" 
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sem foto</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <p className="mt-1 text-gray-900">{user?.name}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-gray-900">{user?.email}</p>
        </div>
      </div>
    </div>
  );
} 