# AERO - Space Mission Management Frontend

A futuristic frontend interface for the AERO space mission management system, built with React and Vite.

## Features

- **Dark Futuristic Theme**: Inspired by space-age design with glowing blue/purple accents
- **Mission Management**: Create, view, and manage space missions
- **Astronaut Management**: Add and track astronauts in the system
- **Launch Vehicle Management**: Register and manage launch vehicles
- **Launch Tracking**: Monitor all launches and their statuses
- **Responsive Design**: Modern, clean UI with smooth animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://127.0.0.1:3200`

### Installation

1. Navigate to the project-frontend directory:
```bash
cd project-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
project-frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Auth.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── Missions/
│   │   │   ├── Missions.jsx
│   │   │   └── Missions.css
│   │   ├── Astronauts/
│   │   │   ├── Astronauts.jsx
│   │   │   └── Astronauts.css
│   │   ├── LaunchVehicles/
│   │   │   ├── LaunchVehicles.jsx
│   │   │   └── LaunchVehicles.css
│   │   ├── Launches/
│   │   │   ├── Launches.jsx
│   │   │   └── Launches.css
│   │   └── Layout/
│   │       ├── Navbar.jsx
│   │       └── Navbar.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Integration

The frontend connects to the backend API running on `http://127.0.0.1:3200`. All API calls use the `controlUserSessionId` header for authentication.

### Available Endpoints Used

- Authentication: `/v1/admin/auth/login`, `/v1/admin/auth/register`, `/v1/admin/auth/logout`
- Missions: `/v1/admin/mission/list`, `/v1/admin/mission`, `/v1/admin/mission/:missionid`
- Astronauts: `/v1/admin/astronaut/pool`, `/v1/admin/astronaut`, `/v1/admin/astronaut/:astronautid`
- Launch Vehicles: `/v1/admin/launchvehicle/list`, `/v1/admin/launchvehicle`, `/v1/admin/launchvehicle/:launchvehicleid`
- Launches: `/v1/admin/launch/list`

## Design Features

- **Grid Background**: Subtle grid pattern overlay for a technical, digital feel
- **Glowing Effects**: Blue and purple glow effects on interactive elements
- **Card-based Layout**: Clean, organized information display
- **Smooth Animations**: Hover effects and transitions throughout
- **Modern Typography**: Clean, readable fonts with proper spacing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the AERO space mission management system.

