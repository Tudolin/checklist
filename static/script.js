// Defina a variável checklistData apenas uma vez
var checklistData = {
    id: null,
    name: '',
    description: '',
    areas: []
};

function initializeChecklist(data) {
    checklistData = data || { id: null, name: '', description: '', areas: [] };
    displayChecklistData();
}

function addArea(areaId = null, areaName = '', items = []) {
    let areaCount = areaId || checklistData.areas.length + 1;
    let areaDiv = document.createElement('div');
    areaDiv.id = `area${areaCount}`;
    areaDiv.innerHTML = `
        <h3>${areaName || `Área ${areaCount}`}</h3>
        Nome da Área: <input type="text" id="areaName${areaCount}" class="form-control" oninput="updateAreaName(${areaCount})" value="${areaName}"><br>
        <div id="items${areaCount}"></div>
        <button type="button" class="btn btn-secondary" onclick="addItem(${areaCount})">Adicionar Item</button>
        <button type="button" class="btn btn-danger" onclick="removeArea(${areaCount})">Remover Área</button>
    `;
    document.getElementById("areasContainer").appendChild(areaDiv);
    if (!areaId) {
        checklistData.areas.push({ areaId: areaCount, name: areaName, items: [] });
    }
    items.forEach(item => addItem(areaCount, item.itemId, item.text, item.type, item.required, item.options, item.weight));
}

function removeArea(areaId) {
    checklistData.areas = checklistData.areas.filter(area => area.areaId !== areaId);
    document.getElementById(`area${areaId}`).remove();
    saveChecklistData();
    displayChecklistData();
}

function addItem(areaId, itemId = null, itemText = '', itemType = '', itemRequired = false, itemOptions = [], itemWeight = 0) {
    let area = checklistData.areas.find(a => a.areaId === areaId);
    let itemCount = itemId || (area.items.length ? Math.max(...area.items.map(item => item.itemId)) + 1 : 1);
    let itemDiv = document.createElement('div');
    itemDiv.id = `item${areaId}_${itemCount}`;
    itemDiv.innerHTML = `
        <h4 id="itemName${areaId}_${itemCount}" onclick="configureItem(${areaId}, ${itemCount})">${itemText || `Item ${itemCount}`}</h4>
        Texto do Item: <input type="hidden" id="itemText${areaId}_${itemCount}" value="${itemText}">
        Tipo: <input type="hidden" id="itemType${areaId}_${itemCount}" value="${itemType}">
        Obrigatório: <input type="hidden" id="itemRequired${areaId}_${itemCount}" ${itemRequired ? 'checked' : ''}>
        Peso: <input type="hidden" id="itemWeight${areaId}_${itemCount}" value="${itemWeight}">
        <button type="button" class="btn btn-danger" onclick="removeItem(${areaId}, ${itemCount})">Remover Item</button>
        <div id="additionalFields${areaId}_${itemCount}"></div>
    `;
    document.getElementById(`items${areaId}`).appendChild(itemDiv);
    if (!itemId) {
        area.items.push({ itemId: itemCount, text: itemText, type: itemType, required: itemRequired, options: itemOptions, weight: itemWeight });
    } else {
        let existingItem = area.items.find(item => item.itemId === itemId);
        if (!existingItem) {
            area.items.push({ itemId: itemCount, text: itemText, type: itemType, required: itemRequired, options: itemOptions, weight: itemWeight });
        }
    }
}

function removeItem(areaId, itemId) {
    let area = checklistData.areas.find(a => a.areaId === areaId);
    area.items = area.items.filter(item => item.itemId !== itemId);
    document.getElementById(`item${areaId}_${itemId}`).remove();
    saveChecklistData();
    displayChecklistData();
}

function configureItem(areaId, itemId) {
    let area = checklistData.areas.find(a => a.areaId === areaId);
    let item = area.items.find(i => i.itemId === itemId);

    document.getElementById('modalItemText').value = item.text || '';
    document.getElementById('modalItemType').value = item.type || '';
    document.getElementById('modalItemRequired').checked = item.required || false;
    document.getElementById('modalItemWeight').value = item.weight || 0;
    document.getElementById('additionalFields').innerHTML = '';
    document.getElementById('modalItemDependency').value = item.dependency || '';
    if (item.type === 'unica' || item.type === 'multipla') {
        item.options = item.options || [];
        item.options.forEach((option, index) => {
            addOption(item.type, areaId, itemId, option);
        });
    }
    document.getElementById('itemConfigForm').dataset.areaId = areaId;
    document.getElementById('itemConfigForm').dataset.itemId = itemId;

    $('#itemConfigModal').modal('show');
}

