# Github User Finder

Allows you to search Github users and repos. A frontend project with improved UI effects, animations, logical conditions, styles, keyboard handling, error and loading handling, and responsive UI, that is optimized for mobile view.

### Challenge & Solution

Building a real-time search interface for external APIs, such as GitHub's user data, presents a significant technical challenge in terms of performance and user experience. Developers often struggle with managing excessive API requests, handling complex asynchronous side effects, and ensuring UI responsiveness across various devices. Furthermore, providing immediate feedback during network delays or errors, while maintaining full accessibility—including keyboard navigation—can easily result in convoluted, hard-to-maintain code.
To overcome these obstacles, this application is engineered using a robust technical foundation centered around React and TypeScript. This combination provides a predictable, component-driven architecture with strong type safety, significantly reducing runtime errors. We integrated Redux for centralized state management, allowing consistent data flow, while leveraging React Hooks to cleanly decouple UI components from the underlying business logic and API interactions.
For optimal performance and a polished user experience, we implemented strategic debouncing mechanisms to throttle API calls during fast typing, preventing rate-limit exhaustion. The interface is meticulously crafted with Material UI, ensuring a modern, mobile-optimized, and highly responsive design. Additionally, by introducing comprehensive keyboard handling, robust error and loading state management, and rigorous testing, we delivered a resilient application that guarantees a seamless experience.

### Tech Stack
This project is built using the following tech stack:
- React
- TypeScript
- Material UI
- Redux
- Hooks
- Debouncing

### Features
This project comes with the following features:
- Loads 5 github users as we typing and shows their repositories
- Improved UI effects and animations
- Logical conditions that enhance user experience
- Improved styles that make the UI look sleek and modern
- Keyboard handling that enables users to use shortcuts for common actions
- Error and loading handling that give users feedback on what's happening in the background
- Responsive UI that adapts to different screen sizes, including mobile devices
- Unit and integration tests to ensure quality and stability of the project

### Deployment
This project is deployed and monitored using Checkly, a Vercel monitoring platform. This ensures that the project is always available and performing optimally.

### Getting Started
To get started with this project, follow these steps:
- Clone this repository: `git clone https://github.com/prog-ops/mygithub_user_repos.git`
- Install dependencies: `npm install`
- Start the development server: `npm run start`
- Open your browser and go to `http://localhost:3000`

### Testing
To run the tests, use the following command: `npm run test`. This will run both unit and integration tests and provide you with feedback on the quality and stability of the project.
