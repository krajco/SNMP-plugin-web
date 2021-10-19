const fs = require('fs');
const { formatWithOptions } = require('util');

class SNMPConfiguration {
    #object_type;
    #object_name;
    #data;
    #configFile = 'agent_config.json';

    constructor() {
        try{
            this.#data = JSON.parse(fs.readFileSync(this.#configFile, 'utf-8'));
        }catch(err) {
            console.log(err);
        }
    }
    getNagiosConfiguration(){
        let configuration = this.#getTablesConfiguration();



    }

    #getTablesConfiguration(){
        let tableOid = '1.3.6.1.3.999.1.';
        let tableIndex = 1; // Mib table
        let tablesConfiguration = [];

        this.#data.tables.forEach(table => {
            let tableConfiguration = {
                name: table.object_name,
                oids: []
            };
            let sensorIndex = 1; // Row in table

            table.sensors.forEach(sensor => {
                let attributeIndex = 1; // Monitoring attribute
                table.attributes.forEach(attr => {
                    if(attr.monitoring)
                        tableConfiguration.oids.push({
                            sensor: attr.attr_name + '_' + sensor,
                            oids: tableOid +tableIndex + '.' + attributeIndex + '.' + sensorIndex
                        })
                        let cmd_name = 'check_' + attr.attr_name + '_' + sensor;
                        let command = `define command{\n\tcommand_name\t\t${cmd_name}\n\tcommand_line $USER1$/check_oid.py -H $HOSTADDRESS$ `
                    attributeIndex++;
                })
                sensorIndex++;
            })
            console.log(tableConfiguration);
            tablesConfiguration.push(tableConfiguration);
            tableIndex++;
        });
        return tablesConfiguration;
    }

    saveMonitoringState(data) {
        let mib_object = JSON.parse(data.mib_object);
        let object_name = mib_object.object_name;
        this.#data.tables.forEach(table => {
            if(table.object_name === object_name){
                table.attributes.forEach(attr => {
                    attr.monitoring = data[attr.attr_name];
                });
            }
        })
    }

    getMibObjects(){
        let tables = this.#objectList('tables');
        let scalars = this.#objectList('scalars');
        return tables.concat(scalars);
    }

    updateConfiguration(raw_data) {
        let configuration = this.#inputParser(raw_data);
        this.#object_type = configuration['object_type'] + 's';
        this.#object_name = configuration['object_name']

        if(this.#objectExists(configuration)){
            this.#update(configuration);
        }else{
            this.#create(configuration);
        }
    }

    addSensor(raw_data) {
        let mib_object = raw_data['mib_object']; // TODO opravit nazvy

        let keys = Object.keys(raw_data)
        let sensors = [];
        for(let i = 1; i < keys.length; i++)
            sensors.push(raw_data[keys[i]])

        let data = JSON.parse(mib_object)

        this.#addSensorToObject(data.object_name, sensors);
    }

    #addSensorToObject(object_name, sensors) {
        let object_type = this.#getMibObjectType(object_name);
        console.log(object_type);
        let list = this.#data[object_type];

        for(let i = 0; list[i]; i++) {
            if(list[i]['object_name'] === object_name) {
                console.log(sensors);
                list[i]['sensors'] = sensors;
            }
        }
        this.#data[object_type] = list;
    }


    #getMibObjectType(object_name) {
        let tables = this.#objectList('tables');
        for(let i = 0; i < tables.length; i++) {
            if(tables[i]['object_name'] === object_name)
                return 'tables';
        }
        return 'scalars';
    }


    #objectList(type) {
        let list = this.#data[type];
        let data = [];

        list.forEach(item => {
            data.push({
                object_name: item.object_name,
                attributes: item.attributes,
                sensors: item.sensors
            });
        })
        return data;
    }

    #objectExists(){
        let list = this.#data[this.#object_type];
        for(let i = 0; ; i++){
            if(!list[i])
                return false;

            if(list[i]['object_name'] === this.#object_name)
                return true;
        }
    }

    #update(data){
        let list = this.#data[this.#object_type];
        for(let i = 0; i < list.length; i++){
            if(list[i]['object_name'] === this.#object_name){
                list[i] = data;
                break;
            }
        }

        this.#data[this.#object_type] = list;
    }

    #create(data){
        this.#data[this.#object_type].push(data);
    }

    #inputParser(input){
        let output = {
            object_type: input['object_type'],
            object_name: input['object_name'],
            attributes: [],
            sensors:[],
        }

        for(let i = 1; ; i++){
            let mib_attr = 'mib_attr_' + i;
            let mib_attr_type = 'mib_attr_type_' + i;
            if(!input.hasOwnProperty(mib_attr))
                break;

            output['attributes'].push({attr_name: input[mib_attr], attr_type: input[mib_attr_type], monitoring: 0});
        }

        return output;
    }

    saveConfiguration(){
        fs.writeFileSync(this.#configFile, JSON.stringify(this.#data, null, 4), 'utf-8');
    }

    printConfiguration(){
        console.log(JSON.stringify(this.#data, null, 4));
    }
}

module.exports.SNMPConfiguration = SNMPConfiguration