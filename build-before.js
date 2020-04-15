const variables = require('dotenv').config({ path: './.env/variables.env' });
const { template } = require('lodash');

const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const colors = require('colors');

function writeFileSyncRecursive(filename, content, charset) {
    const folders = filename.split('/').slice(0, -1);
    if (folders.length) {
        // create folder path if it doesn't exist
        folders.reduce((last, folder) => {
            const folderPath = last ? last + '/' + folder : folder;
            if (!existsSync(folderPath)) {
                mkdirSync(folderPath);
                console.log(folderPath);
            }
            return folderPath;
        })
    }
    writeFileSync(filename, content, charset);
}

module.exports = function (ctx) {
    console.log('Environment variables loaded.');

    const devEnvPath = './src/_environments_/environment.ts';
    const prodEnvPath = './src/_environments_/environment.prod.ts';
    const devTargetEnvPath = './src/environments/environment.ts';
    const prodTargetEnvPath = './src/environments/environment.prod.ts';
    const configXmlPath = './_config_.xml';
    const targetConfigXmlPath = './config.xml';

    const devEnvironments = template(readFileSync(devEnvPath, 'utf8'));
    const prodEnvironments = template(readFileSync(prodEnvPath, 'utf8'));
    const configXml = template(readFileSync(configXmlPath, 'utf8'));

    const newDevEnvironments = devEnvironments(variables.parsed);
    const newProdEnvironments = prodEnvironments(variables.parsed);
    const newConfigXml = configXml(variables.parsed);

    console.log(colors.magenta('The file `environment.ts` will be written with the environment variables.'));
    writeFileSyncRecursive(devTargetEnvPath, newDevEnvironments);

    console.log(colors.magenta('The file `environment.prod.ts` will be written with the environment variables.'));
    writeFileSyncRecursive(prodTargetEnvPath, newProdEnvironments);

    console.log(colors.magenta('The file `config.xml` will be written with the environment variables.'));
    writeFileSyncRecursive(targetConfigXmlPath, newConfigXml);
};