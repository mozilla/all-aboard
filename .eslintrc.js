module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jasmine": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            2,
            4,
            {
                "SwitchCase": 1
            }
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "quotes": [
            2,
            "single"
        ],
        "semi": [
            2,
            "always"
        ],
        "curly": [
            2,
            "all"
        ],
        "camelcase": [
            2,
            {
                "properties": "always"
            }
        ],
        "eqeqeq": [
            2,
            "smart"
        ],
        "one-var-declaration-per-line": [
            2,
            "always"
        ]
    },
    "globals": {
        "addon": true,
        "require": true,
        "MigrationUtils": true,
        "Services": true
    }
};
