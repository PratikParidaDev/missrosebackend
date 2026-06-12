import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Super Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@newhavenpsychic.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log(`Created admin: ${adminEmail}`);
  }

  // 2. Seed Hero Section
  const heroCount = await prisma.heroSection.count();
  if (heroCount === 0) {
    await prisma.heroSection.create({
      data: {
        headline: 'Discover Your Spiritual Path',
        subheadline: 'Accurate and compassionate psychic readings to guide you through life\'s journey.',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1518105055047-9f66c05423f7',
        ctaPrimaryLabel: 'Book a Session',
        ctaPrimaryLink: '/booking',
        ctaSecondaryLabel: 'Our Services',
        ctaSecondaryLink: '/services',
        badgeText: 'Top Rated Psychic in NewHaven',
        isActive: true
      }
    });
    console.log('Seeded HeroSection');
  }

  // 3. Seed About Section
  const aboutCount = await prisma.aboutSection.count();
  if (aboutCount === 0) {
    await prisma.aboutSection.create({
      data: {
        sectionTitle: 'About Me',
        sectionSubtitle: 'Guiding Light in the Darkness',
        psychicName: 'Madam Seraphina',
        designation: 'Master Psychic & Spiritual Healer',
        bio: 'With over 20 years of experience, I have dedicated my life to helping others find clarity, peace, and direction. My gifts allow me to connect with energies and spirits to bring you the answers you seek.',
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        yearsExperience: 20,
        specialties: ['Tarot Reading', 'Astrology', 'Energy Healing', 'Aura Cleansing'],
        ctaLabel: 'Learn More',
        ctaLink: '/about',
        isActive: true
      }
    });
    console.log('Seeded AboutSection');
  }

  // 4. Seed Services
  const services = [
    {
      title: 'Palm Reading',
      slug: 'palm-reading',
      shortDescription: 'Discover what your life lines reveal about your future.',
      longDescription: 'A comprehensive reading of the lines on your palm to uncover your life\'s path, relationships, and potential.',
      price: 50.00,
      duration: '30 min',
      sessionType: 'IN_PERSON',
      isFeatured: true
    },
    {
      title: 'Tarot Reading',
      slug: 'tarot-reading',
      shortDescription: 'Gain insights into your past, present, and future.',
      longDescription: 'Using a traditional Rider-Waite deck, we will explore the energies surrounding your life questions.',
      price: 80.00,
      duration: '45 min',
      sessionType: 'BOTH',
      isFeatured: true
    },
    {
      title: 'Chakra Reading',
      slug: 'chakra-reading',
      shortDescription: 'Balance your energy centers for harmony and peace.',
      longDescription: 'An intuitive assessment of your 7 main chakras to identify blockages and restore energetic flow.',
      price: 120.00,
      duration: '60 min',
      sessionType: 'IN_PERSON',
      isFeatured: false
    },
    {
      title: 'Love Reading',
      slug: 'love-reading',
      shortDescription: 'Find answers about your romantic relationships.',
      longDescription: 'Specialized reading focusing entirely on matters of the heart, soulmates, and twin flames.',
      price: 90.00,
      duration: '45 min',
      sessionType: 'ONLINE',
      isFeatured: true
    }
  ];

  for (const srv of services) {
    const existing = await prisma.service.findUnique({ where: { slug: srv.slug } });
    if (!existing) {
      await prisma.service.create({ data: srv });
      console.log(`Seeded Service: ${srv.title}`);
    }
  }

  // 5. Seed Testimonials
  const testCount = await prisma.testimonial.count();
  if (testCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          clientName: 'Sarah Jenkins',
          rating: 5,
          review: 'The reading was incredibly accurate and gave me the closure I needed.',
          isApproved: true,
          isFeatured: true
        },
        {
          clientName: 'Michael T.',
          rating: 5,
          review: 'I was skeptical at first, but the insights provided were spot on. Highly recommend.',
          isApproved: true,
          isFeatured: false
        },
        {
          clientName: 'Elena R.',
          rating: 4,
          review: 'Very comforting and professional experience. Will definitely return.',
          isApproved: true,
          isFeatured: true
        },
        {
          clientName: 'David L.',
          rating: 5,
          review: 'My tarot reading was eye-opening. It helped me make a tough career decision.',
          isApproved: true,
          isFeatured: false
        }
      ]
    });
    console.log('Seeded Testimonials');
  }

  // 6. Seed Navbar Config
  const navCount = await prisma.navbarConfig.count();
  if (navCount === 0) {
    await prisma.navbarConfig.create({
      data: {
        logoText: 'NewHaven Psychic',
        ctaLabel: 'Book Now',
        ctaLink: '/booking',
        isSticky: true,
        navLinks: [
          { label: 'Home', href: '/', isExternal: false },
          { label: 'About', href: '/about', isExternal: false },
          { label: 'Services', href: '/services', isExternal: false },
          { label: 'Testimonials', href: '/testimonials', isExternal: false },
          { label: 'Contact', href: '/contact', isExternal: false }
        ]
      }
    });
    console.log('Seeded NavbarConfig');
  }

  // 7. Seed Footer Config
  const footerCount = await prisma.footerConfig.count();
  if (footerCount === 0) {
    await prisma.footerConfig.create({
      data: {
        copyrightText: '© 2026 NewHaven Psychic. All rights reserved.',
        disclaimer: 'For entertainment purposes only. Must be 18 or older.',
        socialLinks: [
          { platform: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
          { platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram' }
        ],
        quickLinks: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' }
        ]
      }
    });
    console.log('Seeded FooterConfig');
  }

  // 8. Seed Contact Info
  const contactInfoCount = await prisma.contactInfo.count();
  if (contactInfoCount === 0) {
    await prisma.contactInfo.create({
      data: {
        phone: '+1 (555) 123-4567',
        email: 'info@newhavenpsychic.com',
        address: '123 Spiritual Way, NewHaven, CT 06510',
        businessHours: 'Mon-Fri: 9am - 6pm | Sat: 10am - 4pm',
        isActive: true
      }
    });
    console.log('Seeded ContactInfo');
  }

  // 9. Seed Site Settings
  const siteSettingsCount = await prisma.siteSettings.count();
  if (siteSettingsCount === 0) {
    await prisma.siteSettings.create({
      data: {
        siteName: 'NewHaven Psychic',
        seoTitle: 'NewHaven Psychic - Accurate Tarot & Palm Readings',
        seoDescription: 'Find clarity and guidance with NewHaven Psychic. Book your tarot, palm, or chakra reading today.',
        seoKeywords: 'psychic, tarot reading, newhaven psychic, palm reading, spiritual guidance',
        primaryColor: '#6B46C1',
        accentColor: '#D6BCFA'
      }
    });
    console.log('Seeded SiteSettings');
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
