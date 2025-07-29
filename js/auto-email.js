function sendAutoEmail(name, email, phone, course) {
    const subject = 'New Course Enquiry - Chords Music Academy';
    const body = `New enquiry received:

Name: ${name}
Email: ${email}
Phone: ${phone}
Course: ${course}
Time: ${new Date().toLocaleString()}

Please contact the student.`;
    
    const mailtoUrl = `mailto:${CONFIG.NOTIFICATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    console.log('Email client opened for:', CONFIG.NOTIFICATION_EMAIL);
    return true;
}