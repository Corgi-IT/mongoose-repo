class Repository {

    /**
     * Constructor
     *
     * @param {Object} model An instance the Mongoose Schema
     * @param {Object} applyStatics Extra options
     * @returns {Object} Instance of Repository
     */
    constructor(model, {applyStatics = true} = {}) {
        this.class = Repository.name;
        this.Model = model || null;

        if (applyStatics) {
            const schema = model.schema;
            for (const i in schema.statics) {
                this[i] = schema.statics[i];
            }
        }
    }

    /**
     * Creates a new document, saves and returns it, based on the given object.
     *
     * @param {Object} [input={}] The object that should be saved
     * @returns {Object} Created document
     */
    async create(input = {}) {
        try {
            const doc = new this.Model(input);

            await doc.save();

            return doc;
        } catch(error) {
            return {error: error.message};
        }
    }
    /**
     * Searches for (a) Document(s) based on the given Query
     *
     * @param {Object} query Query to execute in MongoDB
     * @param {String} select Fields to include
     * @param {String} populate Fields to populate
     * @param {Number} limit Max amount of docs
     * @param {Number} skip The amount of documents the query should skip
     * @param {Object} sort Fields to sort by
     * @param {Boolean} lean True if the result should be lean, false if not
     * @param {Boolean} [multiple=true] Return multiple documents or just one, defaults to true
     * @returns {Object} Search result
     */
    async find(query = {}, {select, populate, limit, skip, sort, lean = false, count = false, multiple = true} = {}) {
        try {
            const result = multiple ? this.Model.find(query) : this.Model.findOne(query);

            if (select) {
                result.select(select);
            }
            if (limit) {
                result.limit(limit);
            }
            if (skip) {
                result.skip(skip);
            }

            if (populate) {
                populateQuery(result, populate);
            }
            if (sort) {
                result.sort(sort);
            }

            if (count) {
                return await result.count();
            } else if (lean) {
                return await result.lean();
            } else {
                return await result;
            }
        } catch (error) {
            return {error: error.message};
        }
    }

    /**
     * Searches for one Document based on the ObjectID
     * Second parameter is an Options object
     *
     * @param {String} objectId An uploads ObjectId
     * @param {String} select Fields to include
     * @param {String} populate Fields to populate
     * @param {Boolean} lean True if the result should be lean, false if not
     * @returns {Object} document || error The Object with the correct upload or error property with what went wrong
     */
    async findByObjectId(objectId, {select, populate, lean = false} = {}) {
        try {
            if (!objectId) {
                return {error: 'No ObjectId given'};
            }

            return await this.find({_id: objectId}, {select, multiple: false, populate, lean});
        } catch (error) {
            return {error};
        }
    }

    async findAll() {
        try {
            return await this.find({});
        } catch (error) {
            return {error};
        }
    }

    /**
     * Finds a Document by its ID, adds the new/updated values and saves it
     * This is done entirely in the Node.js app, not in the database
     *
     * @param {String} objectId The ID of the Document you'd like to update
     * @param {Object} newValues The new/updated values for the Document
     * @returns {Object} doc || error
     */
    async update(objectId, newValues) {
        try {
            const result = await this.findByObjectId(objectId);

            Object.assign(result, newValues);

            await result.save();

            return result;
        } catch (error) {
            return {error: error.message};
        }
    }

    /**
     * Removes a document based on the given ObjectID
     *
     * @param {String} objectId The ID of the Document you'd like to delete
     * @returns {Object} result || error
     */
    async remove(objectId) {
        try {
            return await this.Model.remove({_id: objectId});
        } catch (error) {
            return {error: error.message};
        }
    }

    /**
     * Adds the given options to the given base search
     *
     * @param {Object} base Basic search options
     * @param {Object} options Search options that need to be added or override the basic object
     * @returns {Object} The new search options
     */
    generateOptions(base, options) {
        return Object.assign(base, options);
    }
}

function populateQuery(query, populate) {
    if (populate.constructor === String || populate.constructor === Object) {
        query.populate(populate);
    } else if (populate.constructor === Array) {
        for (let i = 0; i < populate.length; i++) {
            query.populate(populate[i]);
        }
    }
}


/*
 Populate examples:
 String:
 'created_by'
 Object (with multilevel populate):
 {
 path: 'friends',
 // Get friends of friends - populate the 'friends' array for every friend
 populate: { path: 'friends' }
 }
 Array:
 [One of the 2 above]
 */


module.exports = Repository;
