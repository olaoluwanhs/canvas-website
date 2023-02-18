
window.addEventListener("load", () => {
    let FieldData = new NewData(document.querySelectorAll(".each-element"))

    // For table and information
    document.querySelector('.view-table').addEventListener("click", () => {
        FieldData.getFields();
    })
    document.querySelector('.render-table').addEventListener("click", () => { FieldData.renderTable() })

    // check to see if render button is available
    ObserverActivation(FieldData);

})

function ObserverActivation(data: NewData) {
    const attribute = { attribute: true, childList: true, subtree: true }
    // const callback = 
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            let node = document.getElementById('Extract-data');
            if (node == null) continue;
            node.addEventListener('click', () => { fullProcess(data) })
            let bgColor: HTMLInputElement = document.querySelector('#background-color'), boxColor: HTMLInputElement = document.querySelector('#box-color')

            // 
            bgColor.addEventListener('change', (e) => {
                let input = e.target as HTMLInputElement;
                GlobalBackgroundColor = input.value
                // fullProcess(data)
            })
            boxColor.addEventListener('change', (e) => {
                let input = e.target as HTMLInputElement;
                GlobalBoxColor = input.value
                // fullProcess(data)
            })
            // 

            observer.disconnect();
        }
    })
    observer.observe(document, attribute)
}
