// src/app/api/pikachu/route.js
import { NextResponse } from 'next/server';


// A  arquitetura limpa deve ficar assim:

// 📂 src/lib/ ou src/services/ 👉 Model (Onde fazes os fetchs para a tua API Flask do Pikachu).

// 📂 src/store/ e src/hooks/ 👉 ViewModel (O Zustand e os teus hooks, onde a lógica de negócio e o estado vivem).

// 📂 src/components/ e 📂 src/app/ 👉 View (Os componentes puramente visuais e as páginas que juntam tudo).


// Função para lidar com requisições GET, POST, PUT e DELETE

async function GET() {
    return NextResponse.json({ message: "API da BatCaverna a funcionar!" });
}

async function POST(request) {
    const data = await request.json();
    console.log("Dados recebidos:", data);
    return NextResponse.json({ message: "Dados recebidos com sucesso!", receivedData: data });

}

async function PUT(request) {
    const data = await request.json();
    console.log("Dados para atualização:", data);
    return NextResponse.json({ message: "Dados atualizados com sucesso!", updatedData: data });
}

async function DELETE(request) {
    const data = await request.json();
    console.log("Dados para exclusão:", data);
    return NextResponse.json({ message: "Dados excluídos com sucesso!", deletedData: data });
}

export { POST, GET, PUT, DELETE };