import fs from 'fs'
import path from 'path'
import morgan from 'morgan'
import 'dotenv/config'

//Inicializa morgan para registrar solicitudes
const logDirectory = path.join(process.cwd(), 'src', 'logs'); // Directorio de registros
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true }); // Crear el directorio si no existe
}

const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
// Token personalizado para Morgan con la zona horaria configurada en `.env`
morgan.token('custom-date', (req, res) => {
    return new Date().toLocaleString('es-ES', { timeZone: process.env.TZ });
});

const loggerFormat = '[:custom-date] :method :url :status :res[content-length] - :response-time ms - :user-agent';
const morgan_dev_log = morgan('dev')
const morgan_file_access = morgan(loggerFormat, { stream: accessLogStream })

export { morgan_dev_log, morgan_file_access }

