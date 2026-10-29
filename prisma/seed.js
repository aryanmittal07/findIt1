const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FindIt database seeding with campus noticeboard records...');

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Passwords
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'FindIt Operations Admin',
      email: 'admin@findit.org',
      phone: '+1 (555) 010-0900',
      passwordHash: adminPasswordHash,
      city: 'Campus Hub',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const studentAryan = await prisma.user.create({
    data: {
      name: 'Aryan Mittal',
      email: 'aryan@example.com',
      phone: '+1 (555) 014-3829',
      passwordHash: userPasswordHash,
      city: 'Engineering Block',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const studentSarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+1 (555) 019-9481',
      passwordHash: userPasswordHash,
      city: 'Central Campus',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const studentMarcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      phone: '+1 (555) 018-2741',
      passwordHash: userPasswordHash,
      city: 'Student Centre',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users seeded: admin@findit.org, aryan@example.com, sarah@example.com, marcus@example.com');

  // 2. Create Categories
  const categoriesData = [
    { name: 'Accessories', slug: 'accessories', description: 'Bottles, umbrellas, glasses, small personal belongings', iconName: 'Compass' },
    { name: 'Electronics', slug: 'electronics', description: 'Laptops, phones, wireless earbuds, chargers, headphones', iconName: 'Laptop' },
    { name: 'Books & Stationery', slug: 'books-stationery', description: 'Notebooks, textbooks, lab journals, binders, calculators', iconName: 'FileText' },
    { name: 'Keys', slug: 'keys', description: 'Hostel room keys, locker keys, vehicle fobs', iconName: 'Key' },
    { name: 'Bags & Wallets', slug: 'bags-wallets', description: 'Backpacks, leather wallets, cardholders, pouches', iconName: 'Briefcase' },
    { name: 'Clothing', slug: 'clothing', description: 'Hoodies, jackets, sports jerseys, caps', iconName: 'Shirt' },
    { name: 'Documents & IDs', slug: 'documents-ids', description: 'College identity cards, transit passes, library cards', iconName: 'FileText' },
    { name: 'Other', slug: 'other', description: 'Miscellaneous unique campus items', iconName: 'Package' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ ${categoriesData.length} Categories seeded.`);

  // 3. Create Seed Items (Directly matching the user's screenshot & presentation!)
  // Item 1: silver bottle (FOUND - second floor btech building)
  const item1 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-1042',
      type: 'FOUND',
      title: 'silver bottle',
      description: 'Found a stainless steel insulated silver water bottle left on the study ledge outside Lab 204.',
      brand: 'Milton / Insulated',
      dateLostFound: new Date('2026-10-28T14:30:00Z'),
      approxLocation: 'second floor btech building',
      city: 'BTech Block',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'VERIFIED_ONLY',
      status: 'APPROVED',
      isFeatured: true,
      userId: studentMarcus.id,
      categoryId: categories['accessories'].id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Item 2: silver bottle (LOST - second floor btech building) - Matches Item 1!
  const item2 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-1049',
      type: 'LOST',
      title: 'silver bottle',
      description: 'Misplaced my stainless steel silver hydro bottle after the afternoon Data Structures lecture.',
      brand: 'Milton',
      dateLostFound: new Date('2026-10-28T16:00:00Z'),
      approxLocation: 'second floor btech building',
      city: 'BTech Block',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'STRICT_IN_APP',
      rewardAmount: '$10 Reward',
      status: 'APPROVED',
      isFeatured: true,
      userId: studentAryan.id,
      categoryId: categories['accessories'].id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Item 3: Wireless earbuds case (LOST - Student centre lounge)
  const item3 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-2088',
      type: 'LOST',
      title: 'Wireless earbuds case',
      description: 'Matte black wireless charging case left near the cushioned couches in the student lounge.',
      brand: 'Sony / WF-1000',
      dateLostFound: new Date('2026-10-25T17:15:00Z'),
      approxLocation: 'Student centre lounge',
      city: 'Student Centre',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'STRICT_IN_APP',
      rewardAmount: '$25 Reward',
      status: 'APPROVED',
      isFeatured: true,
      userId: studentSarah.id,
      categoryId: categories['electronics'].id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Item 4: Black notebook (LOST - Cafeteria)
  const item4 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-3021',
      type: 'LOST',
      title: 'Black notebook',
      description: 'Hardcover black ruled notebook containing algorithmic lecture notes and lab assignments.',
      brand: 'Moleskine',
      dateLostFound: new Date('2026-10-23T13:20:00Z'),
      approxLocation: 'Cafeteria table 8',
      city: 'Campus Cafeteria',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'STRICT_IN_APP',
      status: 'APPROVED',
      isFeatured: false,
      userId: studentAryan.id,
      categoryId: categories['books-stationery'].id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Item 5: Bellroy Slim Leather Wallet (Found - Central Library)
  const item5 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-4099',
      type: 'FOUND',
      title: 'Bellroy Leather Wallet',
      description: 'Found a bi-fold black leather wallet near the library 1st floor turnstiles. Safe at circulation desk.',
      brand: 'Bellroy',
      dateLostFound: new Date('2026-10-27T18:00:00Z'),
      approxLocation: 'Central Library, Turnstiles',
      city: 'Campus Library',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'VERIFIED_ONLY',
      status: 'APPROVED',
      isFeatured: true,
      userId: studentMarcus.id,
      categoryId: categories['bags-wallets'].id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Item 6: Student ID Card & Transit Sleeve (Found - Sports Ground)
  const item6 = await prisma.item.create({
    data: {
      referenceId: 'FID-2026-5012',
      type: 'FOUND',
      title: 'Campus Identity Card in Lanyard',
      description: 'University badge holder with green lanyard found on the sports ground bleachers.',
      brand: 'Campus ID',
      dateLostFound: new Date('2026-10-29T10:00:00Z'),
      approxLocation: 'Sports Complex Bleachers',
      city: 'Athletic Field',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'STRICT_IN_APP',
      status: 'APPROVED',
      isFeatured: false,
      userId: studentSarah.id,
      categoryId: categories['documents-ids'].id,
    },
  });

  console.log('✅ Campus noticeboard items seeded.');

  // 4. Create Contact Request (Marcus reached out to Aryan regarding bottle match)
  const contactReq = await prisma.contactRequest.create({
    data: {
      itemId: item2.id,
      senderId: studentMarcus.id,
      receiverId: studentAryan.id,
      status: 'ACCEPTED',
      initialMessage: 'Hi Aryan, I found a silver insulated bottle on the 2nd floor BTech ledge right after the afternoon class. Does it have a small scratch on the cap?',
      verificationDetails: 'Confirmed silver bottle with matte cap.',
      messages: {
        create: [
          {
            senderId: studentMarcus.id,
            content: 'Hi Aryan, I found a silver insulated bottle on the 2nd floor BTech ledge right after the afternoon class. Does it have a small scratch on the cap?',
          },
          {
            senderId: studentAryan.id,
            content: 'Yes! That is mine! Can we meet near the cafeteria entrance tomorrow at 1 PM?',
          },
          {
            senderId: studentMarcus.id,
            content: 'Sounds good! See you by the cafeteria kiosk at 1 PM.',
          },
        ],
      },
    },
  });

  // 5. Seed Support Tickets
  await prisma.complaint.create({
    data: {
      referenceId: 'CMP-2026-8012',
      subject: 'Handover verification desk at BTech building',
      category: 'OTHER',
      description: 'Is the department security kiosk available as a designated safe exchange point during evening hours?',
      priority: 'LOW',
      status: 'RESOLVED',
      userId: studentAryan.id,
      adminResponse: 'Yes, the main reception desk at the BTech building entrance is staffed until 9:00 PM for safe item handovers.',
      resolvedAt: new Date(),
    },
  });

  // 6. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: studentAryan.id,
      type: 'MATCH_FOUND',
      title: 'Potential Match: "silver bottle"',
      message: 'A found report matching your silver bottle was posted for second floor BTech building.',
      linkUrl: `/listings/${item1.id}`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentAryan.id,
      type: 'CONTACT_REQUEST',
      title: 'Marcus Vance sent you a message',
      message: 'Marcus sent a verified inquiry regarding your report FID-2026-1049.',
      linkUrl: '/dashboard?tab=requests',
    },
  });

  // 7. Seed Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: 'APPROVE_NOTICEBOARD_ITEMS',
      targetType: 'ITEM',
      targetId: item1.id,
      details: 'Approved noticeboard listing FID-2026-1042 after campus location check.',
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
