import { prisma } from './db'
import type { RoomType, StepName, BudgetCents } from '@/types/session'

export async function createSession(data: {
  retailerId: string
  shopperName: string
  email: string
  address: string
  consentGiven: true
}) {
  return prisma.session.create({
    data: {
      retailerId: data.retailerId,
      shopperName: data.shopperName,
      email: data.email,
      address: data.address,
      consentGiven: data.consentGiven,
      currentStep: 'PROFILE',
    },
  })
}

export async function getSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
  })
}

export async function getSessionByResumeToken(token: string) {
  return prisma.session.findUnique({
    where: { resumeToken: token },
  })
}

export async function getSessionByEmail(email: string, retailerId: string) {
  return prisma.session.findFirst({
    where: { email, retailerId, completedAt: null },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateSession(
  id: string,
  data: Partial<{
    currentStep: StepName
    selectedRooms: RoomType[]
    designStyle: string
    colorPalette: string[]
    budgetCents: BudgetCents
    addressMeta: object
    completedAt: Date
  }>
) {
  return prisma.session.update({
    where: { id },
    data,
  })
}

export async function getSessionWithPlans(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: {
      plans: {
        orderBy: { version: 'desc' },
        take: 1,
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  })
}

export async function getLikedProductsForSession(sessionId: string, room?: RoomType) {
  return prisma.swipe.findMany({
    where: {
      sessionId,
      direction: 'LIKE',
      room: room ?? undefined,
    },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSwipedProductIds(sessionId: string): Promise<string[]> {
  const swipes = await prisma.swipe.findMany({
    where: { sessionId },
    select: { productId: true },
  })
  return swipes.map((s) => s.productId)
}
