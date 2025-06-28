const handleFormChange = (e: any) => {
  const { name, value } = e.target;
  setForm((prev: any) => ({ ...prev, [name]: value }));
};

onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, plan: value }))} 

// Remover linha: const [avatar, setAvatar] = useState<File | null>(null);
// Substituir setAvatar(null) por setAvatarPreview(mockUser.avatar);
// Remover qualquer referência direta a 'avatar' que não seja avatarPreview. 