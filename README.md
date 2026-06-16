# HR Management System

A modern, browser-based Human Resources Management System built with vanilla HTML, CSS, and JavaScript.

## Features

- **Dashboard**: Overview of employee stats, department counts, and recent activity
- **Employee Management**: Add, edit, delete, and search employees
- **Department Management**: Create and manage departments
- **Attendance Tracking**: Record and view daily attendance
- **Leave Management**: Submit and approve/reject leave requests

## Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application entry point
│   ├── modules/
│   │   ├── employee.js     # Employee management module
│   │   ├── department.js   # Department management module
│   │   ├── attendance.js   # Attendance tracking module
│   │   ├── leave.js        # Leave management module
│   │   ├── dashboard.js    # Dashboard statistics module
│   │   └── storage.js      # LocalStorage persistence layer
│   └── utils/
│       ├── validator.js    # Input validation utilities
│       ├── formatter.js    # Data formatting utilities
│       └── dateUtils.js    # Date manipulation utilities
├── tests/
│   ├── employee.test.js    # Employee module tests
│   ├── department.test.js  # Department module tests
│   ├── attendance.test.js  # Attendance module tests
│   ├── leave.test.js       # Leave module tests
│   ├── dashboard.test.js   # Dashboard module tests
│   ├── storage.test.js     # Storage module tests
│   ├── validator.test.js   # Validator tests
│   ├── formatter.test.js   # Formatter tests
│   └── dateUtils.test.js   # Date utilities tests
├── package.json            # Project config & test scripts
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Open `index.html` in a browser, or run a dev server:
   ```bash
   npx http-server . -p 8080
   ```

## Running Tests

```bash
npm test
```

For coverage report:

```bash
npm run test:coverage
```

## License

MIT
