const diffs = require('./diffs')

let from =
{
    b: {
        c: 2
    }
}

let to =
{
    b: {
        c: 2
    }
}


const changes = diffs.get(from, to)

console.log(changes)


//this.original = diffs.apply(this.original, changes)

const determinedValue = (() => {
    if (!isPrimitive(currentTypeid) || currentContext !== 'single') return
    let tmp = data[key + '^'] !== undefined ? data[key + '^'] : false
    try {
        tmp = tmp || data.get(key + '^')  !== undefined ? data.get(key + '^') : false
    } catch (error) {
        console.log(error);
    }
    tmp = tmp || value
    return tmp
})();

if (isPrimitive(currentTypeid) && currentContext === 'single') {
    try {
      if (data[key + '^'] !== undefined) {
        determinedValue = data[key + '^'];
      } else if (data.get(key + '^') !== undefined) {
        determinedValue = data.get(key + '^');
      } else {
        determinedValue = value;
      }
    } catch (error) {
      console.log(error);
    }
  }