
type SchemaType = {
    Name: string,
    type: string,
}

type BoxDataType = Array<string>
type RenderedDataType = {
    schema: Array<SchemaType>;
    data: Array<BoxDataType>;
}

class NewData {
    private formElement: NodeListOf<HTMLFormElement>;
    private spreadsheetFields: Array<SchemaType>
    private reFunc: ReoccuringFunctions;
    private DataMatrix: Array<Array<string>>

    constructor(formList: NodeListOf<HTMLFormElement>) {
        this.formElement = formList;
        this.spreadsheetFields = [];
        this.reFunc = new ReoccuringFunctions(this)
    }

    getFields(formList: NodeListOf<HTMLFormElement> = this.formElement) {
        let schemaLoader: Array<SchemaType> = []
        formList.forEach((ele) => {
            const fieldForm = new FormData(ele);

            if (
                fieldForm.get('checkbox-state') == null ||
                fieldForm.get('name-state').toString() == "" ||
                fieldForm.get('name-state').toString().length > 10 || (
                    fieldForm.get('select-state').toString() != "image" &&
                    fieldForm.get('select-state').toString() != "text" &&
                    fieldForm.get('select-state').toString() != "number")
            ) return this.showInstruction();
            let inputSchema: SchemaType = {
                Name: fieldForm.get('name-state').toString(),
                type: fieldForm.get('select-state').toString(),
            }
            schemaLoader.push(inputSchema);
        })
        if (schemaLoader.filter((e) => { return e.type == "image" }).length > 2 || schemaLoader.length > 5) return this.showInstruction();
        this.spreadsheetFields = schemaLoader
        this.renderSchema()
    }

    private renderSchema() {
        let Table: HTMLTableElement = document.querySelector(".table-container > table");

        let TableHeadHTML: string = "<thead><tr class='table-head'><th id='indicators'>Field</th>"
        this.spreadsheetFields.forEach((field) => {
            TableHeadHTML += `<th>${field.Name}</th>`
        })
        TableHeadHTML += `</tr>`

        let TableTypeHTML: string = "<tr class='table-type'><th id='indicators'>Type</th>"
        this.spreadsheetFields.forEach((field) => {
            TableTypeHTML += `<th>${field.type}</th>`
        })
        TableTypeHTML += `</tr><thead>`

        Table.innerHTML = TableHeadHTML + TableTypeHTML
    }
    private showInstruction() {
        let a: HTMLDivElement = document.querySelector("#instructions");
        a.style.opacity = "1";
    }
    renderTable() {
        if (this.spreadsheetFields.length <= 0) return this.showInstruction();
        let divs: NodeListOf<HTMLDivElement> = document.querySelectorAll("#select-schema,#instructions")
        // console.log(divs)
        divs.forEach((e) => e.style.display = "none");

        // Create table
        let Table: HTMLTableElement = document.querySelector(".table-container > table");
        let TableBodyHTML: string = "<tbody><tr><td class='indicators'>1</td>"
        this.spreadsheetFields.forEach((e, index) => {
            TableBodyHTML += `<td ${(e.type !== "image") ? 'contenteditable="true"' : ''} ${(e.type == 'number') ? 'class="only-number"' : ''}>${(e.type == 'image') ? '<input type="file" accept="image/*"/>' : ''}</td>`
        })
        TableBodyHTML += `<td class='remover-class'>Remove</td></tr></tbody>`

        Table.innerHTML += TableBodyHTML;
        Table.innerHTML += '<button id="add-cell">Add cell</button><button id="save-data">Save</button><button id="Extract-data">Render</button>';
        this.reFunc.InitAddOne()
        this.reFunc.InitRemover()
        this.reFunc.checkInput()
        this.reFunc.CorrectSerial()
        this.reFunc.InitSaver()
    }
    AddOne() {
        let TableBody: HTMLTableSectionElement = document.querySelector(".table-container > table > tbody");
        let TR = document.createElement('tr')
        let TableBodyHTML: string = `<td class='indicators'>${TableBody.childNodes.length + 1}</td>`
        this.spreadsheetFields.forEach((e) => {
            TableBodyHTML += `<td ${(e.type !== "image") ? 'contenteditable="true"' : ''} ${(e.type == 'number') ? 'class="only-number"' : ''}>${(e.type == 'image') ? '<input type="file" accept="image/*"/>' : ''}</td>`
        })
        TableBodyHTML += `<td class='remover-class'>Remove</td>`
        TR.innerHTML = TableBodyHTML;
        TableBody.appendChild(TR);
        this.reFunc.InitRemover();
        this.reFunc.checkInput();
        this.reFunc.CorrectSerial()
    }

    // Extarct data from table into useful properties
    SaveTableData() {
        // selected the table body
        let TableBody: HTMLTableSectionElement = document.querySelector(".table-container > table > tbody");
        let Data = [];

        // selected the table rows
        let rows = TableBody.childNodes as NodeListOf<HTMLTableRowElement>
        rows.forEach((row) => {
            let dataInside = []
            // selected the table calls
            let cells = row.childNodes as NodeListOf<HTMLTableCellElement>
            cells.forEach((cell, index) => {
                if (index == 0 || index == cells.length - 1) return;
                // get url string if its an image and inner text if not
                switch (this.spreadsheetFields[index - 1].type) {
                    case 'image':
                        // get url string of the image input
                        dataInside.push(this.reFunc.GetImageURL(cell.firstChild as HTMLInputElement))
                        break;

                    default:
                        dataInside.push(cell.innerText)
                        break;
                }
            })

            Data.push(dataInside)
        })
        this.DataMatrix = Data
        let input: HTMLParagraphElement = document.querySelector('#progress-message > p')
        input.innerText = 'Saved Information';
    }

    Extractor(): RenderedDataType {
        return {
            schema: this.spreadsheetFields,
            data: this.DataMatrix
        }
    }

}

class ReoccuringFunctions {
    private context: NewData
    constructor(context: NewData) {
        this.context = context
    }

    checkInput() {
        let tableDataList: NodeListOf<HTMLTableCellElement> = document.querySelectorAll('.only-number')
        // console.log(tableDataList)
        tableDataList.forEach((ele) => {
            ele.addEventListener('keypress', (e) => {
                // 
                if (!(e.key.toString() != ' ' && Number.isInteger(Number(e.key)))) {
                    e.preventDefault();
                }
            })
        })

    }

    InitAddOne() {
        let button: HTMLButtonElement = document.querySelector('#add-cell')
        // console.log(button)
        button.addEventListener('click', () => { this.context.AddOne() })
    }
    InitSaver() {
        let button: HTMLButtonElement = document.querySelector('#save-data');
        // console.log(button)
        button.addEventListener('click', () => { this.context.SaveTableData() })
    }
    InitRemover() {
        let removers: NodeListOf<HTMLTableCellElement> = document.querySelectorAll('.remover-class');
        // console.log(removers)
        removers.forEach((e) => {
            e.addEventListener('click', (e) => {
                let target = e.target as HTMLTableCellElement;
                target.parentElement.remove()
                this.CorrectSerial();
            })
        })
    }
    CorrectSerial() {
        let TableBody: NodeListOf<HTMLTableCellElement> = document.querySelectorAll(".indicators");
        // console.log(TableBody)
        TableBody.forEach((e, index) => {
            e.innerText = (index + 1).toString();
        })
    }

    GetImageURL(input: HTMLInputElement) {
        if (input.files.length <= 0) return 'assets/place.jpg';
        let url = URL.createObjectURL(input.files[0])
        return url;
    }
}
