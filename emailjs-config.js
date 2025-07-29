// EmailJS Configuration for sending emails directly from browser
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_gmail',
    TEMPLATE_ID: 'template_enquiry',
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY' // Replace with your EmailJS public key
};

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
})();

// Function to send email using EmailJS
async function sendEmailNotification(name, phone, course) {
    const templateParams = {
        to_email: CONFIG.NOTIFICATION_EMAIL,
        from_name: name,
        student_name: name,
        student_phone: phone,
        course_interest: course,
        enquiry_time: new Date().toLocaleString(),
        message: `New enquiry received from ${name} (${phone}) interested in ${course} course.`
    };

    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Email failed:', error);
        return false;
    }
}