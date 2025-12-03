const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
    // Manejo de rutas
    let filePath;
    
    if (req.url === '/') {
        filePath = path.join(__dirname, 'index.html');
    } else if (req.url.startsWith('/assets/apk/')) {
        // Ruta a la APK en la carpeta www
        filePath = path.join(__dirname, 'www', req.url);
    } else {
        filePath = path.join(__dirname, req.url);
    }

    // Leer archivo
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`❌ 404: ${req.url}`);
            res.writeHead(404);
            res.end('404 - No encontrado');
            return;
        }

        // Determinar Content-Type
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        
        switch(ext) {
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.apk':
                contentType = 'application/vnd.android.package-archive';
                res.setHeader('Content-Disposition', 'attachment; filename="app-debug.apk"');
                break;
            case '.json':
                contentType = 'application/json';
                break;
        }

        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(data);
        console.log(`✅ ${req.url}`);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    console.log(`✅ Accede a: http://localhost:${PORT}`);
});
