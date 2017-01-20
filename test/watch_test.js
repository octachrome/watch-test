describe('Watch library', function () {
    var tmp = require('tmp');
    var Path = require('path');
    var watch = require('watch');
    var fs = require('fs');
    var expect = require('chai').expect;

    var tempDir;

    beforeEach(function () {
        tempDir = tmp.dirSync({unsafeCleanup: true}).name;
    });

    describe('Given a directory is being watched', function () {
        var changedFiles;

        beforeEach(function () {
            changedFiles = [];

            watch.watchTree(tempDir, function (f, curr, prev) {
                if (typeof f === 'string') {
                    changedFiles.push(Path.basename(f));
                }
                else if (typeof f === 'object') {
                    changedFiles.push.apply(changedFiles, Object.keys(f).map(function (key) {
                        return Path.basename(key);
                    }));
                }
            });
        });

        describe('When a directory is created', function () {
            this.timeout(5000);

            beforeEach(function (done) {
                fs.mkdir(Path.join(tempDir, 'dir'), done);
            });

            describe('When a file is created immediately afterwards', function () {
                beforeEach(function (done) {
                    fs.writeFile(Path.join(tempDir, 'dir', 'test.txt'), 'test', done);
                });

                it('should detect the file', function () {
                    return waitForOk(function () {
                        expect(changedFiles).to.include('test.txt');
                    });
                });
            });

            describe('When a file is created after a short delay', function () {
                beforeEach(function (done) {
                    setTimeout(function () {
                        fs.writeFile(Path.join(tempDir, 'dir', 'test.txt'), 'test', done);
                    }, 10);
                });

                it('should detect the file', function () {
                    return waitForOk(function () {
                        expect(changedFiles).to.include('test.txt');
                    });
                });
            });

            describe('When a file is created after a long delay', function () {
                beforeEach(function (done) {
                    setTimeout(function () {
                        fs.writeFile(Path.join(tempDir, 'dir', 'test.txt'), 'test', done);
                    }, 100);
                });

                it('should detect the file', function () {
                    return waitForOk(function () {
                        expect(changedFiles).to.include('test.txt');
                    });
                });
            });
        });
    });

    function waitForOk(fn) {
        var attempts = 0;
        return new Promise(function (resolve, reject) {
            function attempt() {
                try {
                    resolve(fn());
                }
                catch (err) {
                    if (++attempts > 40) {
                        reject(err);
                    }
                    else {
                        setTimeout(attempt, 100);
                    }
                }
            }

            attempt();
        });
    }
});
