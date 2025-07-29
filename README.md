# Chords Music Academy Website

A responsive website for a music academy with integrated chatbot for enquiries.

## Features

- Responsive design
- Course showcase
- Integrated chatbot for enquiries
- WhatsApp integration
- Email notifications
- Mobile-friendly

## Setup Instructions

1. **Local Development:**
   - Open `index.html` in any web browser
   - No server required for basic functionality

2. **Configuration:**
   - Update WhatsApp number in `js/script.js` (line 32)
   - Update email address in `js/script.js` (line 44)

3. **For Production:**
   - Host on any web server (Apache, Nginx, or cloud hosting)
   - Implement server-side email sending for better reliability

## File Structure

```
chords_music_academy/
├── index.html          # Main website file
├── css/
│   └── style.css       # Styling
├── js/
│   └── script.js       # JavaScript functionality
├── images/             # Image assets (add your images here)
└── README.md           # This file
```

## Customization

1. **Colors:** Edit CSS variables in `style.css`
2. **Content:** Update text in `index.html`
3. **Courses:** Modify course cards in HTML and update prices
4. **Contact Info:** Update contact details in HTML and JS

## Migration to Another Machine

This website is fully portable:
1. Copy the entire `chords_music_academy` folder
2. No database or server dependencies
3. Works on any operating system
4. Can be hosted on any web server

## WhatsApp Integration

- Automatically opens WhatsApp with pre-filled message
- Works on mobile devices and WhatsApp Web
- Update the phone number in `script.js`

## Email Integration

- Currently uses `mailto:` (opens default email client)
- For production, consider using:
  - EmailJS for client-side email sending
  - Server-side solutions (PHP, Node.js, Python)
  - Email APIs (SendGrid, Mailgun)

## Browser Compatibility

- Chrome, Firefox, Safari, Edge
- Mobile browsers
- Responsive design for all screen sizes