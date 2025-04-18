const fs = require("fs");

const instances = {};
let realInstanceCount = 0;

module.exports = class EasyJsonDB {

    /**
     * @typedef {object} SnapshotOptions
     * @property {boolean} [enabled=false] Whether the snapshots are enabled
     * @property {number} [interval=86400000] The interval between each snapshot
     * @property {string} [path='./backups/'] The path of the backups
     */

    /**
     * @typedef {object} DatabaseOptions
     * @property {SnapshotOptions} snapshots
     */

    /**
     * @param {string} filePath The path of the json file used for the database.
     * @param {DatabaseOptions} options
     */
    constructor(filePath, options){
        if (instances[filePath]) {
            // if we return an existing instance, javascript will use it instead
            // see https://stackoverflow.com/questions/11145159/implement-javascript-instance-store-by-returning-existing-instance-from-construc
            return instances[filePath];
        }

        /**
         * The path of the json file used as database.
         * @type {string}
         */
        this.jsonFilePath = filePath || "./db.json";
        instances[filePath] = this;
        realInstanceCount++;

        console.log('New DB Manager created for path:', filePath);
        console.log('Total instances:', realInstanceCount);

        /**
         * The options for the database
         * @type {DatabaseOptions}
         */
        this.options = options || {};

        if (this.options.snapshots && this.options.snapshots.enabled) {
            const path = this.options.snapshots.path || './backups/';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            setInterval(() => {
                this.makeSnapshot();
            }, (this.options.snapshots.interval || 86400000));
        }

        /**
         * The data stored in the database.
         * @type {object}
         */
        this.data = {};

        if(!fs.existsSync(this.jsonFilePath)){
            fs.writeFileSync(this.jsonFilePath, "{}", "utf-8");
        } else {
            this.fetchDataFromFile();
        }
    }

    static _instances = instances;
    static get _realInstanceCount() {
        return realInstanceCount;
    }

    /**
     * Make a snapshot of the database and save it in the snapshot folder
     * @param {string} path The path where the snapshot will be stored
     */
    makeSnapshot (path) {
        path = path || this.options.snapshots.path || './backups/';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        const fileName = `snapshot-${Date.now()}.json`;
        fs.writeFileSync(path.join(path, fileName));
    }

    /**
     * Get data from the json file and store it in the data property.
     */
    fetchDataFromFile(){
        const savedData = JSON.parse(fs.readFileSync(this.jsonFilePath));
        if(typeof savedData === "object"){
            this.data = savedData;
        }
    }

    /**
     * Write data to the json file.
     */
    saveDataToFile(){
        fs.writeFileSync(this.jsonFilePath, JSON.stringify(this.data, null, 2), "utf-8");
    }

    /**
     * Get data for a key in the database
     * @param {string} key 
     */
    get(key){
        return this.data[key];
    }

    /**
     * Check if a key data exists.
     * @param {string} key 
     */
    has(key){
        return Boolean(this.data[key]);
    }
    
    /**
     * Set new data for a key in the database.
     * @param {string} key
     * @param {*} value 
     */
    set(key, value){
        this.data[key] = value;
        this.saveDataToFile();
    }

    /**
     * Set new data locally (not saved to the DB)
     * Save using this.saveDataToFile()
     * @param {string} key
     * @param {*} value 
     */
    setLocal(key, value) {
        this.data[key] = value;
    }

    /**
     * Delete data for a key from the database.
     * @param {string} key 
     */
    delete(key){
        delete this.data[key];
        this.saveDataToFile();
    }

    /**
     * Add a number to a key in the database.
     * @param {string} key 
     * @param {number} count 
     */
    add(key, count){
        if(!this.data[key]) this.data[key] = 0;
        this.data[key] += count;
        this.saveDataToFile();
    }

    /**
     * Subtract a number to a key in the database.
     * @param {string} key 
     * @param {number} count 
     */
    subtract(key, count){
        if(!this.data[key]) this.data[key] = 0;
        this.data[key] -= count;
        this.saveDataToFile();
    }

    /**
     * Push an element to a key in the database.
     * @param {string} key 
     * @param {*} element 
     */
    push(key, element){
        if (!this.data[key]) this.data[key] = [];
        this.data[key].push(element);
        this.saveDataToFile();
    }

    /**
     * Clear the database.
     */
    clear(){
        this.data = {};
        this.saveDataToFile();
    }

    /**
     * Get all the data from the database.
     */
    all(){
        return Object.keys(this.data).map((key) => {
            return {
                key,
                data: this.data[key]
            }
        });
    }

};