// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcryptjs'
// const prisma = new PrismaClient()
// const pw = await bcrypt.hash('password123', 10)
// for (const u of [
//   { name: 'Budi Sales', email: 'sales@demo.com', role: 'SALES' },
//   { name: 'Sari Sales', email: 'sales2@demo.com', role: 'SALES' },
//   { name: 'Pak Manajer', email: 'manager@demo.com', role: 'MANAGEMENT' },
// ]) await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, password: pw } })
// await prisma.stock.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
// console.log('Seed selesai. Login: sales@demo.com / manager@demo.com, password: password123')
// await prisma.$disconnect()



import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  {
    name: 'Sales 1',
    email: 'sales1@emasbmi.com',
    password: 'sales001@!asdalasj',
    role: 'SALES',
  },
  {
    name: ' Sales 2',
    email: 'sales2@emasbmi.com',
    password: 'sales001@!asdaasd',
    role: 'SALES',
  },
  {
    name: 'Nama Management',
    email: 'management@emasbmi.com',
    password: 'management@!indonesiaSukses',
    role: 'MANAGEMENT',
  },
]

for (const u of users) {
  const pw = await bcrypt.hash(u.password, 10)

  await prisma.user.upsert({
    where: {
      email: u.email,
    },
    update: {
      name: u.name,
      password: pw,
      role: u.role,
    },
    create: {
      name: u.name,
      email: u.email,
      password: pw,
      role: u.role,
    },
  })
}

await prisma.stock.upsert({
  where: { id: 1 },
  update: {},
  create: { id: 1 },
})

console.log('Seed selesai. 2 akun Sales dan 1 akun Management berhasil dibuat/diperbarui.')

await prisma.$disconnect()