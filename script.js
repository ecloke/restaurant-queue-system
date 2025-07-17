// Queue Management System
class QueueSystem {
    constructor() {
        this.queue = [];
        this.history = [];
        this.nextQueueNumber = 1;
        this.currentInterface = 'customer';
        this.isLoggedIn = false;
        
        this.init();
        this.loadSampleData();
    }

    init() {
        this.setupEventListeners();
        this.checkPortalAccess();
        this.checkEmailLinkAccess();
        this.updateQueueStats();
        this.renderQueues();
        this.debugEmailJS();
    }

    // Debug EmailJS connection
    debugEmailJS() {
        console.log('🔍 ====== EmailJS CONNECTION STATUS ======');
        
        // Check EmailJS library
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS library NOT LOADED');
            console.error('   Check if CDN script is working: https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
            return;
        } else {
            console.log('✅ EmailJS library LOADED successfully');
            console.log('   Available methods:', Object.keys(emailjs));
        }
        
        // Check config file
        if (typeof EMAILJS_CONFIG === 'undefined') {
            console.error('❌ EMAILJS_CONFIG NOT LOADED');
            console.error('   Check if emailjs-config.js file exists and is loaded');
            return;
        } else {
            console.log('✅ EMAILJS_CONFIG LOADED successfully');
            console.log('   Configuration:', {
                USER_ID: EMAILJS_CONFIG.USER_ID,
                SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
                TEMPLATES: EMAILJS_CONFIG.TEMPLATES
            });
        }
        
        // Check initialization
        try {
            if (emailjs.init) {
                console.log('✅ EmailJS initialization function available');
            } else {
                console.error('❌ EmailJS.init not available');
            }
        } catch (error) {
            console.error('❌ Error checking EmailJS initialization:', error);
        }
        
        console.log('📧 EMAIL SENDING STATUS:');
        console.log('   - When you join queue, detailed logs will appear here');
        console.log('   - Look for "QUEUE JOIN EMAIL ATTEMPT" messages');
        
        console.log('🔍 ====== END CONNECTION STATUS ======');
        
        // Add a test button to global scope for manual testing
        window.testEmailJS = this.testEmailJS.bind(this);
        console.log('💡 Type "testEmailJS()" in console to test email sending');
    }

    // Test EmailJS connection
    testEmailJS() {
        console.log('=== Testing EmailJS Connection ===');
        
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not loaded');
            return;
        }
        
        if (typeof EMAILJS_CONFIG === 'undefined') {
            console.error('❌ EMAILJS_CONFIG not loaded');
            return;
        }
        
        const testData = {
            to_name: 'Test User',
            to_email: 'test@example.com',
            queue_number: 999,
            position: 1,
            total_people: 1,
            wait_time: 5,
            status_link: 'http://localhost:8000?phone=0123456789'
        };
        
