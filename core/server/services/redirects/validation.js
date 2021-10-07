@@ -1,9 +1,10 @@
const _ = require('lodash');
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');

const messages = {
    redirectsWrongFormat: 'Incorrect redirects file format.',
    invalidRedirectsFromRegex: 'Incorrect RegEx in redirects file.',
    redirectsHelp: 'https://ghost.org/docs/themes/routing/#redirects'
};
/**
@ -26,8 +27,19 @@
                help: tpl(messages.redirectsHelp)
            });
        }

        try {
            // each 'from' property should be a valid RegExp string
            new RegExp(redirect.from);
        } catch (error) {
            throw new errors.ValidationError({
                message: tpl(messages.invalidRedirectsFromRegex),
                context: redirect,
                help: tpl(messages.redirectsHelp)
            });
        }
    });
};

module.exports.validate = validate;
