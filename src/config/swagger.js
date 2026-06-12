import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NewHaven Psychic CMS API',
      version: '1.0.0',
      description: 'API documentation for NewHaven Psychic CMS Backend'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Auth' },
      { name: 'Hero' },
      { name: 'About' },
      { name: 'Services' },
      { name: 'Testimonials' },
      { name: 'Contact' },
      { name: 'Bookings' },
      { name: 'Navbar' },
      { name: 'Footer' },
      { name: 'Settings' },
      { name: 'Upload' }
    ]
  },
  apis: ['./src/modules/**/*.routes.js'] // Path to route files with swagger annotations
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
