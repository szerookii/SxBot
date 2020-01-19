const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const _ = require('lodash');

const apktool = path.resolve(path.join(__dirname, "apktool.jar"));

class Apktool {

  static async decompile(source, output) {
    return new Promise(function(resolve, reject){
      if (!_.isString(source)) {
        return reject(new Error(`Invalid source argument; expected string.`));
      }

      if (_.isUndefined(output)) {
        output = path.join(os.tmpdir(), path.basename(source, '.apk'));
      }

      if (!_.isString(output)) {
        return reject(new Error(`Invalid target argument; expected string`));
      }

      source = path.resolve(source);
      output = path.resolve(output);

      const cmd = `java -jar ${apktool} decode --force -c --output=${output} ${source}`;

      try {
        exec(cmd, (err) => {
          if (err) return reject(err);
          resolve(output);
        });
      }
      catch(err){
        reject(err);
      }
    });
  }

  static async compile(source, output) {
    return new Promise(function(resolve, reject){
      if (!_.isString(source)) {
        return reject(new Error(`Invalid source argument; expected string`));
      }

      if (_.isUndefined(output)) {
        output = path.join(os.tmpdir(), path.basename(source));
      }

      if (!_.isString(output)) {
        return reject(new Error(`Invalid target argument; expected string`));
      }

      source = path.resolve(source);
      output = path.resolve(output);

      const cmd = `java -jar ${apktool} build --force -c --output=${output} ${source}`;

      try {
        exec(cmd, (err) => {
          if (err) return reject(err);
          resolve(output);
        });
      }
      catch(err){
        reject(err);
      }
    });
  }
}

module.exports = Apktool;