const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const multer = require('multer');

const fs = require('fs');

const template = fs.readFileSync('template.html').toString();

const {
    createValidator,
    updateValidator,
    userValidator,
    userUpdateValidator
} = require('./valfunctions');


const upload = multer({dest: 'uploads/'});

const port = 8000;

let devices = [];

let users = [];

function saveDataToJSON() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('devices.json', JSON.stringify(devices, null, 2));
}

// Зчитування даних з файлів JSON під час запуску сервера
if (fs.existsSync('users.json')) {
    const usersData = fs.readFileSync('users.json');
    users = JSON.parse(usersData);
}

if (fs.existsSync('devices.json')) {
    const devicesData = fs.readFileSync('devices.json');
    devices = JSON.parse(devicesData);
}

app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/images', express.static('uploads'));

//Devices

app.get('/devices', (req, res) => {
    res.status(200).send(devices);
});
app.get('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const device = devices.find(device => device.id == deviceId);
    if (!device) {
        res.sendStatus(404);
    } else {
        res.status(200).json(device);
    }
});

app.post('/devices', (req, res) => {
    if (createValidator(req.body)) {
        const newDevice = req.body;
        newDevice.id = devices.length + 1;
        devices.push(newDevice);
        saveDataToJSON();
        res.status(201).json({ id: newDevice.id });
    } else {
        res.sendStatus(400);
    }
});

app.put('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    if (updateValidator(req.body)) {
        const deviceIndex = devices.findIndex(device => device.id == deviceId);
        if (deviceIndex === -1) {
            res.sendStatus(404);
        } else {
            devices[deviceIndex] = { ...devices[deviceIndex], ...req.body };
            saveDataToJSON();
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(400);
    }
});

app.delete('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const deviceIndex = devices.findIndex(device => device.id == deviceId);
    if (deviceIndex === -1) {
        res.sendStatus(404);
    } else {
        devices.splice(deviceIndex, 1);
        saveDataToJSON();
        res.sendStatus(200);
    }
});

app.put('/devices/:id/assign', (req, res) => {
    const deviceId = req.params.id;
    const device = devices.find(device => device.id == deviceId);
    if (!device) {
        res.sendStatus(404);
    } else if (device.assigned_to) {
        res.sendStatus(400).json({ error: 'Device already assigned' });
    } else {
        device.assigned_to = req.body.username;
        saveDataToJSON();
        res.sendStatus(200);
    }
});

app.put('/devices/:id/unassign', (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.id);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        if (temp[0].assigned_to != null) {
            temp[0].assigned_to = null;
            saveDataToJSON();
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    }
});

app.post('/devices/:id/image', upload.single('image'), (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.id);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        temp[0].image_path = req.file.filename;
        saveDataToJSON();
        res.sendStatus(200);
    }
});


app.put('/devices/:id/image', upload.single('image'), (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.id);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        temp[0].image_path = req.file.filename;
        saveDataToJSON();
        res.sendStatus(200);
    }
});

app.get('/devices/:id/image', (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.id);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        if (temp[0].image_path != null) {
            res.send(template.replace('{%image_path}', temp[0].image_path).replace('image_mimetype'));
        } else {
            res.sendStatus(404);
        }
    }
});

//Users

app.get('/users', (req, res) => {
    res.status(200).send(users);
});

app.post('/users', (req, res) => {
    if (userValidator(req.body)) {
        const { username } = req.body;
        if (users.some(user => user.username === username)) {
            res.status(409).json({ error: 'User already exists' });
        } else {
            users.push(req.body);
            saveDataToJSON();
            res.status(201).json({ username });
        }
    } else {
        res.status(400).json({ error: 'Bad JSON data' });
    }
});



app.get('/users/:username', (req, res) => {
    const { username } = req.params;
    const user = users.find(user => user.username === username);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    } else {
        res.status(200).json(user);
    }
});

app.put('/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        if (userUpdateValidator(req.body)) {
            users[userIndex] = { ...users[userIndex], ...req.body };
            saveDataToJSON();
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            res.status(400).json({ error: 'Bad JSON data' });
        }
    }
});

app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        users.splice(userIndex, 1);
        saveDataToJSON();
        res.status(200).json({ message: 'User deleted successfully' });
    }
});

app.get('/users/:username/devices', (req, res) => {
    const { username } = req.params;
    const userDevices = devices.filter(device => device.assigned_to === username);
    if (userDevices.length === 0) {
        res.status(404).json({ message: 'No devices found for this user' });
    } else {
        res.status(200).json(userDevices);
    }
});

app.listen(port, () => {
    console.log('http://localhost:' + port + '/api-docs');
});