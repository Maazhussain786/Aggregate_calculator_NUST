import { NextResponse } from 'next/server';

// Your email where you want to receive contact form submissions
const RECIPIENT_EMAIL = 'maazhussain972@gmail.com';

// Web3Forms API endpoint (free email service)
const WEB3FORMS_API = 'https://api.web3forms.com/submit';
// Web3Forms access key - Get your free access key from https://web3forms.com/
// This is a public key that can be safely used in the codebase
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || 'cfce8721-ce86-48cc-b4ec-7a2e71d8a57d';

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
    if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_ACCESS_KEY_HERE') {
      try {
        const web3Response = await fetch(WEB3FORMS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            name: name,
            email: email,
            subject: `NUST Calculator: ${subject || 'General Inquiry'}`,
            message: message,
            botcheck: '', // Anti-spam honeypot field (must be empty)
          }),
        });

        const web3Data = await web3Response.json();
        
        console.log('Web3Forms response:', web3Data);
        
        if (!web3Response.ok || !web3Data.success) {
          console.error('Web3Forms error:', web3Data);
          return NextResponse.json(
            { error: `Failed to send message: ${web3Data.message || 'Unknown error'}` },
            { status: 500 }
          );
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json(
          { error: 'Failed to send message. Please try again later.' },
          { status: 500 }
        );
      }
    } else {
      // If no API key configured, return error with direct email option
      return NextResponse.json({
        success: false,
        error: 'Contact form is temporarily unavailable. Please email us directly at maazhussain972@gmail.com',
        directEmail: RECIPIENT_EMAIL,
      }, { status: 503 });
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

