import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const productos = [
    { nombre: 'Teclado Mecánico', descripcion: 'Switches azules', precio: 79.99 },
    { nombre: 'Mouse Gamer', descripcion: 'RGB 16000 DPI', precio: 49.50 },
    { nombre: 'Monitor 24"', descripcion: '1080p 75Hz', precio: 129.00 }
  ];
  for (const p of productos) {
    await prisma.producto.create({ data: p });
  }
  console.log('Seed completado');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
