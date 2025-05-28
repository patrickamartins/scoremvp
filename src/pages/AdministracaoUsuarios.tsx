const handleFormChange = (e: any) => {
  const { name, value } = e.target;
  setForm((prev: any) => ({ ...prev, [name]: value }));
};

onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, plan: value }))}

onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, status: value }))}

onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, type: value }))} 