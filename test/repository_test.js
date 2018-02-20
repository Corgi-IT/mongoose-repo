require('should');
const Repository = require('../repository');

describe('Mongoose Repo test', function () {
    let repo;

    beforeEach(() => {
        repo = new Repository(null, {applyStatics: false});
    });

    describe('Basic', () => {
        it('Should make a new instance of the Repository', () => {
            const result = new Repository(null, {applyStatics: false});

            result.should.have.property('class', 'Repository');
        })
    });

    describe('Constructor', () => {
        it('Should set the Model');
        it('Should get the Models schema statics if applyStatics is set');
    });

    describe('.create', () => {
        it('Should use a basic object if no object is given');
        it('Should save the document');
    });

    describe('.find', () => {
        it('Should use a basic object if no query is given');

    });

    describe('.findByObjectId', () => {
        it('Should return an error if no ObjectId is given', async () => {
            const result = await repo.findByObjectId();

            result.should.have.property('error', 'No ObjectId given');
        });
    });

    describe('.findAll', () => {
        it('Should return an array of documents');
    });

    describe('.update', () => {
        it('Should update the document with the new values');
    });

    describe('remove', () => {
        it('Should remove the document');
    });
});
