import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';

// GET /api/sessions - Get all sessions
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ sessions: [] });
        }

        const sessions = await prisma.chatSession.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

// POST /api/sessions - Create new session
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = await req.json();
        const { title, model } = body;

        // Determine userId (if authenticated)
        const userId = session?.user?.id;


        const newSession = await prisma.chatSession.create({
            data: {
                title: title || 'Chat mới',
                model: model || 'deepseek-r1:8b',
                userId: userId || null, // Associate with user if logged in
            },
            include: {
                messages: true,
            },
        });

        return NextResponse.json({ session: newSession });
    } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}
