interface NotificacoesProps {}

export default function NotificacoesPage({}: NotificacoesProps) {
  // ... existing code ...

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Select name="public" value={form.public} onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, public: value }))}>
    </Select>
  );
} 