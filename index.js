'use strict';

const Hogan = require('hogan.js');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const async = require('async');

class Templates {
    constructor() {
        this.partials = {};
    }

    loadAll(prefixes, done) {
        async.eachOf(prefixes, (base, prefix, done) => this.load(base, prefix, done), done);
    }

    load(base, prefix, done) {
        if (typeof prefix === 'function') { done = prefix; prefix = null; }
        glob(base + '/**/*.html', {}, (err, files) => {
            if (err) return done(err);
            async.each(files, (filename, done) => {
                let key = path.relative(base, filename).replace(/\//g, '-').replace('.html', '');
                if (prefix && prefix !== 'ROOT') key = prefix + '-' + key;
                fs.readFile(filename, 'utf8', (err, content) => {
                    this.partials[key] = content;
                    done(err);
                });
            }, done);
        });
    }

    get(key) {
        return this.partials[key];
    }

    compile(key) {
        return Hogan.compile(this.get(key));
    }

    render(key, locals) {
        return this.compile(key).render(locals, this.partials);
    }
}

module.exports = Templates;
