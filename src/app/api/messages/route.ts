import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';



// GET /api/messages?sessionId=xxx - Get messages for a session
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = await auth();
        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify session ownership
        const chatSession = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true },
        });

        if (!chatSession || chatSession.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized access to session' },
                { status: 403 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/messages - Create new message
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, role, content, attachments } = body;

        if (!sessionId || !role || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                sessionId,
                role,
                content,
                attachments: attachments || null,
            },
        });

        // Update session updatedAt
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Create message error:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}
