import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando creación de planes...');

  // Limpiar planes anteriores para evitar duplicados (Opcional, ten cuidado en prod)
  // await prisma.plan.deleteMany({});

  // 1. Plan GRATIS
  // - 3 imágenes destacadas
  // - 0 imágenes de platillos
  const planGratis = await prisma.plan.create({
    data: {
      name: 'Gratis',
      price: 0,
      hasSections: false,
      hasAnalytics: false,
      maxHighlightImages: 3, 
      maxProductImages: 0,   
      maxProducts: 15, // Límite opcional de platos totales
    },
  });

  // 2. Plan 1 (Básico)
  // - 3 destacadas
  // - 20 para platillos
  const planUno = await prisma.plan.create({
    data: {
      name: 'Plan 1',
      price: 9.99,
      hasSections: true,
      hasAnalytics: false,
      maxHighlightImages: 3, 
      maxProductImages: 20,
      maxProducts: null, // Ilimitados platos en texto
    },
  });

  // 3. Plan 2 (Intermedio)
  // - 5 destacados
  // - Ilimitado platillos
  const planDos = await prisma.plan.create({
    data: {
      name: 'Plan 2',
      price: 19.99,
      hasSections: true,
      hasAnalytics: false,
      maxHighlightImages: 5,  
      maxProductImages: null, // null significa ILIMITADO
    },
  });

  // 4. Plan 3 (Full / Enterprise)
  // - 5 destacados
  // - Ilimitado platillos
  // - Analíticas
  const planTres = await prisma.plan.create({
    data: {
      name: 'Plan 3',
      price: 29.99,
      hasSections: true,
      hasAnalytics: true,
      maxHighlightImages: 5,
      maxProductImages: null,
    },
  });

  console.log('✅ Planes creados correctamente:');
  console.log({ planGratis, planUno, planDos, planTres });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });