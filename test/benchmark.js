const Benchmark = require('benchmark');
const pdsParser = require('../index');
const { readFileSync } = require('fs');

const suite = new Benchmark.Suite;
const sample = readFileSync('./sample.cfg').toString();

// add tests 
suite.add('PDS (File Buffer) Parsing', () => {
    pdsParser.parsePDSBuffer(sample)
})
    .on('cycle', function cycle (event) {
        console.log(String(event.target));
    })
    .run({ 'async': true });
