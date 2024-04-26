/*
    Catherine Rodriquez
    Shift Reduce Parser
    CSC 4101
*/

function generateParsingTable(grammar) {
    const parsingTable = {
        0: { id: 's5', '+': '', '*': '', '(': 's4', ')': '', '$': '', E: 1, T: 2, F: 3 },
        1: { id: '', '+': 's6', '*': '', '(': '', ')': '', '$': 'accept', E: '', T: '', F: '' },
        2: { id: '', '+': 'r2', '*': 's7', '(': '', ')': 'r2', '$': 'r2', E: '', T: '', F: '' },
        3: { id: '', '+': 'r4', '*': 'r4', '(': '', ')': 'r4', '$': 'r4', E: '', T: '', F: '' },
        4: { id: 's5', '+': '', '*': '', '(': 's4', ')': '', '$': '', E: 8, T: 2, F: 3 },
        5: { id: '', '+': 'r6', '*': 'r6', '(': '', ')': 'r6', '$': 'r6', E: '', T: '', F: '' },
        6: { id: 's5', '+': '', '*': '', '(': 's4', ')': '', '$': '', E: '', T: 9, F: 3 },
        7: { id: 's5', '+': '', '*': '', '(': 's4', ')': '', '$': '', E: '', T: '', F: 10 },
        8: { id: '', '+': 's6', '*': '', '(': '', ')': 's11', '$': '' , E: '', T: '', F: ''},
        9: { id: '', '+': 'r1', '*': 's7', '(': '', ')': 'r1', '$': 'r1' , E: '', T: '', F: ''},
        10: { id: '', '+': 'r3', '*': 'r3', '(': '', ')': 'r3', '$': 'r3', E: '', T: '', F: '' },
        11: { id: '', '+': 'r5', '*': 'r5', '(': '', ')': 'r5', '$': 'r5' , E: '', T: '', F: ''}
    };

    return parsingTable;
}

