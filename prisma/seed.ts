import { PrismaClient } from '../generated/prisma/index';

const prisma = new PrismaClient();

async function main() {
  // Créer des clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstname: 'Jean',
        lastname: 'Dupont',
        activityName: 'Dupont & Associés',
        address: '123 Rue de la Paix, 75001 Paris',
        phone: '01 23 45 67 89',
        email: 'jean.dupont@dupont-associes.com',
        legalStatus: 'SARL'
      }
    }),
    prisma.client.create({
      data: {
        firstname: 'Marie',
        lastname: 'Martin',
        activityName: 'Martin Consulting',
        address: '456 Avenue des Champs, 69000 Lyon',
        phone: '04 78 90 12 34',
        email: 'marie.martin@martin-consulting.fr',
        legalStatus: 'SAS'
      }
    }),
    prisma.client.create({
      data: {
        firstname: 'Pierre',
        lastname: 'Durand',
        activityName: 'Durand Développement',
        address: '789 Boulevard Central, 33000 Bordeaux',
        phone: '05 56 78 90 12',
        email: 'pierre.durand@durand-dev.fr',
        legalStatus: 'EURL'
      }
    })
  ]);

  console.log('Clients créés:', clients.length);

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
            description: 'Développement site web vitrine',
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500
          },
          {
            description: 'Formation utilisateurs',
            quantity: 2,
            unitPrice: 300,
            totalPrice: 600
          }
        ]
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
            description: 'Application mobile React Native',
            quantity: 1,
            unitPrice: 8000,
            totalPrice: 8000
          },
          {
            description: 'Intégration API',
            quantity: 1,
            unitPrice: 1500,
            totalPrice: 1500
          }
        ]
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
            description: 'Audit sécurité',
            quantity: 1,
            unitPrice: 1200,
            totalPrice: 1200
          }
        ]
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
            description: 'Maintenance annuelle',
            quantity: 12,
            unitPrice: 200,
            totalPrice: 2400
          }
        ]
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
            description: 'Refonte complète du système',
            quantity: 1,
            unitPrice: 15000,
            totalPrice: 15000
          },
          {
            description: 'Migration des données',
            quantity: 1,
            unitPrice: 3000,
            totalPrice: 3000
          }
        ]
      }
    })
  ]);

  console.log('Devis créés:', quotations.length);
  console.log('Devis acceptés:', quotations.filter(q => q.status === 'accepted').length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 