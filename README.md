# Student Attendance Management System

An interactive, responsive student attendance dashboard built with HTML, CSS and JavaScript.

## Features

- Dashboard with attendance percentage, present/absent/late counts
- Student directory with search and class filtering
- Mark attendance as Present, Absent or Late
- Date-based attendance records
- Attendance trend chart made with CSS/SVG
- Add new students
- Export attendance as CSV
- Dark mode
- LocalStorage persistence
- Responsive design for mobile and desktop

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Project structure

```text
student-attendance-management-system/
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

The demo stores data in the browser's LocalStorage. It is suitable as a frontend project/demo and can later be connected to MongoDB or another database.