function populateTable(parsingTable) {
    const tbody = document.querySelector('tbody');
    const states = Object.keys(parsingTable);

    for (const state of states) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${state}</td>`;
        for (const symbol in parsingTable[state]) {
            const td = document.createElement('td');
            td.textContent = parsingTable[state][symbol];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
}

//generate parsing table
const parsingTable = generateParsingTable();

//populate table
populateTable(parsingTable);

//parsing
$(document).ready(function() {
    //modal for description
    var modal = document.getElementById('modal');
    var btn = document.getElementById("gameModalButton"); 
    var span = document.getElementsByClassName("close-modal")[0]; //get the <span> element that closes the modal 
    btn.onclick = function() { //when the user clicks the button, open the modal
        modal.style.display = "block";
    }
    span.onclick = function() { //when the user clicks on <span> (x), close the modal
        modal.style.display = "none";
    }
    window.onclick = function(event) { //when the user clicks anywhere outside of the modal, close it
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }
    //submit button to choose different parse inputs
    $('.parseStep').addClass('hide');
    $('.restart').addClass('hide');
    $('#submitParse').click(function() {
        console.log('Submit Expression');
        $('.parseSubmit').addClass('hide');
        $('.parseStep').removeClass('hide');

    });

    //'step' button to move through each parsing step
    $('#stepToParse').click(function() {
        stepToParse();
    });

    //restart button -> update as i go along
    $('#restart').click(function() {
        console.log("Restart the Parse Steps!");
        $('.announce').addClass('hide')

        //clear the output chart
        const outputTable = document.getElementById("output");
        const rowCount = outputTable.rows.length;
        console.log(rowCount);
        //start from the last row skipping the caption
        for (let i = rowCount - 1; i > 0; i--) { 
            outputTable.deleteRow(i);
        }

        //clear first row
        outputTable.deleteRow(0);

        //reset parsing elements
        sessionStorage.removeItem("parsedArray");
        sessionStorage.removeItem("previousState");
        sessionStorage.removeItem("previousAction");

        //reset cell colors in the parser table
        const parserTable = document.getElementById('parser');
        for (let i = 0; i < parserTable.rows.length; i++) {
            for (let j = 0; j < parserTable.rows[i].cells.length; j++) {
                parserTable.rows[i].cells[j].style.backgroundColor = '';
            }
        }

        //reset buttons
        $('.parseSubmit').removeClass('hide');
        $('.parseStep').addClass('hide');
        $('.restart').addClass('hide');
        document.getElementById('parser').rows[3].cells[6].style.backgroundColor = '';
    });

    //grammar replacement
    function replaceGrammar(grammar) {
        switch (grammar) {
            case "1":
                return ["E", "+"];
            case "2":
                return ["E", ""];
            case "3":
                return ["T", "*"];
            case "4":
                return ["T", ""];
            case "5":
                return ["F", "("];
            case "6":
                return ["F", ""];
        }
    }

    function getAction(expression) {
        if (expression.substring(0, 2) === "id") {
            return [1, "id"];
        }
    
        switch (expression.substring(0, 1)) {
            case "+":
                return [2, "+"];
            case "*":
                return [3, "*"];
            case "(":
                return [4, "("];
            case ")":
                return [5, ")"];
            case "$":
                return [6, "$"];
            case "E":
                return [7, "E"];
            case "T":
                return [8, "T"];
            case "F":
                return [9, "F"];
            default:
                console.log("param \"" + expression.substring(0, 1) + "\" = invalid");
                $('.announce').removeClass('hide').text("Invalid Input!");
                $('.parseStep').addClass('hide');
                $('.restart').removeClass('hide');
        }

        return -1;
    }

    function getState(parsedArray) {
        if (parsedArray.substring(parsedArray.length - 2, parsedArray.length) === "11") {
            return 11;
        } else if (parsedArray.substring(parsedArray.length - 2, parsedArray.length) === "10") {
            return 10;
        }
        return Number(parsedArray.substring(parsedArray.length - 1, parsedArray.length));
    }

    //parse shift step
    function shiftStep(expression, parsedArray, num) { 
        const actionParse = getAction(expression)[1];
        parsedArray = [getAction(expression)[1], num];
        expression = expression.substring(actionParse.length + 1);
        console.log("shift = " + parsedArray + actionParse + num);
        return [parsedArray, expression];
    }

    //parse reducing step
    function reduceStep(num, parsedArray) { 
        let newItem, replace;
        [newItem, replace] = replaceGrammar(num);
    
        if (replace === "") {
            parsedArray[parsedArray.length - 2] = newItem;
        } 
        else {
            console.log("\n\nspecial case -> looking for " + replace);
            for (let i = parsedArray.length; i >= 0; i--) {
                if (parsedArray[i] === replace) {
                    console.log(replace + " position = " + i);
                    parsedArray = parsedArray.slice(0, i);
                    if (replace === "(") {
                        parsedArray[parsedArray.length] = "F";
                        parsedArray[parsedArray.length] = "-1";
                    }
                    i = -1; //placeholder
                }
            }
        }
    
        //handles grammar
        switch (parsedArray[parsedArray.length - 2]) {
            case "E":
                console.log("E");
                console.log(parseInt(parseInt(parsedArray[parsedArray.length - 3])) + 2);
                parsedArray[parsedArray.length - 1] = document.getElementById('parser').rows[parseInt(parsedArray[parsedArray.length - 3]) + 2].cells[7].textContent;
                break;
            case "T":
                console.log("T");
                console.log(parseInt(parseInt(parsedArray[parsedArray.length - 3])) + 2);
                parsedArray[parsedArray.length - 1] = document.getElementById('parser').rows[parseInt(parsedArray[parsedArray.length - 3]) + 2].cells[8].textContent;
                break;
            case "F":
                console.log("F");
                parsedArray[parsedArray.length - 1] = document.getElementById('parser').rows[parseInt(parsedArray[parsedArray.length - 3]) + 2].cells[9].textContent;
                break;
        }
        return parsedArray;
    }

    function tableInfo(parsedArray, expression) { 
        //getting from table : action and state
        const actionStep = getAction(expression)[0];
        const stateStep = getState(parsedArray.join(""));
        
        //update current step cell color
        document.getElementById('parser').rows[stateStep + 2].cells[actionStep].style.backgroundColor = 'white';

        //action step or state step
        if (sessionStorage.getItem("previousState")) {
            previousState = JSON.parse(sessionStorage.getItem("previousState"));
        }
        if (sessionStorage.getItem("previousAction")) {
            previousAction = JSON.parse(sessionStorage.getItem("previousAction"));
        }
        if (sessionStorage.getItem("previousState") && sessionStorage.getItem("previousAction")) {
            //update previous step cell color
            document.getElementById('parser').rows[parseInt(previousState) + 2].cells[parseInt(previousAction)].style.backgroundColor = '';
        }
        sessionStorage.setItem("previousState", JSON.stringify(stateStep.toString()));
        sessionStorage.setItem("previousAction", JSON.stringify(actionStep.toString()));
        return document.getElementById('parser').rows[stateStep + 2].cells[actionStep].textContent;
    }

    //created Output Table by inserting item to both columns
    function itemInsert(outputTable, firstItem, secondItem) {
        const row = outputTable.insertRow(-1);
        const column1 = row.insertCell(0);
        const column2 = row.insertCell(1);
        column1.width = "140";
        column1.innerHTML = firstItem;
        column2.innerHTML = secondItem;
    }

    //initial step for parsing : figure out if it shifts, reduces, or is grammar
    function parse(expression, parsedArray) { 
        const element = tableInfo(parsedArray, expression);
            console.log("- element: " + element);
    
        if (element === "accept") {
            console.log("Parse steps are completed");
        } 
        else if (element.substring(0, 1) === "r") {
            console.log("reduce");
            parsedArray = reduceStep(element.substring(1, element.length), parsedArray);
        }
        else if (element.substring(0, 1) === "s") {
            console.log("shift");
            let arrToAdd;
            [arrToAdd, expression] = shiftStep(expression, parsedArray, element.substring(1, element.length));
            parsedArray = parsedArray.concat(arrToAdd);
        }  
        else {
            console.log("grammar");
            parsedArray = getGrammar(Number(element), parsedArray)[0];
        }
        return [parsedArray, expression];
    }

    //display steps
    function stepToParse(){
        //table html
        const outputTable = document.getElementById("output");
        console.log("\nBegin Parse: ");

        let parsedArray = [];
        if (sessionStorage.getItem("parsedArray")) {
            parsedArray = JSON.parse(sessionStorage.getItem("parsedArray"));
        }

        //checks for first step
        if (outputTable.rows.length === 0) {
            itemInsert(outputTable, "0", document.getElementById("parseInput").value)
            parsedArray = [0];
        }
        else {
            console.log("- parsed array: " + parsedArray);
            var expression = outputTable.rows[outputTable.rows.length - 1].cells[1].innerHTML;
            //perform input validation
            if (!isValidInput(expression)) {
                //handle invalid input here
                console.error("Invalid input detected:", expression);
                $('.announce').removeClass('hide').text("Invalid Input!");
                $('.parseStep').addClass('hide');
                $('.restart').removeClass('hide');
                return; 
            }
            console.log("- expression: " + expression);
            [parsedArray, expression] = parse(expression, parsedArray)
            var joinedString = parsedArray.join("");
            console.log("joined sequence: " + joinedString);

            if (joinedString === "0E1" && expression === "$") {
                $('.parseStep').addClass('hide');
                $('.restart').removeClass('hide');
                $('.announce').removeClass('hide').text("Steps Complete!");
                previousState = JSON.parse(sessionStorage.getItem("previousState"));
                previousAction = JSON.parse(sessionStorage.getItem("previousAction"));
                document.getElementById('parser').rows[parseInt(previousState) + 2].cells[parseInt(previousAction)].style.backgroundColor = '';
                document.getElementById('parser').rows[3].cells[6].style.backgroundColor = 'pink';
            }   
            itemInsert(outputTable, parsedArray.join(""), expression)   
        }    
        sessionStorage.setItem("parsedArray", JSON.stringify(parsedArray));
    }

    function isValidInput(expression) {
        //check if the expression ends with '$'
        return expression.trim().endsWith("$");
    }
});

