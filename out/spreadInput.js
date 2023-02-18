class NewData {
    constructor(formList) {
        this.formElement = formList;
        this.spreadsheetFields = [];
        this.reFunc = new ReoccuringFunctions(this);
    }
    getFields(formList = this.formElement) {
        let schemaLoader = [];
        formList.forEach((ele) => {
            const fieldForm = new FormData(ele);
            if (fieldForm.get('checkbox-state') == null ||
                fieldForm.get('name-state').toString() == "" ||
                fieldForm.get('name-state').toString().length > 10 || (fieldForm.get('select-state').toString() != "image" &&
                fieldForm.get('select-state').toString() != "text" &&
                fieldForm.get('select-state').toString() != "number"))
                return this.showInstruction();
            let inputSchema = {
                Name: fieldForm.get('name-state').toString(),
                type: fieldForm.get('select-state').toString(),
            };
            schemaLoader.push(inputSchema);
        });
        if (schemaLoader.filter((e) => { return e.type == "image"; }).length > 2 || schemaLoader.length > 5)
            return this.showInstruction();
        this.spreadsheetFields = schemaLoader;
        this.renderSchema();
    }
    renderSchema() {
        let Table = document.querySelector(".table-container > table");
        let TableHeadHTML = "<thead><tr class='table-head'><th id='indicators'>Field</th>";
        this.spreadsheetFields.forEach((field) => {
            TableHeadHTML += `<th>${field.Name}</th>`;
        });
        TableHeadHTML += `</tr>`;
        let TableTypeHTML = "<tr class='table-type'><th id='indicators'>Type</th>";
        this.spreadsheetFields.forEach((field) => {
            TableTypeHTML += `<th>${field.type}</th>`;
        });
        TableTypeHTML += `</tr><thead>`;
        Table.innerHTML = TableHeadHTML + TableTypeHTML;
    }
    showInstruction() {
        let a = document.querySelector("#instructions");
        a.style.opacity = "1";
    }
    renderTable() {
        if (this.spreadsheetFields.length <= 0)
            return this.showInstruction();
        let divs = document.querySelectorAll("#select-schema,#instructions");
        // console.log(divs)
        divs.forEach((e) => e.style.display = "none");
        // Create table
        let Table = document.querySelector(".table-container > table");
        let TableBodyHTML = "<tbody><tr><td class='indicators'>1</td>";
        this.spreadsheetFields.forEach((e, index) => {
            TableBodyHTML += `<td ${(e.type !== "image") ? 'contenteditable="true"' : ''} ${(e.type == 'number') ? 'class="only-number"' : ''}>${(e.type == 'image') ? '<input type="file" accept="image/*"/>' : ''}</td>`;
        });
        TableBodyHTML += `<td class='remover-class'>Remove</td></tr></tbody>`;
        Table.innerHTML += TableBodyHTML;
        Table.innerHTML += '<button id="add-cell">Add cell</button><button id="save-data">Save</button><button id="Extract-data">Render</button>';
        this.reFunc.InitAddOne();
        this.reFunc.InitRemover();
        this.reFunc.checkInput();
        this.reFunc.CorrectSerial();
        this.reFunc.InitSaver();
    }
    AddOne() {
        let TableBody = document.querySelector(".table-container > table > tbody");
        let TR = document.createElement('tr');
        let TableBodyHTML = `<td class='indicators'>${TableBody.childNodes.length + 1}</td>`;
        this.spreadsheetFields.forEach((e) => {
            TableBodyHTML += `<td ${(e.type !== "image") ? 'contenteditable="true"' : ''} ${(e.type == 'number') ? 'class="only-number"' : ''}>${(e.type == 'image') ? '<input type="file" accept="image/*"/>' : ''}</td>`;
        });
        TableBodyHTML += `<td class='remover-class'>Remove</td>`;
        TR.innerHTML = TableBodyHTML;
        TableBody.appendChild(TR);
        this.reFunc.InitRemover();
        this.reFunc.checkInput();
        this.reFunc.CorrectSerial();
    }
    // Extarct data from table into useful properties
    SaveTableData() {
        // selected the table body
        let TableBody = document.querySelector(".table-container > table > tbody");
        let Data = [];
        // selected the table rows
        let rows = TableBody.childNodes;
        rows.forEach((row) => {
            let dataInside = [];
            // selected the table calls
            let cells = row.childNodes;
            cells.forEach((cell, index) => {
                if (index == 0 || index == cells.length - 1)
                    return;
                // get url string if its an image and inner text if not
                switch (this.spreadsheetFields[index - 1].type) {
                    case 'image':
                        // get url string of the image input
                        dataInside.push(this.reFunc.GetImageURL(cell.firstChild));
                        break;
                    default:
                        dataInside.push(cell.innerText);
                        break;
                }
            });
            Data.push(dataInside);
        });
        this.DataMatrix = Data;
        let input = document.querySelector('#progress-message > p');
        input.innerText = 'Saved Information';
    }
    Extractor() {
        return {
            schema: this.spreadsheetFields,
            data: this.DataMatrix
        };
    }
}
class ReoccuringFunctions {
    constructor(context) {
        this.context = context;
    }
    checkInput() {
        let tableDataList = document.querySelectorAll('.only-number');
        // console.log(tableDataList)
        tableDataList.forEach((ele) => {
            ele.addEventListener('keypress', (e) => {
                // 
                if (!(e.key.toString() != ' ' && Number.isInteger(Number(e.key)))) {
                    e.preventDefault();
                }
            });
        });
    }
    InitAddOne() {
        let button = document.querySelector('#add-cell');
        // console.log(button)
        button.addEventListener('click', () => { this.context.AddOne(); });
    }
    InitSaver() {
        let button = document.querySelector('#save-data');
        // console.log(button)
        button.addEventListener('click', () => { this.context.SaveTableData(); });
    }
    InitRemover() {
        let removers = document.querySelectorAll('.remover-class');
        // console.log(removers)
        removers.forEach((e) => {
            e.addEventListener('click', (e) => {
                let target = e.target;
                target.parentElement.remove();
                this.CorrectSerial();
            });
        });
    }
    CorrectSerial() {
        let TableBody = document.querySelectorAll(".indicators");
        // console.log(TableBody)
        TableBody.forEach((e, index) => {
            e.innerText = (index + 1).toString();
        });
    }
    GetImageURL(input) {
        if (input.files.length <= 0)
            return 'assets/place.jpg';
        let url = URL.createObjectURL(input.files[0]);
        return url;
    }
}
//# sourceMappingURL=spreadInput.js.map