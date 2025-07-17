# Restaurant Queue System

A modern, responsive web application for managing restaurant queues with real-time updates, email notifications, and merchant portal.

## Features

### Customer Interface
- **Homepage**: Take queue number with real-time queue statistics
- **Queue Stats**: Shows current people in queue and estimated wait time (5 minutes per person)
- **Queue Form**: Customer name, Malaysian phone number, and email validation
- **Success Modal**: Displays assigned queue number and position
- **Status Check**: Accessible only via email links with pre-filled phone numbers

### Email Integration (FREE)
- **Join Queue Email**: Sends queue details with status check link
- **Next in Line Email**: Notifies when customer is next to be served
- **Free Service**: Uses EmailJS for free email notifications

### Merchant Portal
- **Secure Access**: Only accessible via `/portal` URL (hidden from main navigation)
- **Admin Login**: Username: `admin`, Password: `admin`
- **Queue Management**: Complete/cancel buttons for each customer
- **History Tracking**: Shows completed/cancelled orders with timestamps
- **Real-time Updates**: Auto-updates when customers join or leave

## Technical Specifications

### File Structure
```
restaurant-queue-system/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # JavaScript functionality
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

### Validation
- **Malaysian Phone**: Format `01[0-9]{8,9}` (e.g., 0123456789)
- **Email**: Standard email format validation
- **Form Validation**: All fields required with proper error messages

### Design Features
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Gradient backgrounds and smooth animations
- **Professional Look**: Clean interface with proper spacing
- **Accessibility**: Proper form labels and keyboard navigation

## Setup Instructions

### Local Development
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd restaurant-queue-system
   ```

2. Open `index.html` in a web browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

3. Access the application:
   - Customer Interface: `http://localhost:8000`
   - Merchant Portal: `http://localhost:8000#portal`

### EmailJS Integration (FREE)
1. Sign up for free at [EmailJS](https://www.emailjs.com/)
2. Create email templates:
   - **Queue Join Template**: Include variables for `to_name`, `queue_number`, `position`, `total_people`, `wait_time`, `status_link`
   - **Next in Line Template**: Include variables for `to_name`, `queue_number`
3. Update `script.js` with your EmailJS credentials:
   ```javascript
   // Replace in sendQueueJoinEmail and sendNextInLineEmail functions
   emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailData)
   ```

### Netlify Deployment
1. Build your site locally (if needed)
2. Upload files to Netlify:
   - Drag and drop the entire folder to [Netlify](https://netlify.com)
   - Or connect your Git repository
3. Configure redirects for portal access (optional):
   ```
   /portal    /index.html    200
   ```

## Usage Guide

### For Customers
1. **Join Queue**: Fill out the form with name, phone (Malaysian format), and email
2. **Receive Email**: Get confirmation email with queue details and status link
3. **Check Status**: Click link in email to see current position and wait time
4. **Cancel Queue**: Use the cancel button on status page if needed

### For Merchants
1. **Access Portal**: Navigate to `/portal` or add `#portal` to URL
2. **Login**: Use credentials `admin`/`admin`
3. **Manage Queue**: Use complete/cancel buttons for each customer
4. **View History**: Switch to history tab to see past orders
5. **Real-time Updates**: Queue updates automatically as customers join

## Sample Data
The system includes sample queue data for demonstration:
- 3 customers in waiting queue
- 2 customers in history (completed/cancelled)
- Pre-calculated wait times and positions

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Security Notes
- Merchant portal is hidden from main navigation
- Simple admin authentication (enhance for production)
- Client-side validation (add server-side for production)
- No sensitive data stored in browser

## Customization
- **Wait Time**: Modify the 5-minute calculation in `script.js`
- **Phone Format**: Update validation regex for different countries
- **Styling**: Modify `styles.css` for different themes
- **Email Templates**: Customize email content in EmailJS

## License
This project is open source and available under the [MIT License](LICENSE).

## Support
For issues or questions, please create an issue in the repository or contact the development team.

---

**Note**: This is a demonstration system. For production use, implement proper backend authentication, database storage, and server-side validation.