function saveItemConfig() {
    let areaId = document.getElementById('itemConfigForm').dataset.areaId;
    let itemId = document.getElementById('itemConfigForm').dataset.itemId;

    let itemText = document.getElementById('modalItemText').value;
    let itemType = document.getElementById('modalItemType').value;
    let itemRequired = document.getElementById('modalItemRequired').checked;
    let itemWeight = document.getElementById('modalItemWeight').value;
    let itemDependency = document.getElementById('modalItemDependency').value;
    let itemOptions = [];
    if (itemType === 'unica' || itemType === 'multipla') {
        itemOptions = Array.from(document.querySelectorAll('#additionalFields input[type="text"]')).map(input => input.value);
    }

    document.getElementById(`itemText${areaId}_${itemId}`).value = itemText;
    document.getElementById(`itemType${areaId}_${itemId}`).value = itemType;
    document.getElementById(`itemRequired${areaId}_${itemId}`).value = itemRequired;
    document.getElementById(`itemWeight${areaId}_${itemId}`).value = itemWeight;
    document.getElementById(`itemDependency${areaId}_${itemId}`).value = itemDependency;

    let area = checklistData.areas.find(a => a.areaId == areaId);
    if (area) {
        let item = area.items.find(i => i.itemId == itemId);
        if (item) {
            item.text = itemText;
            item.type = itemType;
            item.required = itemRequired;
            item.weight = itemWeight;
            item.dependency = itemDependency;
            item.options = itemOptions;
        }
    }

    $('#itemConfigModal').modal('hide');
    saveChecklistData();
    displayChecklistData();
}

function updateAreaName(areaId) {
    let areaName = document.getElementById(`areaName${areaId}`).value;
    let area = checklistData.areas.find(a => a.areaId == areaId);
    if (area) {
        area.name = areaName;
    }
    saveChecklistData();
    displayChecklistData();
}

function updateChecklistName() {
    checklistData.name = document.getElementById('checklistName').value;
    saveChecklistData();
}

function updateChecklistDescription() {
    checklistData.description = document.getElementById('checklistDescription').value;
    saveChecklistData();
}

function saveChecklistData() {
    fetch('/checklist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(checklistData)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error saving checklist data');
        }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById('addAreaButton')) {
        document.getElementById('addAreaButton').addEventListener('click', () => addArea());
        document.getElementById('checklistForm').addEventListener('submit', function(event) {
            event.preventDefault();
            saveChecklistData();
        });
    }
});

function displayChecklistData() {
    // Limpar o contêiner de áreas antes de recarregar
    document.getElementById("areasContainer").innerHTML = '';
    
    console.log(JSON.stringify(checklistData, null, 2));
    checklistData.areas.forEach(area => {
        addArea(area.areaId, area.name, area.items);
    });
}

function updateItemType(select) {
    const type = select.value;
    const fieldsContainer = document.getElementById('additionalFields');
    fieldsContainer.innerHTML = '';

    if (type === 'unica' || type === 'multipla') {
        const optionContainer = document.createElement('div');
        optionContainer.id = 'optionContainer';
        fieldsContainer.appendChild(optionContainer);
        addOption(type);
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn btn-secondary';
        addButton.innerText = 'Adicionar Opção';
        addButton.onclick = () => addOption(type);
        fieldsContainer.appendChild(addButton);
    }
}

function addOption(type, areaId, itemId, value = '') {
    const optionContainer = document.getElementById('optionContainer');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'form-group';
    optionDiv.innerHTML = `
        <label>Opção:</label>
        <input type="text" class="form-control" value="${value}">
    `;
    optionContainer.appendChild(optionDiv);
}

function handleConditional(element, subgroupId) {
    let subgroup = document.getElementById(subgroupId);
    if (element.checked) {
        subgroup.style.display = 'block';
    } else {
        subgroup.style.display = 'none';
    }
}

