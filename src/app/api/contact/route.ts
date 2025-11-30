import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/contact
 * 
 * Handles contact form submissions.
 * 
 * Request body:
 * {
 *   name: string,
 *   email: string,
 *   subject: string,
 *   message: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Try to save to database
    try {
      await prisma.contactSubmission.create({
        data: {
          name,
          email,
          subject: subject || 'General Inquiry',
          message,
        },
      });
    } catch {
      // If database fails, just log (for now)
      console.log('Contact form submission (DB not available):', { name, email, subject, message });
    }

    // In production, you would also:
    // - Send email notification
    // - Integrate with CRM
    // - Add spam protection (reCAPTCHA, etc.)

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}

