// Teste para verificar se o frontend consegue acessar o endpoint de usuários
const BASE_URL = 'https://scoremvpback-production.up.railway.app';

async function testUsersEndpoint() {
  console.log('🚀 Testando endpoint de usuários para o frontend...');
  
  // Simular login para obter token
  const loginData = new URLSearchParams({
    username: 'admin@scoremvp.com.br',
    password: 'admin123'
  });

  try {
    // Login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginData
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login bem-sucedido!');

    // Testar endpoint de usuários
    console.log('👥 Testando endpoint /api/users/...');
    const usersResponse = await fetch(`${BASE_URL}/api/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Endpoint falhou: ${usersResponse.status} - ${await usersResponse.text()}`);
    }

    const users = await usersResponse.json();
    console.log('✅ Endpoint /api/users/ funcionando!');
    console.log(`📊 Usuários encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('📋 Primeiros usuários:');
      users.slice(0, 3).forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      });
    }

    console.log('\n🎉 SUCESSO! O frontend pode acessar o endpoint de usuários!');
    return true;

  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

// Executar o teste
testUsersEndpoint().then(success => {
  if (success) {
    console.log('\n✅ Frontend está pronto para usar o endpoint de usuários!');
  } else {
    console.log('\n❌ Frontend ainda tem problemas para acessar o endpoint.');
  }
}); 