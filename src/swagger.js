import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
    definition: {
        openapi: "3.0.0",
        info: { 
            title: "Ausbildung API", 
            version: "1.0.0",
            description: "API para la aplicación de gestión de prácticas profesionales entre empresas, estudiantes y centros de estudio"
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor de desarrollo"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        'src/routes/*.js', 
        'src/models/*.js',
        'src/controllers/*.js',
        'src/swagger-docs.js'
    ]
}

//Docs en JSON format

const swaggerSpec = swaggerJSDoc(options)

//Function to setup our docs
const swaggerDocs = (app,port) => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    } )
    console.log('Documentacion de API en: /api/docs')
}

export default swaggerDocs