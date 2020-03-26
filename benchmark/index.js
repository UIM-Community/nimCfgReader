const Benchmark = require('benchmark');
const nimCfgReader = require('../index');
const { readFileSync } = require('fs');
const { join } = require("path");

const suite = new Benchmark.Suite;
const sample = readFileSync(join(__dirname, "sample.cfg"), "utf-8");

// add tests 
suite.add('PDS (File Buffer) Parsing', () => {
    nimCfgReader.parseConfigurationBuffer(sample)
})
    .on('cycle', function cycle (event) {
        console.log(String(event.target));
    })
    .run({ 'async': true });
