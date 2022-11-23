/**
 * Required External Modules
 */
const express = require('express');
const path = require('path');
const bent = require('bent');
const fs = require('fs');
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const agent_config = require('./agent_config');


/**
 * App Variables
 */
const app = express();
const router = express.Router();
const port = process.env.PORT || '8099';
const agent_updater = new agent_config.SNMPConfiguration()

/**
 *  App Configuration
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

/**
 * Routes Definitions
 */

app.get('/', urlencodedParser, (req, res) => {
    let data = bent({'Authorization': 'Bearer '+ token}, 'json')(`https://localhost/api/states`);

    // const data = bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states`);

    data.then((data) => {
        res.render('new_mib_object', {sensors: data});
    });
});

app.get('/new_mib_object', urlencodedParser, (req, res) => {
    // const data = bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states`);
    let data = bent({'Authorization': 'Bearer '+ token}, 'json')(`https://ha.nesad.fit.vutbr.cz/api/states`);

    data.then((data) => {
        res.render('new_mib_object', {sensors: data});
    });
});

app.post('/new_mib_object', urlencodedParser, (req, res) => {
    // const data = bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states`);
    let data = bent({'Authorization': 'Bearer '+ token}, 'json')(`https://ha.nesad.fit.vutbr.cz/api/states`);


    agent_updater.updateConfiguration(req.body);
    agent_updater.printConfiguration();
    agent_updater.saveConfiguration();

    res.json(req.body);

    data.then((data) => {
        res.render('new_mib_object', {sensors: data, result: 'Success'});
    });
});

app.get('/config_mib_object', urlencodedParser, (req, res) => {
    // const data = bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states`);
    let data = bent({'Authorization': 'Bearer '+ token}, 'json')(`https://ha.nesad.fit.vutbr.cz/api/states`);

    let mibObjects = agent_updater.getMibObjects();

    data.then((data) => {
        res.render('config_mib_object', {mibObjects: mibObjects, sensors: data});
    });
});

app.post('/config_mib_object', urlencodedParser, (req, res) => {
    // const data = bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states`);
    let data = bent({'Authorization': 'Bearer '+ token}, 'json')(`https://ha.nesad.fit.vutbr.cz/api/states`);

    let mibObjects = agent_updater.getMibObjects();

    console.log(req.body)

    agent_updater.addSensor(req.body);
    agent_updater.printConfiguration();
    agent_updater.saveConfiguration();

    res.json({body: req.body});

    data.then((data) => {
        res.render('config_mib_object', {mibObjects: mibObjects, sensors: data});
    });
});

app.get('/nagios_config', urlencodedParser, (req, res) => {
    agent_updater.calcNagiosConfiguration()
    let config = agent_updater.getTablesConfiguration();
    res.render('nagios_config', {configs: config});
});

app.post('/nagios_config', urlencodedParser, (req, res) => {
    let nagios_config = agent_updater.getNagiosServices(req.body);
    res.render('nagios_serv', {config: nagios_config});
});

app.get('/mib_config', urlencodedParser, (req, res) => {
    let config = 'Mib World';
    res.render('mib_config', {config: config});
});

app.get('/monitoring', urlencodedParser, (req, res) => {
    let mibObjects = agent_updater.getMibObjects();

    res.render('monitoring', {mibObjects: mibObjects});
});

app.post('/monitoring', urlencodedParser, (req, res) => {
    agent_updater.saveMonitoringState(req.body)
    agent_updater.saveConfiguration();
    res.json({body: req.body});
});

/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
