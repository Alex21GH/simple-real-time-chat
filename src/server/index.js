const express = require('express');
const os = require('os');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- INICIO DE LA MODIFICACIÓN ---

// Construye la ruta a la carpeta 'build' del cliente.
// Esta es la línea más importante a verificar.
// Asume que la estructura es: root/client/build y root/server/index.js
const clientBuildPath = path.join(__dirname, '..','..', 'dist');
console.log(`Sirviendo archivos estáticos desde: ${clientBuildPath}`);

// Servir la carpeta de build de React
app.use(express.static(clientBuildPath));

// API de ejemplo (aunque ya no se usa para usuario)
app.get('/api/getUsername', (req, res) => {
  res.json({ username: os.userInfo().username });
});

// En todas las demás rutas, servir el index de React
app.get('*', (req, res) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  console.log(`Intentando servir el archivo: ${indexPath}`);
  res.sendFile(indexPath);
});

// --- FIN DE LA MODIFICACIÓN ---


// Lógica de Socket.IO (con las correcciones de sintaxis de la vez anterior)
io.on('connection', socket => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join', username => {
    socket.username = username;
    socket.broadcast.emit('message', {
      user: 'Sistema',
      text: `${username} se ha unido al chat.`,
      time: Date.now()
    });
  });

  socket.on('message', msg => {
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('message', {
        user: 'Sistema',
        text: `${socket.username} se ha ido.`,
        time: Date.now()
      });
    }
    console.log('Cliente desconectado:', socket.id);
  });
});

// Levantar servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`¡Servidor escuchando en el puerto ${PORT}!`)
);