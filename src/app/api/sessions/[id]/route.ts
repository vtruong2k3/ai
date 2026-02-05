/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

type Params = {
    params: Promise<{ id: string }>;
};

// GET /api/sessions/[id] - Get single session
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await prisma.chatSession.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error('Get session error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}

// PUT /api/sessions/[id] - Update session
export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, model, messages } = body;

        // Start a transaction to update session and messages
        const session = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Update session
            const updatedSession = await tx.chatSession.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(model && { model }),
                    updatedAt: new Date(),
                },
            });

            // If messages provided, replace all messages
            if (messages && Array.isArray(messages)) {
                // Delete existing messages
                await tx.message.deleteMany({
                    where: { sessionId: id },
                });

                // Create new messages
                if (messages.length > 0) {
                    await tx.message.createMany({
                        data: messages.map((msg: any) => ({
                            sessionId: id,
                            role: msg.role,
                            content: msg.content,
                            attachments: msg.attachments || null,
                        })),
                    });
                }
            }

            // Return updated session with messages
            return tx.chatSession.findUnique({
                where: { id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
        });

        return NextResponse.json({ session });
    } catch (error) {
        console.error('Update session error:', error);
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        );
    }
}

// DELETE /api/sessions/[id] - Delete session
export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        await prisma.chatSession.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete session error:', error);

        // Handle record not found error
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}
