@ -1,32 +1,32 @@
const express = require('../../../../shared/express');
const url = require('url');
const querystring = require('querystring');
const debug = require('@tryghost/debug')('web:shared:mw:custom-redirects');
const config = require('../../../../shared/config');
const urlUtils = require('../../../../shared/url-utils');
const errors = require('@tryghost/errors');
const logging = require('@tryghost/logging');
const redirectsService = require('../../../services/redirects');
const labsService = require('../../../../shared/labs');

const messages = {
    customRedirectsRegistrationFailure: 'Could not register custom redirects.'
};

const _private = {};

let customRedirectsRouter;

/**
 *
 * @param {Object} router instance of Express Router to decorate with redirects
 * @param {Object} redirects valid redirects JSON
 *
 * @returns {Object} instance of express.Router express router handling redirects based on config
 */
_private.registerRoutes = (redirects) => {
_private.registerRoutes = (router, redirects) => {
    debug('redirects loading');

    const redirectsRouter = express.Router('redirects');

    if (labsService.isSet('offers')) {
        redirects.unshift({
            from: '/zimo50',
@ -61,7 +61,7 @@ _private.registerRoutes = (redirects) => {
        }

        debug('register', redirect.from);
        redirectsRouter.get(new RegExp(redirect.from, options), function (req, res) {
        router.get(new RegExp(redirect.from, options), function (req, res) {
            const maxAge = redirect.permanent ? config.get('caching:customRedirects:maxAge') : 0;
            const toURL = url.parse(redirect.to);
            const toURLParams = querystring.parse(toURL.query);
@ -91,36 +91,37 @@

    debug('redirects loaded');

    return redirectsRouter;
    return router;
};

const loadRoutes = () => {
    try {
        customRedirectsRouter = express.Router('redirects');

        const redirects = redirectsService.loadRedirectsFile();
        redirectsService.validate(redirects);

        const redirectsRouter = _private.registerRoutes(redirects);
        customRedirectsRouter = redirectsRouter;
        _private.registerRoutes(customRedirectsRouter, redirects);
    } catch (err) {
        if (errors.utils.isIgnitionError(err)) {
            logging.error(err);
        } else {
            logging.error(new errors.IncorrectUsageError({
                message: messages.customRedirectsRegistrationFailure,
                context: err.message,
                help: 'https://ghost.org/docs/themes/routing/#redirects',
                err
            }));
        }
    }
};

/**
 * - you can extend Ghost with a custom redirects file
 * - see https://github.com/TryGhost/Ghost/issues/7707 and https://ghost.org/docs/themes/routing/#redirects
 * - file loads synchronously, because we need to register the routes before anything else
 */
exports.use = function use(siteApp) {
    loadRoutes();

    // Recommended approach by express, see https://github.com/expressjs/express/issues/2596#issuecomment-81353034.
