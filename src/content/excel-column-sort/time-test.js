console.time('performanceTest');
const sortValues = [];
for (let i = 0; i < 1000; i++) {
    sortValues.push(numberToLetters(i));
}
console.timeEnd('performanceTest');
console.log(sortValues.length);

function numberToLetters(index) {
    const charLimit = 26;
    if (index > charLimit) {
        if (index % charLimit === 0) {
            return (
                '' +
                numberToLetters(index / charLimit - 1) +
                numberToLetters(charLimit)
            );
        } else {
            return (
                '' +
                numberToLetters(Math.trunc(index / charLimit)) +
                numberToLetters(index % charLimit)
            );
        }
    } else {
        const a = 'A'.charCodeAt(0);

        return String.fromCharCode(a + index - 1);
    }
}
