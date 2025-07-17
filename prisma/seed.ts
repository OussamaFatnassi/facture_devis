import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQjOqKqG', // password: admin123
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQjOqKqG', // password: user123
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true,
      },
    }),
  ]);

  console.log('Users created:', users.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Développement site web vitrine',
        description: 'Création d\'un site web vitrine professionnel avec design responsive',
        price: 2500.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Application mobile React Native',
        description: 'Développement d\'une application mobile cross-platform',
        price: 8000.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Formation utilisateurs',
        description: 'Session de formation pour les utilisateurs finaux',
        price: 300.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Intégration API',
        description: 'Intégration d\'APIs tierces dans votre système',
        price: 1500.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Audit sécurité',
        description: 'Audit complet de la sécurité de votre application',
        price: 1200.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Maintenance annuelle',
        description: 'Contrat de maintenance annuelle incluant mises à jour et support',
        price: 200.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Refonte complète du système',
        description: 'Refonte complète de votre système existant',
        price: 15000.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Migration des données',
        description: 'Migration sécurisée de vos données vers le nouveau système',
        price: 3000.00,
        isActive: true,
      },
    }),
  ]);

  console.log('Products created:', products.length);

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstname: 'Jean',
        lastname: 'Dupont',
        activityName: 'Entreprise ABC',
        address: '123 Rue de la Paix, 75001 Paris',
        phone: '01 23 45 67 89',
        email: 'jean.dupont@abc.com',
        legalStatus: 'SARL',
        userId: users[0].id,
      },
    }),
    prisma.client.create({
      data: {
        firstname: 'Marie',
        lastname: 'Martin',
        activityName: 'Startup XYZ',
        address: '456 Avenue des Champs, 75008 Paris',
        phone: '01 98 76 54 32',
        email: 'marie.martin@xyz.com',
        legalStatus: 'SAS',
        userId: users[0].id,
      },
    }),
    prisma.client.create({
      data: {
        firstname: 'Pierre',
        lastname: 'Durand',
        activityName: 'Cabinet Conseil',
        address: '789 Boulevard Saint-Germain, 75006 Paris',
        phone: '01 12 34 56 78',
        email: 'pierre.durand@conseil.com',
        legalStatus: 'EI',
        userId: users[0].id,
      },
    }),
  ]);

  console.log('Clients created:', clients.length);

  // Créer des devis
  const quotations = await Promise.all([
    // Devis accepté pour Jean Dupont
    prisma.quotation.create({
      data: {
        version: 1,
        status: 'accepted',
        taxRate: 20,
        clientId: clients[0].id,
        quotationLines: [
          {
            productId: products[0].id,
            productName: products[0].name,
            productDescription: products[0].description,
            quantity: 1,
            unitPrice: products[0].price,
            totalPrice: products[0].price
          },
          {
            productId: products[2].id,
            productName: products[2].name,
            productDescription: products[2].description,
            quantity: 2,
            unitPrice: products[2].price,
            totalPrice: products[2].price * 2
          }
        ],
        userId: users[0].id,
      }
    }),
    // Devis accepté pour Marie Martin
    prisma.quotation.create({
      data: {
        version: 1,
        status: 'accepted',
        taxRate: 20,
        clientId: clients[1].id,
        quotationLines: [
          {
            productId: products[1].id,
            productName: products[1].name,
            productDescription: products[1].description,
            quantity: 1,
            unitPrice: products[1].price,
            totalPrice: products[1].price
          },
          {
            productId: products[3].id,
            productName: products[3].name,
            productDescription: products[3].description,
            quantity: 1,
            unitPrice: products[3].price,
            totalPrice: products[3].price
          }
        ],
        userId: users[0].id,
      }
    }),
    // Devis draft pour Pierre Durand
    prisma.quotation.create({
      data: {
        version: 1,
        status: 'draft',
        taxRate: 20,
        clientId: clients[2].id,
        quotationLines: [
          {
            productId: products[4].id,
            productName: products[4].name,
            productDescription: products[4].description,
            quantity: 1,
            unitPrice: products[4].price,
            totalPrice: products[4].price
          }
        ],
        userId: users[0].id,
      }
    }),
    // Devis envoyé pour Jean Dupont
    prisma.quotation.create({
      data: {
        version: 1,
        status: 'sent',
        taxRate: 20,
        clientId: clients[0].id,
        quotationLines: [
          {
            productId: products[5].id,
            productName: products[5].name,
            productDescription: products[5].description,
            quantity: 12,
            unitPrice: products[5].price,
            totalPrice: products[5].price * 12
          }
        ],
        userId: users[0].id,
      }
    }),
    // Devis accepté pour Pierre Durand
    prisma.quotation.create({
      data: {
        version: 1,
        status: 'accepted',
        taxRate: 20,
        clientId: clients[2].id,
        quotationLines: [
          {
            productId: products[6].id,
            productName: products[6].name,
            productDescription: products[6].description,
            quantity: 1,
            unitPrice: products[6].price,
            totalPrice: products[6].price
          },
          {
            productId: products[7].id,
            productName: products[7].name,
            productDescription: products[7].description,
            quantity: 1,
            unitPrice: products[7].price,
            totalPrice: products[7].price
          }
        ],
        userId: users[0].id,
      }
    })
  ]);

  console.log('Devis créés:', quotations.length);
  console.log('Devis acceptés:', quotations.filter(q => q.status === 'accepted').length);

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 