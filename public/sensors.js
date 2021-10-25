class SwapElements {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    reload() {
        this.#clear();

        let data = JSON.parse(document.getElementById('mib_objects').value);
        let right_list = document.getElementById(this.#right);
        let left_list = document.getElementById(this.#left);

        let last_index = parseInt(left_list.lastChild.id.replace('sensor_', '')) + 1;

        console.log(last_index)

        for(let i = last_index; i <  last_index + data.sensors.length; i++) {
            let id = 'sensor_' + i;
            let value = data.sensors[i - last_index];
            let item = createHTMLElement('input',['list-group-item'], [['id',id], ['onclick','swaper.swap(this.id, "unUsedList")'], ['name', id], ['value', value] ]);
            right_list.appendChild(item);
            this.#hideElement(value);
        }
    }

    makeSwap(id) {
        let node = document.getElementById(id);
        let clone = node.cloneNode(true);
        node.style.visibility = 'collapse';
        
        clone.setAttribute('name', id);


        let right_list = document.getElementById(this.#right);
        right_list.appendChild(clone);
    }

    #clear() {
        let right_list = document.getElementById(this.#right);
        while(right_list.lastChild) {
            right_list.removeChild(right_list.lastChild);
        }
    }


    #hideElement(name) {
        let nodes = document.getElementById(this.#left).childNodes;
        for(let i = 0; i < nodes.length; i++) {
            if(nodes[i].style.visibility === 'collapse') {
                nodes[i].style.visibility = 'visible';
            }

            if(nodes[i].value === name){
                nodes[i].style.visibility = 'collapse';
            }
        }
    }

}

let swaper = new SwapElements('unUsedList', 'usedList');

function reloadSensors() {
    removeRows('form_mib_objects')
    let data = document.getElementById('types').value;
    data = JSON.parse(data);

    jsonConversion(data);
}


function reloadMIBObjects() {
    let data = JSON.parse(document.getElementById('mib_objects').value);
    let list = document.getElementById('usedList');

    removeRows('usedList');

    let last_unsued_id = document.getElementById('unUsedList').lastChild.id.replace('sensor_', '');

    for(let i = parseInt(last_unsued_id); i < data['sensors'].length; i++) {
        let id = 'unUsedSensor_' + i + '_cln';
        let item = createHTMLElement('input',['form-control'], [['id',id], ['onclick','changeSensorPosition(this.id, "unUsedList")'], ['name', id], ['value', data['sensors'][i]] ])
        item.innerHTML = data['sensors'][i];
        list.appendChild(item);
    }
}

function removeRows(node){
    let parent = document.getElementById(node);

    let last;
    while((last = parent.lastChild)){
        last.parentElement.removeChild(last);
    }
}


function jsonConversion(json, context = '') {
    let list = [];
    for(key in json){
        if(typeof json[key] === 'object' && json[key]){
            let innerList = jsonConversion(json[key], key + '_');
            list = list.concat(innerList);
        }else {
            newElementMibObject(context + key, typeof json[key])
            let data = {
                key: context + key,
                type: typeof json[key]
            }
            list.push(data);
        }
    }
    return list;
}

function createHTMLElement(type, classes, attributes = []) {
    let element = document.createElement(type);
    for(let i = 0; i < classes.length; i++) {
        element.classList.add(classes[i]);
    }

    for(let i = 0; i < attributes.length; i++) {
        element.setAttribute(attributes[i][0], attributes[i][1]);
    }

    return element;
}


let elements = 0;
function newElementMibObject(attribute, type){
    elements++;

    let form = document.getElementById('form_mib_objects');

    let div_row = createHTMLElement('div',['form-group', 'row'],[['id','mib_row_' + elements]]);

    let div_col1 = createHTMLElement('div', ['col'], []);
    let div_col2 = createHTMLElement('div', ['col'], []);
    let div_col3 = createHTMLElement('div', ['col'], []);
    
    let input = createHTMLElement('input', ['form-control'], [['placeholder', 'Attribute name'],['name', 'mib_attr_' + elements]]);
    input.value = attribute;

    let select = createHTMLElement('select', ['form-control'], [['id', 'mib_object_select_' + (elements)], ['name', 'mib_attr_type_' + elements]])

    let opt1 = createHTMLElement('option', [], [['value', 'string']]);
    let opt2 = createHTMLElement('option', [], [['value', 'number']]);
    let opt3 = createHTMLElement('option', [], [['value', 'boolean']]);
    opt1.innerHTML = 'String';
    opt2.innerHTML = 'Number';
    opt3.innerHTML = 'Boolean';

    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    select.value = type;
    

    let removeButton = createHTMLElement('button', ['btn', 'btn-danger'],
     [
         ['id','mib_object_remove_' + (elements)],
         ['onclick', 'removeMibElement(this.id)']
    ])
    removeButton.innerHTML = 'Remove';

    div_col1.appendChild(input);
    div_col2.appendChild(select);
    div_col3.appendChild(removeButton);

    div_row.appendChild(div_col1);
    div_row.appendChild(div_col2);
    div_row.appendChild(div_col3);

    form.appendChild(div_row);
}

function removeMibElement(id) {
    let number = id.replace('mib_object_remove_','')
    let row_id = 'mib_row_' + number;

    let row = document.getElementById(row_id);
    row.parentElement.removeChild(row);
}

function changeSensorPosition(sensor_id, destination) {
    let sensor = document.getElementById(sensor_id);
    let clone = sensor.cloneNode(true);
    clone.setAttribute('onclick', 'revertSensorPosition(this.id)')
    clone.setAttribute('id', sensor_id + '_cln')
    clone.setAttribute('name', sensor_id + '_cln')

    sensor.style.visibility = "collapse";
    document.getElementById(destination).appendChild(clone);
}

function revertSensorPosition(sensor_id) {
    let original_id = sensor_id.replace('_cln', '');
    document.getElementById(original_id).style.visibility = 'visible'

    let sensor = document.getElementById(sensor_id);
    sensor.parentElement.removeChild(sensor);
}

function findSensor() {
    let input = document.getElementById('myInput');

    let ul = document.getElementById('unUsedList');
    ul.childNodes.forEach(node => {
        if(node.value.indexOf(input.value) !== -1){
            node.style.visibility = 'visible'
        }else {
            console.log('Hide ' + node.value)
            node.style.visibility = 'collapse'
        }
    });
}

// .input-group.mb-3
// label.input-group-text(for='inputGroupSelect01') Options
// select#inputGroupSelect01.form-select
// option(value='0') Disabled
// option(value='1') Enabled
// div.row
function showAttributes() {
    let input = document.getElementById('monitoring_select');
    let ul  = document.getElementById('monitoring_list');
    let lis = ul.childNodes;

    lis.forEach(li => {
        ul.removeChild(li);
    })

    let data = JSON.parse(input.value);

    let index = 1;
    data.attributes.forEach(item => {
        let div = createHTMLElement('div', ['input-group', 'mb-3'],[])
        let label = createHTMLElement('label', ['input-group-text'], [])
        label.innerHTML = item.attr_name;

        let select = createHTMLElement('select', ['form-select'], [['name', item.attr_name]]);
        let opt1 = createHTMLElement('option', [],[['value', 0]]);
        opt1.innerHTML = 'Disabled';
        let opt2 = createHTMLElement('option', [],[['value', 1]]);
        opt2.innerHTML = 'Enabled';
        select.appendChild(opt1)
        select.appendChild(opt2)

        div.appendChild(label)
        div.appendChild(select)
        ul.appendChild(div);
        index++;
    });
}

function showMonitoring(){
    let input = document.getElementById('nagios_select');
    let ul  = document.getElementById('nagios_list');
    let lis = ul.childNodes;

    lis.forEach(li => {
        ul.removeChild(li);
    })

    let data = JSON.parse(input.value);

    data.forEach(item => {
        let ulspace = createHTMLElement('div',['ulspace'],[]);
        let group = createHTMLElement('div',['input-group'],[]);
        let groupPrepend = createHTMLElement('div',['input-group-prepend'],[]);

        let group2 = createHTMLElement('div',['input-group'],[]);
        let groupPrepend2 = createHTMLElement('div',['input-group-prepend'],[]);

        let span = createHTMLElement('span',['input-group-text'])
        span.innerHTML = item.sensor
        let span2 = createHTMLElement('span',['input-group-text'])
        span2.innerHTML = item.oid

        let prefix = item.sensor + '_';
        let input1 = createHTMLElement('input',['form-control'],[['placeholder','Warning - lower then'], ['name', prefix + 'wlt']])
        let input2 = createHTMLElement('input',['form-control'],[['placeholder','Warning - greater then'], ['name', prefix + 'wgt']])
        let input3 = createHTMLElement('input',['form-control'],[['placeholder','Warning - equal'], ['name', prefix + 'weq']])
        let input4 = createHTMLElement('input',['form-control'],[['placeholder','Critical - lower then'], ['name', prefix + 'clt']])
        let input5 = createHTMLElement('input',['form-control'],[['placeholder','Critical - greater then'], ['name', prefix + 'cgt']])
        let input6 = createHTMLElement('input',['form-control'],[['placeholder','Critical - equal'], ['name', prefix + 'ceq']])

        groupPrepend.appendChild(span);
        group.appendChild(groupPrepend);
        group.appendChild(input1);
        group.appendChild(input2);
        group.appendChild(input3);

        groupPrepend2.appendChild(span2);
        group2.appendChild(groupPrepend2);
        group2.appendChild(input4);
        group2.appendChild(input5);
        group2.appendChild(input6);

        ulspace.appendChild(group);
        ulspace.appendChild(group2);

        ul.appendChild(ulspace);

    })

}