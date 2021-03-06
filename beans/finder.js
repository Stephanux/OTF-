/*
 * GET / POST finding
 * Il s'agit ici d'un Bean générique qui en fonction des données dans
 * l'annuaire otf json est capable de faire un find et de retourner
 * un objet json contenant le resultat de la requête.
 */
var logger = require('log4js').getLogger('finder');
logger.setLevel(GLOBAL.config["LOGS"].level);
var mongoose = require('mongoose');
var genericModel = require('../otf_core/lib/otf_mongooseGeneric');

/*
 * GET users listing.
 */

exports.finder = {
    list: function (req, cb) {
        var t1 = new Date().getMilliseconds();
        // Input security Controle
        if (typeof req.session === 'undefined' || typeof req.session.controler === 'undefined') {
            error = new Error('req.session undefined');
            return cb(error);
        }
        //
        var _controler = req.session.controler;
        var state;
        if (typeof req.session == 'undefined' || typeof req.session.login_info === 'undefined' || typeof req.session.login_info.state === 'undefined')
            state = "TEST";
        else
            state = req.session.login_info.state;
        logger.debug(" Finder.list call");
        sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' List of Users\n\t Your Filter is : *'});
        try {
            var model = GLOBAL.schemas[_controler.data_model];
            model.getDocuments({}, function (err, list_users) {
                logger.debug('liste des utilisateurs :', JSON.stringify(list_users));
                var t2 = new Date().getMilliseconds();
                logger.info('into Finder.list before return cb TIME (ms) : ' + (t2 - t1) + 'ms');
                return cb(null, {result: list_users, "state": state || "TEST", room: _controler.room});
            });
        } catch (err) { // si existe pas alors exception et on l'intègre via mongooseGeneric
            logger.error(err);
        }
    },

    one: function (req, cb) {
        // Input security Controle
        if (typeof req.session === 'undefined' || typeof req.session.controler === 'undefined') {
            error = new Error('req.session undefined');
            return cb(error);
        }
        //
        var _controler = req.session.controler;
        var state;
        if (typeof req.session == 'undefined' || typeof req.session.login_info === 'undefined' || typeof req.session.login_info.state === 'undefined')
            state = "TEST";
        else
            state = req.session.login_info.state
        //@TODO not safety
        logger.debug('Finders.one params  : ', _controler.params);
        //logger.debug('Finders.one params  : ', _controler.params['login'].source);
        logger.debug('Finders.one room    : ', _controler.room);
        logger.debug('Finders.one model   : ' + _controler.data_model);
        logger.debug('Finders.one schema  : ' + _controler.schema);
        // Test emit WebSocket Event
        logger.debug(" One User emmit call");
        sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' List of Users\n\t Your Filter is : *'});
        try {
            var model = GLOBAL.schemas[_controler.data_model];
            model.getDocument(_controler.params, function (err, one_user) {
                logger.debug('liste des utilisateurs :', one_user);
                return cb(null, {result: one_user, "state": state, room: _controler.room});
            });

        } catch (err) { // si existe pas alors exception et on l'intègre via mongooseGeneric
            logger.error(err);
        }
    },

    populate: function (req, cb) {
        // Input security Controle
        if (typeof req.session === 'undefined' || typeof req.session.controler === 'undefined') {
            error = new Error('req.session undefined');
            return cb(error);
        }
        var _controler = req.session.controler;
        var state;
        if (typeof req.session == 'undefined' || typeof req.session.login_info === 'undefined' || typeof req.session.login_info.state === 'undefined')
            state = "TEST";
        else
            state = req.session.login_info.state
        //
        //
        logger.debug(" Finder.list call");
        sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' List of Users\n\t Your Filter is : *'});
        try {
            var model = GLOBAL.schemas[_controler.data_model];
            var _params = { query: _controler.params, ref: _controler.data_ref};
            model.popDocuments(_params, function (err, list) {
                logger.debug('Populate Result  :', list);
                return cb(null, {result: list, "state": state, room: _controler.room});
            });
        } catch (err) { // si existe pas alors exception et on l'intègre via mongooseGeneric
            logger.error(err);
        }
    },

    listMultiSchemas: function (req, cb) {
        var t1 = new Date().getMilliseconds();
        // Input security Controle
        if (typeof req.session === 'undefined' || typeof req.session.controler === 'undefined') {
            error = new Error('req.session undefined');
            return cb(error);
        }
        var _controler = req.session.controler;
        var state;
        if (typeof req.session == 'undefined' || typeof req.session.login_info === 'undefined' || typeof req.session.login_info.state === 'undefined')
            state = "TEST";
        else
            state = req.session.login_info.state
        //
        //
        logger.debug("finder.listMultiSchemas");
        sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' List of Users\n\t Your Filter is : *'});
        var result = {};
        try {
            var listSchemas = _controler.data_model;

            function getDocsMultiSchemas(i, cbk) {
                if (i < listSchemas.length) {
                    var model = GLOBAL.schemas[listSchemas[i]];
                    model.getDocuments({}, function (err, list_datas) {
                        if (err) {
                            console.log('error: ' + err)
                        }
                        else {
                            logger.debug('listes des données des schemas passés en data_model  :', JSON.stringify(list_datas));
                            result[listSchemas[i]] = list_datas;
                            logger.debug('affiche result pour i=' + i + '   : ', result);
                            // L'asynchronicité peut être géré d'une autre façon soit promise soit async, ici récursivité
                            getDocsMultiSchemas(i + 1, cbk);
                        }
                    });
                } else {
                    cbk();
                }
            }

            getDocsMultiSchemas(0, function () {
                var t2 = new Date().getMilliseconds();
                logger.info('into Finder.listMultiSchema before return cb TIME (ms) : ' + (t2 - t1) + 'ms');
                return cb(null, {result: result, "state": state || "TEST", room: _controler.room});
            });
        } catch (err) { // si existe pas alors exception et on l'intègre via mongooseGeneric
            logger.error(err);
        }

    },

    listMultiSchemasAsync : function(req, cb) {
        var async = require('async');
        var t1 = new Date().getMilliseconds();
        // Input security Controle
        if (typeof req.session === 'undefined' || typeof req.session.controler === 'undefined') {
            error = new Error('req.session undefined');
            return cb(error);
        }
        var _controler = req.session.controler;
        var state;
        if (typeof req.session == 'undefined' || typeof req.session.login_info === 'undefined' || typeof req.session.login_info.state === 'undefined')
            state = "TEST";
        else
            state = req.session.login_info.state
        //
        //
        logger.debug("finder.listMultiSchemasAsync");
        sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' List of Users\n\t Your Filter is : *'});
        var result={};
        try {
            var listSchemas = _controler.data_model;
            async.each(listSchemas,
                function (schema, callback) {
                    var model = GLOBAL.schemas[schema];
                    model.getDocuments({}, function (err, list_datas) {
                        if (err) {
                            console.log('error: ' + err)
                        }
                        else {
                            logger.debug('listes des données des schemas passés en data_model  :', JSON.stringify(list_datas));
                            result[schema] = list_datas;
                            logger.debug('affiche result pour schema =' + schema + '   : ', result);
                            callback();
                        }
                    });

                },
                function (err) {
                    var t2 = new Date().getMilliseconds();
                    logger.info('into Finder.listMultiSchemasAsync before return cb TIME (ms) : ' + (t2 - t1) + 'ms');
                    return cb(null, {result: result, "state": state || "TEST", room: _controler.room});
                }
            ); // fin async.each
        } catch (err) {
            logger.error(err);
            return (err, null);
        }
    }
};