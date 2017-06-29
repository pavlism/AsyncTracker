//V1.0

/**
 * The async tracker is used a public sataic object to keep track of async tasks
 * To use this you must first setup the afterLoad event using the .afterLoad(), wheich will fire a funnction when all the Async Tasks have been completed
 * Nest you msut setup the .taskComplete() to fire when the async tasks has been completed
 * 
 * 
 * 
 * The setup for a specific taks involses setting up an afterLoad function by passing in the 
 * asyncTask name (must be unique string) followed by the number of async tasks, then an object that has data that
 * will be passed to the function called when the async task is complete (this is optional)
 * and finally the function to call when all the asnc taks are finished.  This function will have 2 parameters, taskCompleteArgs and afterLoadArgs
 * 
 * 
 * Then you simple need to setup the async trigger that occues when the async task is complete.
 * To do this use .taskComplete() with the same asyncTask name, and an error string.
 *  EXAMPLE
 *     AsyncTracker.afterLoad('EquipmentOrderForm.fileRemoved', deleteFileQ.length, function (taskCompleteArgs, afterLoadArgs) {
 *         errorString = errorString + Lib.Meteor.checkErrorStringArray(loadArgs);
 *         callback(errorString);
 *     });
 *     
 *  AsyncTracker.taskComplete('EquipmentOrderForm.fileRemoved', errorString);   
 * 
 */

   
var log = new Logger('AsyncTracker.js', CLL.error);

AsyncTracker = new (function () {
    this.events = [];

    /**
     * This will setup a function to fire when all the async takss have been completed.
     * The setup for a specific taks involses setting up an afterLoad function by passing in the 
     * asyncTask name (must be unique string) followed by the number of async tasks, then an object that has data that
     * will be passed to the function called when the async task is complete (this is optional)
     * and finally the function to call when all the asnc taks are finished.  This function will have 2 parameters, taskCompleteArgs and afterLoadArgs
     * the taskCompleteArgs comes from the taskCompleteArgs methods and will be an array
     * the afterLoadArgs is simply the args object that is passed into this function
     * 
     * @param event {string} asyncTask name (must be unique string)
     * @param numAsyncTasks {int} The number of async tasks
     * @param args {object} The object the will get passed to the callback as  afterLoadArgs
     * @param callback {function} The array the will be copied
     */
    this.afterLoad = function (asyncTaskName, numAsyncTasks, args ,callback) {
        //validate input
        if (!Lib.JS.isString(asyncTaskName)) {
            log.error("The first paramater (events) must be a string that represents the event to listen too");
        }

        if (Lib.JS.isUndefined(numAsyncTasks) || !Lib.JS.isNumber(numAsyncTasks)) {
            log.error("The second paramater must be a number (numAsyncTasks)");
        }
        
        if(numAsyncTasks <1){
            log.error("numAsyncTasks must be a posative ingeger currently it's:" + numAsyncTasks.toString());
        }
        
        if (Lib.JS.isUndefined(callback) && !Lib.JS.isUndefined(args)) {
            callback = args;
            args = {};
        }

        if (Lib.JS.isUndefined(callback) || !Lib.JS.isFunction(callback)) {
            log.error("The 4th paramater must be a callback function");
        }

        if (Lib.JS.isUndefined(this.events[event])) {
            this.events[asyncTaskName] = [];
        }
        this.events[asyncTaskName] = {event: asyncTaskName, numAsyncTasks: numAsyncTasks, callback: callback, numObjectsLoaded: 0, afterLoadArgs:args};
    };
    /**
     * This function needs to be called when an async task is compelted, it will check to see if all the async tasks have been
     * completed and if they have then it will tell the AsyncTracker to fire the afterLoad's funciton
     * 
     * @param numAsyncTasks {int} The number of async tasks
     * @param args {object} The objects the will get passed to the afterLoad function as an array as taskCompleteArgs
     */
    this.taskComplete = function (asyncTaskName, args) {
        var thisEvent = this.events[asyncTaskName];

        if (Lib.JS.isUndefined(thisEvent)) {
            return false;
        }

        thisEvent.numObjectsLoaded = thisEvent.numObjectsLoaded + 1;
        
        if(Lib.JS.isUndefined(thisEvent.loadArgs)){
            thisEvent.loadArgs = [];
        }
        
        if (!Lib.JS.isUndefined(args)) {
            if(Lib.JS.isUndefined(thisEvent.taskCompleteArgs)){
                thisEvent.taskCompleteArgs = [];
            }
            thisEvent.taskCompleteArgs.push(args);
        }
        
        if (thisEvent.numObjectsLoaded === thisEvent.numAsyncTasks) {
            Lib.JS.remove(this.events, thisEvent);
            thisEvent.callback(thisEvent.taskCompleteArgs, thisEvent.afterLoadArgs);
        }
    };
    //this will remove an async task used after a tasks set is complete so mutiple fireings don't take place
    this.remove = function (listener) {
        Lib.JS.remove(this.events[listener.event], listener);
    };
})();