const RabbitStats = require('../lib/rabbitStats.js');
const nock = require('nock');

const instance = RabbitStats('http://some-host.com', 'guest', 'pass');
const badHeadersForDelete = {
    badheaders: {
        accept: 'application/json'
    }
};

describe('RabbitStats test', function () {
    describe('client', function () {
        it('all necessry methods should be present', function (done) {
            expect(instance.getVhostQueues).toBeDefined();
            expect(instance.putUser).toBeDefined();
            expect(instance.setUserPermissions).toBeDefined();
            done();
        });
    });

    describe('getVhostQueues', function () {
        it('successful request', function (done) {
            nock('http://some-host.com:80')
                .get('/api/queues/%2F')
                .reply(200, { "data": { "queue1": "params" } });

            instance.getVhostQueues('/')
                .then(checkResponse)
                .catch(done.fail);

            function checkResponse(data) {
                expect(data).toEqual({ "data": { "queue1": "params" } });
                done();
            }
        });

        it('failed request', function (done) {
            nock('http://some-host.com:80')
                .get('/api/queues/%2F')
                .reply(404, "Request failed");

            instance.getVhostQueues('/').catch(checkError);

            function checkError(err) {
                expect(err.message).toEqual('404 - "Request failed"');
                done();
            }
        });
    });

    describe('putUser', function () {
        it('successful request', function (done) {
            nock('http://some-host.com:80')
                .put('/api/users/testuser')
                .reply(200);

            instance.putUser('testuser', { password: "123456" })
                .then(checkResponse)
                .catch(done.fail);

            function checkResponse(data) {
                expect(data).toEqual(undefined);
                done();
            }
        });
    });

    describe('setUserPermissions', function () {
        it('successful request', function (done) {
            nock('http://some-host.com:80')
                .put('/api/permissions/%2F/testuser')
                .reply(200);

            instance.setUserPermissions('testuser', '/', { permission1: "value1", permission2: "value2" })
                .then(checkResponse)
                .catch(done.fail);

            function checkResponse(data) {
                expect(data).toEqual(undefined);
                done();
            }
        });
    });

    describe('deleteVhostQueueContents', function () {
        it('successful request', function (done) {
            nock('http://some-host.com:80', badHeadersForDelete)
                .delete('/api/queues/super-host/important-queue/contents')
                .reply(204);

            instance.deleteVhostQueueContents('super-host', 'important-queue')
                .then(checkResponse)
                .catch(done.fail);

            function checkResponse(data) {
                expect(data).toBeFalsy();
                done();
            }
        });

        it('failed request', function (done) {
            nock('http://some-host.com:80', badHeadersForDelete)
                .delete('/api/queues/super-host/important-queue/contents')
                .reply(500, "Error");

            instance.deleteVhostQueueContents('super-host', 'important-queue').catch(checkError);

            function checkError(err) {
                expect(err.message).toEqual('500 - "Error"');
                done();
            }
        });
    });
});