// Função de adicionar subitens e subgrupos
function addSubItem(areaId, itemId, subItemId = null, subItemText = '', subItemType = '', subItemRequired = false, subItemOptions = [], subItemWeight = 0) {
    let area = checklistData.areas.find(a => a.areaId === areaId);
    let item = area.items.find(i => i.itemId === itemId);
    let subItemCount = subItemId || (item.subItems.length ? Math.max(item.subItems.map(subItem => subItem.subItemId)) + 1 : 1);
    let subItemDiv = document.createElement('div');
    subItemDiv.id = `subItem${itemId}_${subItemCount}`;
    subItemDiv.innerHTML = `
        <h5 id="subItemName${itemId}_${subItemCount}" onclick="configureSubItem(${areaId}, ${itemId}, ${subItemCount})">${subItemText || `SubItem ${subItemCount}`}</h5>
        Texto do SubItem: <input type="hidden" id="subItemText${itemId}_${subItemCount}" value="${subItemText}">
        Tipo: <input type="hidden" id="subItemType${itemId}_${subItemCount}" value="${subItemType}">
        Obrigatório: <input type="hidden" id="subItemRequired${itemId}_${subItemCount}" ${subItemRequired ? 'checked' : ''}>
        Peso: <input type="hidden" id="subItemWeight${itemId}_${subItemCount}" value="${subItemWeight}">
        <button type="button" class="btn btn-danger" onclick="removeSubItem(${areaId}, ${itemId}, ${subItemCount})">Remover SubItem</button>
        <div id="subAdditionalFields${itemId}_${subItemCount}"></div>
    `;
    document.getElementById(`items${areaId}`).appendChild(subItemDiv);
    if (!subItemId) {
        item.subItems.push({ subItemId: subItemCount, text: subItemText, type: subItemType, required: subItemRequired, options: subItemOptions, weight: subItemWeight });
    } else {
        let existingSubItem = item.subItems.find(subItem => subItem.subItemId === subItemId);
        if (!existingSubItem) {
            item.subItems.push({ subItemId: subItemCount, text: subItemText, type: subItemType, required: subItemRequired, options: subItemOptions, weight: subItemWeight });
        }
    }
}

function configureSubItem(areaId, itemId, subItemId) {
    let area = checklistData.areas.find(a => a.areaId === areaId);
    let item = area.items.find(i => i.itemId === itemId);
    let subItem = item.subItems.find(si => si.subItemId === subItemId);

    document.getElementById('modalSubItemText').value = subItem.text;
    document.getElementById('modalSubItemType').value = subItem.type;
    document.getElementById('modalSubItemRequired').checked = subItem.required;
    document.getElementById('modalSubItemWeight').value = subItem.weight;
    document.getElementById('subAdditionalFields').innerHTML = '';
    if (subItem.type === 'unica' || subItem.type === 'multipla') {
        subItem.options = subItem.options || [];
        subItem.options.forEach((option, index) => {
            addOption(subItem.type, areaId, itemId, option, true);
        });
    }
    document.getElementById('subItemConfigForm').dataset.areaId = areaId;
    document.getElementById('subItemConfigForm').dataset.itemId = itemId;
    document.getElementById('subItemConfigForm').dataset.subItemId = subItemId;
    
    $('#subItemConfigModal').modal('show');
}

function saveSubItemConfig() {
    let areaId = document.getElementById('subItemConfigForm').dataset.areaId;
    let itemId = document.getElementById('subItemConfigForm').dataset.itemId;
    let subItemId = document.getElementById('subItemConfigForm').dataset.subItemId;

    let subItemText = document.getElementById('modalSubItemText').value;
    let subItemType = document.getElementById('modalSubItemType').value;
    let subItemRequired = document.getElementById('modalSubItemRequired').checked;
    let subItemWeight = document.getElementById('modalSubItemWeight').value;
    let subItemOptions = [];
    if (subItemType === 'unica' || subItemType === 'multipla') {
        subItemOptions = Array.from(document.querySelectorAll('#subAdditionalFields input[type="text"]')).map(input => input.value);
    }

    document.getElementById(`subItemText${itemId}_${subItemId}`).value = subItemText;
    document.getElementById(`subItemType${itemId}_${subItemId}`).value = subItemType;
    document.getElementById(`subItemRequired${itemId}_${subItemId}`).value = subItemRequired;
    document.getElementById(`subItemWeight${itemId}_${subItemId}`).value = subItemWeight;

    let area = checklistData.areas.find(a => a.areaId == areaId);
    if (area) {
        let item = area.items.find(i => i.itemId == itemId);
        if (item) {
            let subItem = item.subItems.find(si => si.subItemId == subItemId);
            if (subItem) {
                subItem.text = subItemText;
                subItem.type = subItemType;
                subItem.required = subItemRequired;
                subItem.weight = subItemWeight;
                subItem.options = subItemOptions;
            }
        }
    }

    $('#subItemConfigModal').modal('hide');
    saveChecklistData();
    displayChecklistData();
}

function addOption(type, areaId, itemId, value = '', isSubItem = false) {
    const optionContainer = document.getElementById(isSubItem ? 'subOptionContainer' : 'optionContainer');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'form-group';
    optionDiv.innerHTML = `
        <label>Opção:</label>
        <input type="text" class="form-control" value="${value}">
    `;
    optionContainer.appendChild(optionDiv);
}
