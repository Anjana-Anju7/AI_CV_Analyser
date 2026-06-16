import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@resumeai.dev' },
    update: {},
    create: {
      email: 'demo@resumeai.dev',
      passwordHash: hash,
      name: 'Demo User',
    },
  });
  console.log('Seeded demo user:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
