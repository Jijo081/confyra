# Confyra - Conference Management System

Confyra is a web-based Conference Management System developed to simplify the management of research paper submissions, paper reviews, and conference meetings.

The system provides separate access for Authors and Administrators. Authors can submit research papers, upload documents, track submission status, and view meetings. Administrators can review submitted papers, accept or reject submissions, and manage conference meetings.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
  - [Author Features](#author-features)
  - [Administrator Features](#administrator-features)
- [Paper Submission](#paper-submission)
- [Meeting Management](#meeting-management)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database](#database)
- [Application Workflow](#application-workflow)
- [Screenshots](#screenshots)
- [Installation and Setup](#installation-and-setup)
- [How to Run](#how-to-run)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)
- [Learning Outcomes](#learning-outcomes)
- [Project Information](#project-information)
- [License](#license)

---

## Project Overview

Conference management involves several activities such as user registration, research paper submission, paper review, conference scheduling, and meeting management.

Confyra brings these activities together into a single web application.

The system is designed with two main user roles:

- Author
- Administrator

Authors are responsible for submitting research papers and tracking their status.

Administrators are responsible for reviewing papers and managing conference meetings.

---

## Features

### Author Features

Authors can perform the following operations:

- Register a new account
- Log in using their registered credentials
- Access the author dashboard
- Submit research papers
- Upload paper documents
- View submitted papers
- Track paper submission status
- View paper details
- View available conference meetings
- Join available meetings
- View reports
- Change account password
- Log out from the application

---

### Administrator Features

Administrators have additional management capabilities:

- Log in to the administrator dashboard
- View submitted research papers
- Review submitted papers
- Accept research paper submissions
- Reject research paper submissions
- Create instant meetings
- Schedule future meetings
- Add meeting links
- View conference meetings
- View reports
- Manage account settings
- Change account password
- Log out from the application

---

## Paper Submission

The paper submission module allows authors to submit their research work through the system.

An author provides the following information:

- Paper title
- Paper abstract
- Research paper document

After submission, the paper is initially assigned a `Pending` status.

The administrator can then review the submission and update its status.

### Paper Status

The system supports three paper statuses:

| Status | Description |
|--------|-------------|
| Pending | Paper is waiting for administrator review |
| Accepted | Paper has been accepted |
| Rejected | Paper has been rejected |

### Submission Process

```text
Author Login
      |
      v
Submit Research Paper
      |
      v
Paper Status: Pending
      |
      v
Administrator Review
      |
      +----------------------+
      |                      |
      v                      v
   Accepted              Rejected

Authors can view the current status of their submissions from the dashboard.

Meeting Management

Confyra provides meeting management functionality for conference administrators.

There are two types of meetings available.

Instant Meeting

Administrators can create an instant meeting directly from the Meeting section.

When an instant meeting is created:

The administrator selects the Create Meeting option.
The system creates a meeting entry.
A meeting room link is generated.
The meeting appears in the meeting list.
Users can use the Join option to open the meeting room.
Scheduled Meeting

Administrators can schedule a meeting for a future date and time.

The following information is required:

Meeting topic
Date and time
Meeting link

The scheduled meeting is then displayed in the meetings section.

Meeting Room

Confyra includes a meeting room interface for demonstration purposes.

The current version provides the meeting room interface and meeting navigation, but real-time audio and video communication using WebRTC has not been implemented.

User Roles

Confyra uses two primary roles.

Role	Main Responsibilities
Author	Submit papers, track submissions, view meetings and reports
Administrator	Review papers, manage submissions and manage meetings
Technology Stack
Frontend
HTML5
CSS3
JavaScript
Font Awesome
Google Fonts
Backend
Python
Flask
Flask-CORS
Database
SQLite
Development Tools
Visual Studio Code
Git
GitHub
Project Structure
Confyra/
│
├── .gitignore
├── .vscode/
│   └── settings.json
│
├── app.py
├── index.html
├── script.js
├── styles.css
├── requirements.txt
│
├── conference_bg.png
└── dashboard_bg.png
File Description
File	Description
app.py	Flask backend, API routes, authentication and database operations
index.html	Main HTML structure and application interface
script.js	Frontend logic, API requests and user interactions
styles.css	Styling, layout, forms, dashboard and responsive interface
requirements.txt	Python package dependencies
conference_bg.png	Conference background image
dashboard_bg.png	Dashboard background image
.gitignore	Files and folders excluded from Git
Database

Confyra uses SQLite for local data storage.

The database is automatically created when the Flask application starts.

The database contains information related to:

Users
Research papers
Paper submission status
Meetings
Meeting links

The local SQLite database file is excluded from GitHub using .gitignore.

Application Workflow
Author Workflow
Register
   |
   v
Login
   |
   v
Author Dashboard
   |
   +----------------------+
   |                      |
   v                      v
Submit Paper          View Papers
   |                      |
   v                      v
Pending Status       Track Status
                          |
                          v
                    View Meetings
                          |
                          v
                     Join Meeting
Administrator Workflow
Login
   |
   v
Administrator Dashboard
   |
   +----------------------+
   |                      |
   v                      v
View Papers          Manage Meetings
   |                      |
   v                      +------------------+
Review Paper              |                  |
   |                      v                  v
   +----------+       Instant            Scheduled
   |          |       Meeting             Meeting
   v          v
Accept     Reject
Screenshots

Screenshots can be added to this section to demonstrate the main features of Confyra.

Create a folder named:

screenshots/

Then place the application screenshots inside it.

Recommended screenshot structure:

screenshots/
│
├── login.png
├── author-dashboard.png
├── paper-submission.png
├── admin-dashboard.png
├── paper-review.png
├── meetings.png
├── schedule-meeting.png
├── meeting-room.png
├── reports.png
└── settings.png
Login Page

Author Dashboard

Paper Submission

Administrator Dashboard

Paper Review

Meeting Management

Schedule Meeting

Meeting Room

Reports

Settings

Installation and Setup

Follow the steps below to run Confyra on a local computer.

Prerequisites

Make sure the following software is installed:

Python 3
Git
Visual Studio Code
A modern web browser
Clone the Repository

Open a terminal and run:

git clone https://github.com/Jijo081/confyra.git

Move into the project directory:

cd confyra
Create a Virtual Environment

For Windows:

python -m venv venv

Activate the virtual environment:

venv\Scripts\activate
Install Dependencies

Install the required Python packages using:

pip install -r requirements.txt

The main dependencies are:

Flask
Flask-CORS
How to Run

Start the Flask application:

python app.py

The application will start on the local Flask server.

Open a web browser and visit:

http://127.0.0.1:5000

The SQLite database will be created automatically when the application is started.

Application Sections

The Confyra dashboard contains several sections.

Dashboard

Provides an overview of the user's conference activities.

Inbox

Provides access to received and sent communication.

Calendar

Provides a section for conference-related scheduling.

Jobs

Provides the jobs section available in the dashboard interface.

Candidates

Provides the candidates section available in the dashboard interface.

Reports

Displays conference-related report information.

Settings

Allows users to manage account-related settings, including password changes.

Meetings

Provides access to instant and scheduled conference meetings.

Current Limitations

The current version of Confyra is primarily developed for academic and portfolio purposes.

The following features are not fully implemented:

Password hashing
Session-based authentication
Email notifications
Dedicated reviewer management
Advanced paper search and filtering
Real-time video and audio communication
WebRTC integration
Cloud-based document storage
Advanced analytics
Production deployment configuration
Future Improvements

The project can be extended with the following features:

Authentication
Secure password hashing
Session-based authentication
Token-based authentication
Improved access control
Paper Management
Reviewer assignment
Multiple reviewers
Paper search and filtering
Review comments
Review history
Automated email notifications
Meeting Management
Real-time video conferencing
WebRTC integration
Screen sharing
Audio controls
Participant management
Calendar integration
Storage
Cloud-based paper storage
Secure document access
File size and type validation
Analytics
Conference statistics
Paper submission statistics
Acceptance and rejection analysis
Meeting participation statistics
Deployment
Cloud deployment
Production database
HTTPS configuration
Environment-based configuration
Learning Outcomes

Developing Confyra provided practical experience in several areas of software development.

Web Development
HTML structure
CSS styling
JavaScript programming
Frontend and backend integration
Backend Development
Python programming
Flask application development
REST API creation
Request and response handling
Database Management
SQLite
Database tables
SQL queries
CRUD operations
Application Development
User registration
Login functionality
Role-based workflows
File uploads
Paper submission
Meeting management
Version Control
Git
GitHub
Repository management
Branch management
Commit and push workflow
Project Information

Project Name: Confyra

Project Type: Conference Management System

Development Type: Academic / Portfolio Project

Frontend: HTML, CSS, JavaScript

Backend: Python Flask

Database: SQLite

Version Control: Git and GitHub

GitHub Repository

The complete project source code is available on GitHub.

Repository:

https://github.com/Jijo081/confyra

Developer

Jijo

Computer Science and Engineering Student

GitHub:

https://github.com/Jijo081

License

This project was developed for academic and portfolio purposes.