import { NextResponse } from 'next/server';

// Your email where you want to receive contact form submissions
const RECIPIENT_EMAIL = 'maazhussain972@gmail.com';

// Web3Forms API endpoint (free email service)
const WEB3FORMS_API = 'https://api.web3forms.com/submit';
// Get your free access key from https://web3forms.com/
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || '';

/**
 * POST /api/contact
 * 
 * Handles contact form submissions and sends email notification.
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

    // Send email via Web3Forms
    if (WEB3FORMS_ACCESS_KEY) {
      try {
        const web3Response = await fetch(WEB3FORMS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            to: RECIPIENT_EMAIL,
            from_name: 'NUST Aggregate Calculator',
            subject: `Contact Form: ${subject || 'General Inquiry'}`,
            message: `
New contact form submission from NUST Aggregate Calculator:

📧 From: ${name} (${email})
📋 Subject: ${subject || 'General Inquiry'}

💬 Message:
${message}

---
Sent from NUST Aggregate Calculator Contact Form
            `.trim(),
            reply_to: email,
          }),
        });

        const web3Data = await web3Response.json();
        
        if (!web3Response.ok || !web3Data.success) {
          console.error('Web3Forms error:', web3Data);
          // Don't fail the request, just log the error
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      // If no API key, log the submission
      console.log('Contact form submission (no email API configured):', { 
        name, 
        email, 
        subject, 
        message,
        recipient: RECIPIENT_EMAIL 
      });
    }

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

