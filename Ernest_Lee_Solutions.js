/*
Author: Ernest Lee
*/



// ================================== TASK 1 =======================================================================
/*** 
* @param {number} a
* @param {number} b
*/
function add(a, b) {
    return a + b;
}


/*** 
* @param {function} addFunc
* @param {object} operands
*/
const defaultArguments = (addFunc, operands) => {
    if (typeof operands !== "object" || typeof addFunc !== "function")
        return;
    
    return (a = operands.a, b = operands.b) => {
        if (typeof a === "number" && typeof b === "number")
            return addFunc(a, b);
        else 
            return NaN;
    } 
     
}


var add2 = defaultArguments(add, { b: 9});
console.assert(add2(10) === 19);
console.assert(add2(10, 7) === 17);
console.assert(isNaN(add2()));

const add3 = defaultArguments(add2, { b: 3, a: 2 });
console.assert(add3(10) === 13);
console.assert(add3() === 5);
console.assert(add3(undefined, 10) === 12);

const add4 = defaultArguments(add, { c: 3 }); 
console.assert(isNaN(add4(10)));
console.assert(add4(10, 10) === 20);


//======================================== END TASK ONE ============================================================


//======================================= TASK TWO ==================================================================

//assume calendar all in ascending order
let schedules = [
    [['09:00', '11:30'], ['13:30', '16:00'], ['16:00', '17:30'], ['17:45', '19:00']],
    [['09:15', '12:00'], ['14:00', '16:30'], ['17:00', '17:30']],
    [['11:30', '12:15'], ['15:00', '16:30'], ['17:45', '19:00']]
   ];


let persons = new Map()

/*** 
* @param {Array} schedules
* @param {number} duration (in minute)
*/
//assume start from 0900 & end at 1900 (ascending schedule)
const findEarliestAvailable = (schedules, duration) => {
    let minimumIndex = undefined
    let minimumSize = 0

    //computeFreeSlots
    for (let i=0; i<schedules.length; i++) {
        
        //compute 0900
        let slot = getIntervalSlot("09:00", schedules[i][0][0], duration);
        if (slot) persons.set(i, [slot]);
        

        for (let j=0; j<schedules[i].length; j++) {
            if (schedules[i][j+1]) {
                let slot = getIntervalSlot(schedules[i][j][1], schedules[i][j+1][0], duration);

                if (slot) {
                    let existList = persons.get(i);
                    persons.set(i, (existList) ? [...existList, slot] : [slot]);
                } 
            }
        }
        let existList = undefined;
        //compute 1900
        slot = getIntervalSlot(schedules[i][schedules[i].length-1][1], "19:00", duration);
        if (slot) {
            existList = persons.get(i);
            persons.set(i, (existList) ? [...existList, slot] : [slot]);
        }
        
        existList = persons.get(i);
        if (minimumSize === 0) {
            if (existList.length > 0) {
                minimumIndex = i;
                minimumSize = existList.length;
            }
            else 
                return null;
        } else if (minimumSize > existList.length) {
            minimumIndex = i;
            minimumSize = existList.length;
        }
    }

    let availStartTime = null
    let mList = persons.get(minimumIndex);
    let minimumEndT = undefined;
    //find intersection
    for (let i=0; i<minimumSize; i++) {
        for (let j=0; j<schedules.length; j++) {
            if (j === minimumIndex)
                continue;
            let list = persons.get(j);
            for (let k=0; k<list.length; k++) {
                
                if (minimumEndT === undefined && availStartTime === null) {
                    if (mList[i].startT === list[k].startT && mList[i].endT === list[k].endT) {
                        availStartTime = list[k].startT;
                        minimumEndT = list[k].endT;
                        break;
                    }    
                    if (mList[i].startT >= list[k].startT && mList[i].startT < list[k].endT) {
                        if (mList[i].startT + duration <= list[k].endT && mList[i].startT + duration <= mList[i].endT) {
                            availStartTime = mList[i].startT;
                            minimumEndT = Math.min(list[k].endT, mList[i].endT);
                            break;
                        }
                    }
                    else if (list[k].startT >= mList[i].startT &&  list[k].startT < mList[i].endT) {
                        if (list[k].startT + duration <= list[k].endT && list[k].startT + duration <= mList[i].endT) {
                            availStartTime = list[k].startT;
                            minimumEndT = Math.min(list[k].endT, mList[i].endT);
                            break;
                        }
                        
                    }
                }
                else  {
                    //compare against availStartTime & minimumEndT
                    if (availStartTime === list[k].startT && minimumEndT === list[k].endT) break;
                    
                    if (availStartTime >= list[k].startT && availStartTime < list[k].endT) {
                        if (availStartTime + duration <= list[k].endT && availStartTime + duration <= minimumEndT) {
                            //availStartTime remains
                            minimumEndT = Math.min(list[k].endT, minimumEndT);
                            break;
                        }
                    }
                    else if (list[k].startT >= availStartTime &&  list[k].startT < minimumEndT) {
                        if (list[k].startT + duration <= list[k].endT && list[k].startT + duration <= minimumEndT) {
                            //change
                            availStartTime = list[k].startT;
                            minimumEndT = Math.min(list[k].endT, minimumEndT);
                            break;
                        }
                    }
                    
                    if (k === list.length - 1) {
                        availStartTime = null;
                        minimumEndT = undefined;
                    } 
                }
                
            }

            if (availStartTime === null && minimumEndT === undefined) break;

        }
    }

    return (availStartTime) ? convert24HrTime(availStartTime) : null;
}

const getIntervalSlot = (previousEnd, nextStart, duration) => {
    let p = convertToMin(previousEnd)
    let n = convertToMin(nextStart)

    
    if (n - p >= duration) {
        return {startT: p, endT: n}
    }

    return 0
}

const convertToMin = (time) => {
    let timeCollection = time.split(":")
    let hour = timeCollection[0]
    let min = timeCollection[1]

    return parseInt(hour) * 60 + parseInt(min)
}

const convert24HrTime = (time) => {
    let hour = Math.floor(time / 60);
    let min = time % 60;

    return `${(hour.toString().length === 1) ? '0' + hour.toString() : hour.toString()}:${(min.toString().length === 1) ? '0' + min.toString() : min.toString()}`
}

;

console.log(findEarliestAvailable(schedules, 60));




//======================================== END TASK TWO ==============================================================