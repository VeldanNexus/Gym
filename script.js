// Gym Management System JavaScript

class GymManager {
    constructor() {
        this.currentUser = null;
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.courses = [];
        this.bookings = [];
        this.currentCourseId = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.checkAuth();
        this.bindEvents();
    }

    // Authentication
    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.showMainApp();
        } else {
            this.showLogin();
        }
    }

    login(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        // Simple authentication (in real app, this would be server-side)
        if (email && password) {
            const user = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0]
            };
            
            localStorage.setItem('authToken', 'dummy-token');
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser = user;
            
            this.showMainApp();
            this.addActivity(`User ${user.name} logged in`);
        }
    }

    register(event) {
        event.preventDefault();
        const form = event.target;
        const firstName = form.querySelector('input[type="text"]').value;
        const lastName = form.querySelectorAll('input[type="text"]')[1].value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        if (email && password && firstName && lastName) {
            const user = {
                id: Date.now(),
                email: email,
                name: `${firstName} ${lastName}`
            };
            
            localStorage.setItem('authToken', 'dummy-token');
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser = user;
            
            this.showMainApp();
            this.addActivity(`New user ${user.name} registered`);
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
    }

    // UI Navigation
    showLogin() {
        document.getElementById('loginPage').classList.remove('d-none');
        document.getElementById('registerPage').classList.add('d-none');
        document.getElementById('mainApp').classList.add('d-none');
    }

    showRegister() {
        document.getElementById('loginPage').classList.add('d-none');
        document.getElementById('registerPage').classList.remove('d-none');
        document.getElementById('mainApp').classList.add('d-none');
    }

    showMainApp() {
        document.getElementById('loginPage').classList.add('d-none');
        document.getElementById('registerPage').classList.add('d-none');
        document.getElementById('mainApp').classList.remove('d-none');
        this.showDashboard();
    }

    showDashboard() {
        this.hideAllPages();
        document.getElementById('dashboardPage').classList.remove('d-none');
        this.updateDashboardStats();
    }

    showBooking() {
        this.hideAllPages();
        document.getElementById('bookingPage').classList.remove('d-none');
        this.renderCalendar();
        this.renderMyBookings();
    }

    showManagement() {
        this.hideAllPages();
        document.getElementById('managementPage').classList.remove('d-none');
        this.renderCourses();
    }

    hideAllPages() {
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('d-none');
        });
    }

    // Data Management
    loadData() {
        this.courses = JSON.parse(localStorage.getItem('courses')) || this.getDefaultCourses();
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    }

    saveData() {
        localStorage.setItem('courses', JSON.stringify(this.courses));
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }

    getDefaultCourses() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        return [
            {
                id: 1,
                title: 'Morning Yoga',
                trainer: 'Sarah Johnson',
                description: 'Start your day with energizing yoga poses and breathing exercises.',
                image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
                duration: 60,
                schedules: [
                    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0).toISOString(),
                    new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 8, 0).toISOString()
                ]
            },
            {
                id: 2,
                title: 'HIIT Training',
                trainer: 'Mike Chen',
                description: 'High-intensity interval training for maximum calorie burn.',
                image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg',
                duration: 45,
                schedules: [
                    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0).toISOString(),
                    new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0).toISOString()
                ]
            },
            {
                id: 3,
                title: 'Pilates Core',
                trainer: 'Emma Davis',
                description: 'Strengthen your core with focused Pilates exercises.',
                image: 'https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg',
                duration: 50,
                schedules: [
                    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString()
                ]
            }
        ];
    }

    // Dashboard
    updateDashboardStats() {
        document.getElementById('totalCourses').textContent = this.courses.length;
        document.getElementById('totalBookings').textContent = this.bookings.length;
        
        const today = new Date().toDateString();
        const todayClasses = this.courses.reduce((count, course) => {
            return count + course.schedules.filter(schedule => 
                new Date(schedule).toDateString() === today
            ).length;
        }, 0);
        
        document.getElementById('todayClasses').textContent = todayClasses;
    }

    addActivity(message) {
        const activityFeed = document.getElementById('activityFeed');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-info-circle text-primary"></i>
            <span>${message}</span>
            <small class="text-muted ms-auto">Just now</small>
        `;
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Keep only last 10 activities
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    // Calendar
    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('currentMonth');
        
        monthYear.textContent = this.currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHTML = '<div class="calendar-header">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            calendarHTML += `<div>${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar">';

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === this.currentMonth.getMonth();
            const isSelected = this.selectedDate && 
                currentDate.toDateString() === this.selectedDate.toDateString();
            const hasClasses = this.getClassesForDate(currentDate).length > 0;
            
            let classes = 'calendar-day';
            if (!isCurrentMonth) classes += ' other-month';
            if (isSelected) classes += ' selected';
            if (hasClasses) classes += ' has-classes';

            calendarHTML += `
                <div class="${classes}" onclick="selectDate('${currentDate.toISOString()}')">
                    ${currentDate.getDate()}
                </div>
            `;
        }

        calendarHTML += '</div>';
        calendar.innerHTML = calendarHTML;
    }

    selectDate(dateString) {
        this.selectedDate = new Date(dateString);
        this.renderCalendar();
        this.renderAvailableClasses();
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    getClassesForDate(date) {
        const classes = [];
        this.courses.forEach(course => {
            course.schedules.forEach(schedule => {
                const scheduleDate = new Date(schedule);
                if (scheduleDate.toDateString() === date.toDateString()) {
                    classes.push({
                        ...course,
                        scheduleDate: scheduleDate
                    });
                }
            });
        });
        return classes.sort((a, b) => a.scheduleDate - b.scheduleDate);
    }

    renderAvailableClasses() {
        const container = document.getElementById('availableClasses');
        if (!this.selectedDate) {
            container.innerHTML = '<p class="text-muted">Select a date to see available classes</p>';
            return;
        }

        const classes = this.getClassesForDate(this.selectedDate);
        if (classes.length === 0) {
            container.innerHTML = '<p class="text-muted">No classes available for this date</p>';
            return;
        }

        container.innerHTML = classes.map(classItem => `
            <div class="class-item" onclick="bookClass(${classItem.id}, '${classItem.scheduleDate.toISOString()}')">
                <div class="class-time">${classItem.scheduleDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
                <div class="class-title">${classItem.title}</div>
                <div class="class-trainer">with ${classItem.trainer}</div>
                <small class="text-muted">${classItem.duration} minutes</small>
            </div>
        `).join('');
    }

    bookClass(courseId, scheduleDate) {
        const course = this.courses.find(c => c.id === courseId);
        const schedule = new Date(scheduleDate);
        
        const bookingModalContent = document.getElementById('bookingModalContent');
        bookingModalContent.innerHTML = `
            <div class="text-center mb-3">
                <img src="${course.image}" alt="${course.title}" class="img-fluid rounded mb-3" style="max-height: 150px;">
                <h5>${course.title}</h5>
                <p class="text-muted">with ${course.trainer}</p>
            </div>
            <div class="row">
                <div class="col-6">
                    <strong>Date:</strong><br>
                    ${schedule.toLocaleDateString()}
                </div>
                <div class="col-6">
                    <strong>Time:</strong><br>
                    ${schedule.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <div class="mt-3">
                <strong>Duration:</strong> ${course.duration} minutes<br>
                <strong>Description:</strong> ${course.description}
            </div>
        `;
        
        // Store booking details for confirmation
        window.pendingBooking = {
            courseId: courseId,
            scheduleDate: scheduleDate,
            course: course
        };
        
        new bootstrap.Modal(document.getElementById('bookingModal')).show();
    }

    confirmBooking() {
        if (!window.pendingBooking) return;
        
        const booking = {
            id: Date.now(),
            userId: this.currentUser.id,
            courseId: window.pendingBooking.courseId,
            scheduleDate: window.pendingBooking.scheduleDate,
            courseTitle: window.pendingBooking.course.title,
            trainer: window.pendingBooking.course.trainer,
            bookingDate: new Date().toISOString()
        };
        
        this.bookings.push(booking);
        this.saveData();
        this.renderMyBookings();
        this.updateDashboardStats();
        this.addActivity(`Booked class: ${booking.courseTitle} with ${booking.trainer}`);
        
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
        
        // Show success message
        alert('Class booked successfully!');
        delete window.pendingBooking;
    }

    renderMyBookings() {
        const container = document.getElementById('myBookings');
        const userBookings = this.bookings.filter(booking => booking.userId === this.currentUser.id);
        
        if (userBookings.length === 0) {
            container.innerHTML = '<p class="text-muted">No bookings yet</p>';
            return;
        }

        container.innerHTML = userBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-date">${new Date(booking.scheduleDate).toLocaleDateString()}</div>
                <div class="class-title">${booking.courseTitle}</div>
                <div class="class-trainer">with ${booking.trainer}</div>
                <small class="text-muted">${new Date(booking.scheduleDate).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</small>
                <button class="btn btn-sm btn-outline-danger mt-2" onclick="cancelBooking(${booking.id})">
                    Cancel
                </button>
            </div>
        `).join('');
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const booking = this.bookings.find(b => b.id === bookingId);
            this.bookings = this.bookings.filter(b => b.id !== bookingId);
            this.saveData();
            this.renderMyBookings();
            this.updateDashboardStats();
            this.addActivity(`Cancelled booking: ${booking.courseTitle}`);
        }
    }

    // Course Management
    renderCourses() {
        const container = document.getElementById('coursesList');
        container.innerHTML = this.courses.map(course => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="course-card">
                    <img src="${course.image || 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg'}" 
                         alt="${course.title}" class="course-image">
                    <div class="course-content">
                        <h5 class="course-title">${course.title}</h5>
                        <div class="course-trainer">
                            <i class="fas fa-user-tie me-1"></i>${course.trainer}
                        </div>
                        <p class="course-description">${course.description || 'No description available'}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>${course.duration} min
                            </small>
                            <small class="text-muted">
                                ${course.schedules.length} schedule${course.schedules.length !== 1 ? 's' : ''}
                            </small>
                        </div>
                        <div class="course-schedules">
                            ${course.schedules.slice(0, 3).map(schedule => `
                                <span class="schedule-badge">
                                    ${new Date(schedule).toLocaleDateString()} 
                                    ${new Date(schedule).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            `).join('')}
                            ${course.schedules.length > 3 ? `<span class="schedule-badge">+${course.schedules.length - 3} more</span>` : ''}
                        </div>
                        <div class="mt-3 d-flex gap-2">
                            <button class="btn btn-primary btn-sm" onclick="editCourse(${course.id})">
                                <i class="fas fa-edit me-1"></i>Edit
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCourse(${course.id})">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openCourseModal(courseId = null) {
        this.currentCourseId = courseId;
        const modal = new bootstrap.Modal(document.getElementById('courseModal'));
        const form = document.querySelector('#courseModal form');
        const title = document.getElementById('courseModalTitle');
        
        if (courseId) {
            const course = this.courses.find(c => c.id === courseId);
            title.textContent = 'Edit Course';
            document.getElementById('courseId').value = course.id;
            document.getElementById('courseTitle').value = course.title;
            document.getElementById('courseTrainer').value = course.trainer;
            document.getElementById('courseDescription').value = course.description || '';
            document.getElementById('courseImage').value = course.image || '';
            document.getElementById('courseDuration').value = course.duration || 60;
            
            // Load schedules
            const schedulesContainer = document.getElementById('scheduledDates');
            schedulesContainer.innerHTML = course.schedules.map(schedule => `
                <div class="input-group mb-2">
                    <input type="datetime-local" class="form-control schedule-date" 
                           value="${new Date(schedule).toISOString().slice(0, 16)}">
                    <button type="button" class="btn btn-outline-danger" onclick="removeSchedule(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            title.textContent = 'Add Course';
            form.reset();
            document.getElementById('courseId').value = '';
            document.getElementById('scheduledDates').innerHTML = `
                <div class="input-group mb-2">
                    <input type="datetime-local" class="form-control schedule-date">
                    <button type="button" class="btn btn-outline-danger" onclick="removeSchedule(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
        
        modal.show();
    }

    addSchedule() {
        const container = document.getElementById('scheduledDates');
        const scheduleDiv = document.createElement('div');
        scheduleDiv.className = 'input-group mb-2';
        scheduleDiv.innerHTML = `
            <input type="datetime-local" class="form-control schedule-date">
            <button type="button" class="btn btn-outline-danger" onclick="removeSchedule(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(scheduleDiv);
    }

    removeSchedule(button) {
        if (document.querySelectorAll('.schedule-date').length > 1) {
            button.closest('.input-group').remove();
        } else {
            alert('At least one schedule is required');
        }
    }

    saveCourse(event) {
        event.preventDefault();
        
        const courseId = document.getElementById('courseId').value;
        const title = document.getElementById('courseTitle').value;
        const trainer = document.getElementById('courseTrainer').value;
        const description = document.getElementById('courseDescription').value;
        const image = document.getElementById('courseImage').value;
        const duration = parseInt(document.getElementById('courseDuration').value);
        
        const schedules = Array.from(document.querySelectorAll('.schedule-date'))
            .map(input => input.value)
            .filter(date => date)
            .map(date => new Date(date).toISOString());
        
        if (schedules.length === 0) {
            alert('Please add at least one schedule');
            return;
        }
        
        const course = {
            id: courseId ? parseInt(courseId) : Date.now(),
            title,
            trainer,
            description,
            image: image || 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg',
            duration,
            schedules
        };
        
        if (courseId) {
            const index = this.courses.findIndex(c => c.id === parseInt(courseId));
            this.courses[index] = course;
            this.addActivity(`Updated course: ${title}`);
        } else {
            this.courses.push(course);
            this.addActivity(`Added new course: ${title}`);
        }
        
        this.saveData();
        this.renderCourses();
        this.updateDashboardStats();
        
        bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
    }

    editCourse(courseId) {
        this.openCourseModal(courseId);
    }

    deleteCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            
            // Remove associated bookings
            this.bookings = this.bookings.filter(b => b.courseId !== courseId);
            
            this.saveData();
            this.renderCourses();
            this.updateDashboardStats();
            this.addActivity(`Deleted course: ${course.title}`);
        }
    }

    bindEvents() {
        // Make functions globally available
        window.login = this.login.bind(this);
        window.register = this.register.bind(this);
        window.logout = this.logout.bind(this);
        window.showLogin = this.showLogin.bind(this);
        window.showRegister = this.showRegister.bind(this);
        window.showDashboard = this.showDashboard.bind(this);
        window.showBooking = this.showBooking.bind(this);
        window.showManagement = this.showManagement.bind(this);
        window.selectDate = this.selectDate.bind(this);
        window.changeMonth = this.changeMonth.bind(this);
        window.bookClass = this.bookClass.bind(this);
        window.confirmBooking = this.confirmBooking.bind(this);
        window.cancelBooking = this.cancelBooking.bind(this);
        window.openCourseModal = this.openCourseModal.bind(this);
        window.addSchedule = this.addSchedule.bind(this);
        window.removeSchedule = this.removeSchedule.bind(this);
        window.saveCourse = this.saveCourse.bind(this);
        window.editCourse = this.editCourse.bind(this);
        window.deleteCourse = this.deleteCourse.bind(this);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GymManager();
});