        console.log('Sending test email with data:', testData);
        
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.QUEUE_JOIN, testData)
            .then(response => {
                console.log('✅ Test email sent successfully:', response);
            })
            .catch(error => {
                console.error('❌ Test email failed:', error);
            });
    }

    // Initialize sample data for demo
    loadSampleData() {
        const sampleData = [
            {
                id: 1,
                name: 'Ahmad Rahman',
                phone: '0123456789',
                email: 'ahmad@email.com',
                joinTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                status: 'waiting'
            },
            {
                id: 2,
                name: 'Siti Nurhaliza',
                phone: '0198765432',
                email: 'siti@email.com',
                joinTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                status: 'waiting'
            },
            {
                id: 3,
                name: 'Lim Wei Ming',
                phone: '0167890123',
                email: 'lim@email.com',
                joinTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                status: 'waiting'
            }
        ];

        this.queue = sampleData;
        this.nextQueueNumber = 4;

        // Sample history
        this.history = [
            {
                id: 101,
                name: 'John Doe',
                phone: '0123456789',
                email: 'john@email.com',
                joinTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                completeTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                status: 'completed'
            },
            {
                id: 102,
                name: 'Jane Smith',
                phone: '0198765432',
                email: 'jane@email.com',
                joinTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
                completeTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
                status: 'cancelled'
            }
        ];
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('takeQueueBtn').addEventListener('click', () => this.showPage('takeQueue'));
        document.getElementById('checkQueueBtn').addEventListener('click', () => this.showPage('checkQueue'));

        // Queue form
        document.getElementById('queueForm').addEventListener('submit', (e) => this.handleQueueSubmit(e));

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());

        // Cancel queue
        document.getElementById('cancelQueueBtn').addEventListener('click', () => this.cancelQueue());

        // Merchant portal
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Dashboard tabs
        document.getElementById('waitingListTab').addEventListener('click', () => this.showTab('waitingList'));
        document.getElementById('historyTab').addEventListener('click', () => this.showTab('historyList'));

        // Real-time updates
        setInterval(() => this.updateQueueStats(), 5000);
    }

    checkPortalAccess() {
        if (window.location.pathname.endsWith('/portal') || window.location.hash === '#portal') {
            this.currentInterface = 'merchant';
            document.getElementById('customerInterface').style.display = 'none';
            document.getElementById('merchantPortal').style.display = 'block';
        }
    }

    checkEmailLinkAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        const phone = urlParams.get('phone');
        
        if (phone && this.currentInterface === 'customer') {
            this.showPage('checkQueue');
            this.displayQueueStatus(phone);
        }
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected page
        if (page === 'takeQueue') {
            document.getElementById('takeQueuePage').classList.add('active');
            document.getElementById('takeQueueBtn').classList.add('active');
        } else if (page === 'checkQueue') {
            document.getElementById('checkQueuePage').classList.add('active');
            document.getElementById('checkQueueBtn').classList.add('active');
            
            // Reset to access message if no URL params
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('phone')) {
                document.querySelector('.access-message').style.display = 'block';
                document.getElementById('queueStatusDisplay').style.display = 'none';
            }
        }
    }

    validatePhone(phone) {
        const phoneRegex = /^01[0-9]{8,9}$/;
        return phoneRegex.test(phone);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleQueueSubmit(e) {
        e.preventDefault();
        
        console.log('🎯 ====== QUEUE JOIN FORM SUBMITTED ======');
        
        const formData = new FormData(e.target);
        const name = formData.get('customerName').trim();
        const phone = formData.get('customerPhone').trim();
        const email = formData.get('customerEmail').trim();
        
        console.log('📝 Form Data:', { name, phone, email });

        // Validation
        if (!name || !phone || !email) {
            console.log('❌ Validation failed: Missing fields');
            alert('Please fill in all fields');
            return;
        }

        if (!this.validatePhone(phone)) {
            console.log('❌ Validation failed: Invalid phone number:', phone);
            alert('Please enter a valid Malaysian phone number (01xxxxxxxx)');
            return;
        }

        if (!this.validateEmail(email)) {
            console.log('❌ Validation failed: Invalid email:', email);
            alert('Please enter a valid email address');
            return;
        }

        // Check if phone already in queue
        if (this.queue.find(item => item.phone === phone)) {
            console.log('❌ Validation failed: Phone already in queue:', phone);
            alert('This phone number is already in the queue');
            return;
        }

        console.log('✅ Validation passed - adding to queue');

        // Add to queue
        const queueItem = {
            id: this.nextQueueNumber++,
            name,
            phone,
            email,
            joinTime: new Date(),
            status: 'waiting'
        };

        this.queue.push(queueItem);
        this.updateQueueStats();
        this.renderQueues();

        console.log('✅ Queue item created:', queueItem);
        console.log('📧 Now attempting to send email...');

        // Send email notification
        this.sendQueueJoinEmail(queueItem);

        // Show success modal
        this.showSuccessModal(queueItem);

        // Reset form
        e.target.reset();
        
        console.log('✅ Form reset complete');
        console.log('🎯 ====== QUEUE JOIN PROCESS COMPLETE ======');
    }

    showSuccessModal(queueItem) {
        const position = this.queue.findIndex(item => item.id === queueItem.id) + 1;
        const waitTime = position * 5;

        document.getElementById('assignedQueueNumber').textContent = `#${queueItem.id}`;
        document.getElementById('assignedPosition').textContent = position;
        document.getElementById('assignedWaitTime').textContent = waitTime;
        document.getElementById('successModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    updateQueueStats() {
        const peopleInQueue = this.queue.length;
        const estimatedWait = peopleInQueue * 5;

        document.getElementById('peopleInQueue').textContent = peopleInQueue;
        document.getElementById('estimatedWait').textContent = estimatedWait;
    }

    displayQueueStatus(phone) {
        const queueItem = this.queue.find(item => item.phone === phone);
        
        if (!queueItem) {
            document.querySelector('.access-message').style.display = 'block';
            document.getElementById('queueStatusDisplay').style.display = 'none';
            document.querySelector('.access-message h2').textContent = 'Queue Not Found';
            document.querySelector('.access-message p').textContent = 'Your queue number was not found. It may have been completed or cancelled.';
            return;
        }

        const position = this.queue.findIndex(item => item.id === queueItem.id) + 1;
        const waitTime = position * 5;

        document.querySelector('.access-message').style.display = 'none';
        document.getElementById('queueStatusDisplay').style.display = 'block';

        document.getElementById('statusName').textContent = queueItem.name;
        document.getElementById('statusQueueNumber').textContent = `#${queueItem.id}`;
        document.getElementById('statusPosition').textContent = position;
        document.getElementById('statusWaitTime').textContent = `${waitTime} minutes`;
        document.getElementById('statusJoinTime').textContent = this.formatTime(queueItem.joinTime);

        // Store current phone for cancel functionality
        this.currentCheckPhone = phone;
    }

    cancelQueue() {
        if (!this.currentCheckPhone) return;

        const queueIndex = this.queue.findIndex(item => item.phone === this.currentCheckPhone);
        if (queueIndex === -1) return;

        const queueItem = this.queue[queueIndex];
        
        // Move to history
        this.history.unshift({
            ...queueItem,
            completeTime: new Date(),
            status: 'cancelled'
        });

        // Remove from queue
        this.queue.splice(queueIndex, 1);

        // Update displays
        this.updateQueueStats();
        this.renderQueues();

        // Show cancellation message
        document.querySelector('.access-message').style.display = 'block';
        document.getElementById('queueStatusDisplay').style.display = 'none';
        document.querySelector('.access-message h2').textContent = 'Queue Cancelled';
        document.querySelector('.access-message p').textContent = 'Your queue has been successfully cancelled.';
        document.querySelector('.email-icon').textContent = '✅';

        this.currentCheckPhone = null;
    }

    // Merchant Portal Functions
    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (username === 'admin' && password === 'admin') {
            this.isLoggedIn = true;
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('portalDashboard').style.display = 'block';
            this.renderQueues();
        } else {
            alert('Invalid credentials. Use username: admin, password: admin');
        }
    }

    logout() {
        this.isLoggedIn = false;
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('portalDashboard').style.display = 'none';
        document.getElementById('adminLoginForm').reset();
    }

    showTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        if (tab === 'waitingList') {
            document.getElementById('waitingListTab').classList.add('active');
            document.getElementById('waitingList').classList.add('active');
        } else if (tab === 'historyList') {
            document.getElementById('historyTab').classList.add('active');
            document.getElementById('historyList').classList.add('active');
        }
    }

    renderQueues() {
        if (!this.isLoggedIn) return;

        this.renderWaitingList();
        this.renderHistory();
    }

    renderWaitingList() {
        const container = document.getElementById('waitingListContainer');
        
        if (this.queue.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No customers in queue</p>';
            return;
        }

        container.innerHTML = this.queue.map((item, index) => `
            <div class="queue-item">
                <div class="queue-item-header">
                    <div class="queue-number">#${item.id}</div>
                    <div class="queue-timestamp">${this.formatTime(item.joinTime)}</div>
                </div>
                <div class="queue-item-details">
                    <div class="queue-item-detail">
                        <label>Name:</label>
                        <span>${item.name}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Phone:</label>
                        <span>${item.phone}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Email:</label>
                        <span>${item.email}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Position:</label>
                        <span>${index + 1}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Wait Time:</label>
                        <span>${(index + 1) * 5} min</span>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="action-btn complete-btn" onclick="queueSystem.completeQueue(${item.id})">
                        Complete
                    </button>
                    <button class="action-btn cancel-action-btn" onclick="queueSystem.cancelQueueAdmin(${item.id})">
                        Cancel
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderHistory() {
        const container = document.getElementById('historyContainer');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No history records</p>';
            return;
        }

        container.innerHTML = this.history.map(item => `
            <div class="queue-item status-${item.status}">
                <div class="queue-item-header">
                    <div class="queue-number">#${item.id}</div>
                    <div class="queue-timestamp">${this.formatTime(item.completeTime)}</div>
                </div>
                <div class="queue-item-details">
                    <div class="queue-item-detail">
                        <label>Name:</label>
                        <span>${item.name}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Phone:</label>
                        <span>${item.phone}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Email:</label>
                        <span>${item.email}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Status:</label>
                        <span style="text-transform: capitalize;">${item.status}</span>
                    </div>
                    <div class="queue-item-detail">
                        <label>Joined:</label>
                        <span>${this.formatTime(item.joinTime)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    completeQueue(id) {
        const queueIndex = this.queue.findIndex(item => item.id === id);
        if (queueIndex === -1) return;

        const queueItem = this.queue[queueIndex];
        
        // Send "next in line" email if this is the first person
        if (queueIndex === 0) {
            this.sendNextInLineEmail(queueItem);
        }

        // Move to history
        this.history.unshift({
            ...queueItem,
            completeTime: new Date(),
            status: 'completed'
        });

        // Remove from queue
        this.queue.splice(queueIndex, 1);

        // Update displays
        this.updateQueueStats();
        this.renderQueues();

        // Send "next in line" email to new first person
        if (this.queue.length > 0) {
            this.sendNextInLineEmail(this.queue[0]);
        }
    }

    cancelQueueAdmin(id) {
        const queueIndex = this.queue.findIndex(item => item.id === id);
        if (queueIndex === -1) return;

        const queueItem = this.queue[queueIndex];
        
        // Move to history
        this.history.unshift({
            ...queueItem,
            completeTime: new Date(),
            status: 'cancelled'
        });

        // Remove from queue
        this.queue.splice(queueIndex, 1);

        // Update displays
        this.updateQueueStats();
        this.renderQueues();
    }

    // Email Functions (Using EmailJS - Free Service)
    sendQueueJoinEmail(queueItem) {
        const position = this.queue.findIndex(item => item.id === queueItem.id) + 1;
        const waitTime = position * 5;
        const statusLink = `${window.location.origin}${window.location.pathname}?phone=${queueItem.phone}`;

        const emailData = {
            to_name: queueItem.name,
            to_email: queueItem.email,
            queue_number: queueItem.id,
            position: position,
            total_people: this.queue.length,
            wait_time: waitTime,
            status_link: statusLink
        };

        // Send email using EmailJS
        console.log('📧 ====== QUEUE JOIN EMAIL ATTEMPT ======');
        console.log('🎯 Target Email:', queueItem.email);
        console.log('📄 Email Data:', emailData);
        
        if (typeof EMAILJS_CONFIG === 'undefined') {
            console.error('❌ CRITICAL: EMAILJS_CONFIG is not defined');
            console.error('   ➜ Check if emailjs-config.js file exists and is loaded');
            console.error('   ➜ Check browser network tab for 404 errors');
            return;
        }
        
        if (typeof emailjs === 'undefined') {
            console.error('❌ CRITICAL: EmailJS library is not loaded');
            console.error('   ➜ Check if CDN script is working');
            console.error('   ➜ Check browser network tab for script loading errors');
            return;
        }
        
        console.log('✅ Prerequisites checked - EmailJS and config loaded');
        console.log('🔧 Using Service ID:', EMAILJS_CONFIG.SERVICE_ID);
        console.log('📧 Using Template ID:', EMAILJS_CONFIG.TEMPLATES.QUEUE_JOIN);
        console.log('👤 Using User ID:', EMAILJS_CONFIG.USER_ID);
        
        console.log('🚀 Sending email now...');
        
        const startTime = Date.now();
        
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.QUEUE_JOIN, emailData)
            .then(response => {
                const duration = Date.now() - startTime;
                console.log('✅ ====== EMAIL SENT SUCCESSFULLY ======');
                console.log('📊 Response Status:', response.status);
                console.log('📊 Response Text:', response.text);
                console.log('⏱️ Send Duration:', duration + 'ms');
                console.log('🎯 Email sent to:', queueItem.email);
                console.log('✅ ====== EMAIL SUCCESS END ======');
            })
            .catch(error => {
                const duration = Date.now() - startTime;
                console.error('❌ ====== EMAIL SENDING FAILED ======');
                console.error('⏱️ Failed after:', duration + 'ms');
                console.error('📊 Error Status:', error.status);
                console.error('📊 Error Text:', error.text);
                console.error('📊 Error Message:', error.message);
                console.error('📊 Full Error Object:', error);
                
                // Detailed error analysis
                if (error.status === 400) {
                    console.error('🔍 ERROR 400 - BAD REQUEST:');
                    console.error('   ➜ Template ID "' + EMAILJS_CONFIG.TEMPLATES.QUEUE_JOIN + '" may not exist');
                    console.error('   ➜ Check EmailJS dashboard for correct template ID');
                    console.error('   ➜ Verify template variables match email data');
                } else if (error.status === 403) {
                    console.error('🔍 ERROR 403 - FORBIDDEN:');
                    console.error('   ➜ User ID "' + EMAILJS_CONFIG.USER_ID + '" may be invalid');
                    console.error('   ➜ Service ID "' + EMAILJS_CONFIG.SERVICE_ID + '" may be invalid');
                    console.error('   ➜ Check EmailJS dashboard for correct credentials');
                } else if (error.status === 404) {
                    console.error('🔍 ERROR 404 - NOT FOUND:');
                    console.error('   ➜ Service or template not found');
                    console.error('   ➜ Double-check service ID and template ID');
                } else {
                    console.error('🔍 UNKNOWN ERROR:');
                    console.error('   ➜ Check internet connection');
                    console.error('   ➜ Check EmailJS service status');
                }
                
                console.error('❌ ====== EMAIL FAILURE END ======');
            });

        // For demo purposes, log the email content
        console.log('Queue Join Email (Demo):', {
            to: queueItem.email,
            subject: `Queue Confirmation #${queueItem.id}`,
            body: `Hello ${queueItem.name}! Your queue number: #${queueItem.id}, Current position: ${position} in line, People queuing: ${this.queue.length}, Estimated wait: ${waitTime} minutes, Check status: ${statusLink}`
        });
    }

    sendNextInLineEmail(queueItem) {
        const emailData = {
            to_name: queueItem.name,
            to_email: queueItem.email,
            queue_number: queueItem.id
        };

        // Send email using EmailJS
        if (typeof EMAILJS_CONFIG !== 'undefined' && typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATES.NEXT_IN_LINE, emailData)
                .then(response => {
                    console.log('Next in line email sent successfully:', response);
                })
                .catch(error => {
                    console.error('Email error:', error);
                    // Fall back to demo mode if email fails
                    console.log('Falling back to demo mode');
                });
        } else {
            console.warn('EmailJS not configured. Running in demo mode.');
        }

        // For demo purposes, log the email content
        console.log('Next In Line Email (Demo):', {
            to: queueItem.email,
            subject: `You're Next in Line! Queue #${queueItem.id}`,
            body: `Hello ${queueItem.name}! You're next in line! Queue #${queueItem.id}. Please make your way to the restaurant now.`
        });
    }

    formatTime(date) {
        return date.toLocaleString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the system
let queueSystem;
document.addEventListener('DOMContentLoaded', () => {
    queueSystem = new QueueSystem();
});

// Handle portal URL access
if (window.location.hash === '#portal' || window.location.pathname.endsWith('/portal')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('customerInterface').style.display = 'none';
        document.getElementById('merchantPortal').style.display = 'block';
    });
}